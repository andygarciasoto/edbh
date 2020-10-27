


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
--		
-- Example Call:
-- Exec dbo.spLocal_EY_DxH_Get_DxHDataId 69, '2020-01-07 10:23', 0
--

CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Get_DxHDataId]
--Declare
	@Asset_Id				INT,
	@Timestamp				Datetime,
	@RequireOrderToCreate	Bit
AS

--Select @Asset_Id = 1,
----@Timestamp = '2019-07-25 02:23',
--@Timestamp = '2019-08-28 15:23',
--	@RequireOrderToCreate = 0
------	@RequireOrderToCreate = 1


BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;

--Select @Asset_Id = 1,
--	@Timestamp = '2019-07-25 02:23',
--	@RequireOrderToCreate = 0
----	@RequireOrderToCreate = 1

Declare @Output table
	(
	Id								Int Identity,
	asset_id						INT,
	timestamp						Datetime,
	dxhdata_id						Int,
	production_day					Datetime,
	shift_code						Varchar(100),
	hour_interval					Varchar(100),
	message							Varchar(100)
	)

Declare 
	@DxHData_Id							Int,
	@Shift_Code							Varchar(100),
	@Production_Day						Datetime,	
	@Production_Day_Offset_Minutes		Int,	
--	@Calendar_Day_Start					Datetime,	
	@json_out							nVarchar(max),
	@MaxShiftSequence					Int,
	@Row								Int,
	@Rows								Int,
--	@Previous_Shifts_To_Include			Int,
	@Timestamp_Hour						Int,
	@IsFirst							Bit,
	@Shift_Start_Hour					Int,
	@Shift_End_Hour						Int,
	@Hour_Interval						Varchar(100),
	@TSHourStart						Datetime,
	@TSHourEnd							Datetime,
	@Site_id							Int

SELECT @Site_Id = asset_id
FROM [dbo].[Asset] WHERE asset_level = 'Site' AND site_code = (SELECT site_code FROM [dbo].[Asset] WHERE asset_id = @Asset_Id);

Select @Production_Day_Offset_Minutes = convert(Int, production_day_offset_minutes)
From dbo.CommonParameters cpt with (nolock)
Where site_id = @Site_Id AND status = 'Active';

Set @Timestamp_Hour = datepart(hour, @Timestamp)
Set @Row = @Timestamp_Hour 
Set @Rows = 24 + @Row

-- Given a Timestamp, determine the Shift_Code
-- find the end time of the shift containing the hour of the @Timestamp
While @Row <= @Rows
Begin
	-- If Timestamp is in the first hour of a shift, then we know the shift already
	If exists (Select shift_id From dbo.Shift with (nolock) Where datepart(hour,start_time) = @Timestamp_Hour and 
	asset_id = @Site_Id)
	Begin
		Select @Shift_Code = shift_code
		From dbo.Shift with (nolock) 
		Where datepart(hour,start_time) = @Row
			And status = 'Active' And asset_id = @Site_Id
--		Select @Shift_Code, ' In start Loop', datepart(hour,end_time) as 'Hour End Time' From dbo.Shift with (nolock) Where datepart(hour,end_time) = @Row
		break
	End

	--If Timestamp is not in the first hour of a shift, then keep adding an hour until you find the end_time
	If exists (Select shift_id From dbo.Shift with (nolock) Where datepart(hour,end_time) = @Row
	and asset_id = @Site_Id)
	Begin
		Select @Shift_Code = shift_code
		From dbo.Shift with (nolock) 
		Where datepart(hour,end_time) = @Row
			And status = 'Active' and asset_id = @Site_Id
--		Select @Shift_Code, ' In Loop', datepart(hour,end_time) as 'Hour End Time' From dbo.Shift with (nolock) Where datepart(hour,end_time) = @Row
		break
	End

	Set @Row = @Row + 1

End

Select 
	@Shift_Start_Hour = datepart(hour,start_time),
	@Shift_End_Hour = datepart(hour,end_time),
	@IsFirst = is_first_shift_of_day 
From dbo.Shift with (nolock)
Where shift_code = @Shift_Code
	And status = 'Active'

Select @MaxShiftSequence = max(shift_sequence)
From dbo.Shift with (nolock)

--Given a Timestamp, determine the production day
--only one shift can span midnight and it is either the first shift or the last one
If @IsFirst = 1
Begin
	--Is the Timestamp Hour before midnight 
	If @Production_Day_Offset_Minutes < 0
	Begin
		If (@Shift_Start_Hour > @Shift_End_Hour) -- means that started before midnight and ended after
			And (@Timestamp_Hour >= @Shift_Start_Hour ) -- means that timestamp is before midnight

		Begin
			Set @Production_Day = convert(varchar(10),dateadd(day,1,@Timestamp),121) 	
