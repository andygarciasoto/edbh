/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_InterShiftData]    Script Date: 22/2/2021 20:44:36 ******/
--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_InterShiftData
--
--  Purpose:
--	Given an asset, a Production_Day, and a shift code, get the intershift data for the current shift and 
--		the 2 (note the number of shifts could change) previous shifts and pass it to the dashboard display
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
--		Assumes that 3 days plus the current sift and the shifts in the current day 
--		are enough to get all desired InterShiftData
--- 
--  Dependencies: 
---	None
---
--  Variables:
---
---
--  Tables Modified:
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20190731		C00V00 - Intial code created		
--	20190822		C00V01 - Adjusted output of datetimes to site_timezone
--  20191203		C00V02 - Change Asset_Code for Asset_Id
--	20191204		C00V03 - Change CommonParameters to CommonParameters
--	20191210		C00V04 - Change Shift_Code to Shift_Id because this information is from the database
--	20200415		C00V05 - Change logic to create new way to get the information
--	20210222		C00V06 - Change production day and shift id for start time and end time to search intershift data
--		
-- Example Call:
-- exec spLocal_EY_DxH_Get_InterShiftData 35, 1,'2021-02-21 23:00', '2021-02-22 23:00'
--
CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Get_InterShiftData]
--Declare
@Site_Id		INT,
@Asset_Id		INT,
@Start_Datetime	DATETIME,
@End_Datetime	DATETIME
AS
    BEGIN
        -- SET NOCOUNT ON added to prevent extra result sets from
        -- interfering with SELECT statements.
        SET NOCOUNT ON;
		DECLARE
		@start_utc	DATETIME,
		@end_utc	DATETIME,
		@timezone	NVARCHAR(100);

		SELECT
			@start_utc = @Start_Datetime AT TIME ZONE CP.site_timezone  AT TIME ZONE 'UTC',
			@end_utc = @End_Datetime AT TIME ZONE CP.site_timezone  AT TIME ZONE 'UTC',
			@timezone = CP.site_timezone
		FROM dbo.CommonParameters CP
		WHERE CP.site_id = @Site_Id;

		SELECT
			ISH.intershift_id,
			ISH.asset_id,
			ISH.production_day,
			ISH.shift_code,
			ISH.comment,
			ISH.entered_by,
			CONVERT(VARCHAR, ISH.entered_on AT TIME ZONE 'UTC' AT TIME ZONE @timezone) AS entered_on,
			ISH.first_name,
			ISH.last_name
		FROM dbo.InterShiftData ISH
		WHERE
			ISH.asset_id = @Asset_Id AND
			ISH.entered_on >= @start_utc AND
			ISH.entered_on < @end_utc
		ORDER BY ISH.entered_on;
    END;
