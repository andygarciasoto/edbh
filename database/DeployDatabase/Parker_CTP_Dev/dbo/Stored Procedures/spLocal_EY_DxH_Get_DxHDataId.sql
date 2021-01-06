


--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_DxHDataId
--
--  Purpose:

--	Given an asset and a timestamp, return the existing dxhdata_id, production_day, hour_interval, and shift_code 
--	or create a new one and return that same info.
--
--	This code could be used as part of the start of the new hour process but ... it would need to have an open order 
--	to allow creating a row. So... using RequireAnOrderToCreate
--			Send 1 if this is called as as part of the start of the new hour process
--			Send 0 if you have some data like productiondata, comment, or possibly timelost
--
--	To Do:
--
--  Output Parameters:
---
--  Input Parameters:
--- None
---
---	
--  Trigger:
---
--  Data Read Other Inputs:  
--- 
---	
--  Data Written Results:
---
--  Assumptions:
--- 
--  Dependencies: 
---	None
---
--  Variables:
---
---
--  Tables Modified:
--	Possibly DxHData
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20190807		C00V00 - Intial code created		
--	20190822		C00V01 - Tweaked Hour_Interval via TSHourStart and End fix
--  20191203		C00V02 - Change Asset_Code for Asset_Id
--	20191204		C00V03 - Change CommonParameters to CommonParameters
--	20201111		C00V04 - Change Insert sentence for merge and add site id and status to the max sequence shift logic
--	20210106		C00V05 - Add new logic to get the production day and the shift code using GetShiftProductionDayFromSiteAndDate Function
--		
-- Example Call:
-- Exec dbo.spLocal_EY_DxH_Get_DxHDataId 69, '2020-01-07 10:23', 0
--

CREATE   PROCEDURE [dbo].[spLocal_EY_DxH_Get_DxHDataId]
--Declare
	@Asset_Id				INT,
	@Timestamp				Datetime,
	@RequireOrderToCreate	Bit
AS
BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;

Declare 
	@DxHData_Id							Int,
	@Shift_Code							Varchar(100),
	@Production_Day						Datetime,
	@Timestamp_Hour						Int,
	@Hour_Interval						Varchar(100),
	@TSHourStart						Datetime,
	@TSHourEnd							Datetime,
	@Site_id							Int;

SELECT @Site_Id = asset_id
FROM [dbo].[Asset] WHERE asset_level = 'Site' AND site_code = (SELECT site_code FROM [dbo].[Asset] WHERE asset_id = @Asset_Id);


Set @Timestamp_Hour = datepart(hour, @Timestamp)

-- New Logic to get production day and shift code
	SELECT
		@Production_Day = ProductionDay,
		@Shift_Code = ShiftCode
	FROM [dbo].[GetShiftProductionDayFromSiteAndDate](@Site_id,@Timestamp);

Set @TSHourStart = convert(datetime,convert(varchar(11),@Timestamp),121)
Set @TSHourStart = dateadd(hour,@Timestamp_Hour,@TSHourStart)
Set @TSHourEnd = dateadd(hour,1,@TSHourStart)

Select @Hour_Interval = 
	lower
	(
		replace(
			convert
				(varchar(15),cast(@TSHourStart as time),100) 
				+ ' - ' 
				+ convert(varchar(15),cast(@TSHourEnd as time),100
				), 
		':00', ''
		)
	)

--Select @Shift_Code, @Production_Day, @Hour_Interval, @TSHourStart
--return

	IF ISNULL(@RequireOrderToCreate,0) < 1
	BEGIN
		MERGE
			dbo.DxHData AS target
			USING (SELECT @Asset_Id, @Production_Day, @Hour_Interval, @Shift_Code, 'spLocal_EY_DxH_Get_DxHDataId', getdate(), 'spLocal_EY_DxH_Get_DxHDataId',getdate()) AS source
			(asset_id, production_day, hour_interval, shift_code, entered_by, entered_on, last_modified_by, last_modified_on)
		ON (target.asset_id = source.asset_id AND target.production_day = source.production_day AND 
			target.hour_interval = source.hour_interval AND target.shift_code = source.shift_code)
				WHEN NOT MATCHED
					THEN INSERT (asset_id, production_day, hour_interval, shift_code, entered_by, entered_on, last_modified_by, last_modified_on)
						VALUES (source.asset_id, source.production_day, source.hour_interval, source.shift_code, source.entered_by, source.entered_on, 
							source.last_modified_by, source.last_modified_on);
	END;
	SELECT 
		asset_id,
		@Timestamp AS timestamp,
		dxhdata_id,
		production_day,
		shift_code,
		hour_interval
	FROM dbo.DxHData dxh with (nolock)
			WHERE dxh.asset_id = @Asset_Id
				AND dxh.production_day = @Production_Day
				AND dxh.shift_code = @Shift_Code
				AND dxh.hour_interval = @Hour_Interval

END