--			select 'Should be here'
		End
		Else
		Begin
			Set @Production_Day = convert(varchar(10),@Timestamp,121) 
		End
	End
	
	Else
	--If it is the first shift and the offset is greater than or equal to 0, then the production day is the same
	-- as the calendar day of the Timestamp
	Begin
		Set @Production_Day = convert(varchar(10),@Timestamp,121) 
	End

End
Else
Begin
	If (Select shift_sequence from dbo.Shift Where shift_code = @Shift_Code And status = 'Active') = @MaxShiftSequence --the last shift
		And (@Shift_Start_Hour > @Shift_End_Hour) --so end is after midnight
	Begin

		--Is the Timestamp Hour after midnight 
		If @Production_Day_Offset_Minutes > 0
		Begin
			If @Timestamp_Hour <= @Shift_End_Hour	--example 1 am timestamp and 2 am end
			Begin
				Set @Production_Day = convert(varchar(10),dateadd(day,-1,@Timestamp),121) 	
			End
			Else
			Begin
				Set @Production_Day = convert(varchar(10),@Timestamp,121) 
			End
		End
	
		Else
		--If it is the last shift and the offset is greater than or equal to 0, then the production day is the same
		-- as the calendar day of the Timestamp
		Begin
			Set @Production_Day = convert(varchar(10),@Timestamp,121) 
		End

	End

	Else
		--not first and not last so then the production day is the same as the calendar day of the Timestamp
	Begin
		Set @Production_Day = convert(varchar(10),@Timestamp,121) 
	End

End

--Set @TSHourStart = convert(datetime,convert(varchar(14),@Timestamp)+':00',121)
--Set @TSHourEnd = convert(datetime,convert(varchar(14),dateadd(hour,1,@Timestamp))+':00',121)

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

Insert @Output
		(
		asset_id,
		timestamp,
		dxhdata_id,
		production_day,
		shift_code,
		hour_interval,
		message
		)
	Select 
		@Asset_Id,
		@Timestamp,
		Null,
		@Production_Day,
		@Shift_Code,
		@Hour_Interval,
		Null

--Select * From @Output
--return

Select @DxHData_Id = dxh.dxhdata_id
From dbo.DxHData dxh with (nolock)
Where dxh.asset_id = @Asset_Id
	And dxh.production_day = @Production_Day
	And dxh.shift_code = @Shift_Code
	And dxh.hour_interval = @Hour_Interval

If IsNull(@DxHData_Id,0) <= 0
Begin
	------------ Need to look up orders here if this is to be used for hourly stuff
	If IsNull(@RequireOrderToCreate,0) < 1
	Begin
		Insert dbo.DxHData
			(
			asset_id,
			production_day,
			hour_interval,
			shift_code,
			entered_by, 
			entered_on, 
			last_modified_by, 
			last_modified_on
			)
		Select 
			@Asset_Id,
			@Production_Day,
			@Hour_Interval,
			@Shift_Code,
			'spLocal_EY_DxH_Get_DxHDataId',
			getdate(),
			'spLocal_EY_DxH_Get_DxHDataId',
			getdate()

		Set @DxHData_Id = SCOPE_IDENTITY()

	End 
End

Update @Output
Set dxhdata_id = @DxHData_Id
From dbo.DxHData dxh with (nolock)
Where dxh.asset_id = @Asset_Id
	And dxh.production_day = @Production_Day
	And dxh.shift_code = @Shift_Code
	And dxh.hour_interval = @Hour_Interval

If exists (Select Id From @Output Where dxhdata_id is Null)
Begin
	Update @Output 
	Set message = 'No Data'
	From @Output
	Where asset_id = @Asset_Id
		And production_day = @Production_Day
		And	shift_code = @Shift_Code
End	

If not exists (Select Id From @Output)
Begin
	Insert @Output (asset_id,production_day,shift_code,message)
		Select
			@Asset_Id,
			@Production_Day,
			@Shift_Code,
			'No Data' 
End	
Select @json_out = 
	(
	Select 

		asset_id,
		timestamp,
		dxhdata_id,
		production_day,
		shift_code,
		hour_interval,
		message

	From @Output o 
	For Json path, INCLUDE_NULL_VALUES
	)

Select @json_out as 'GetDxHDataId'

--Select * From @Output
--Select * From @Shifts_To_Consider

Return

END


/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_InterShiftData]    Script Date: 4/12/2019 15:17:10 ******/
SET ANSI_NULLS ON
