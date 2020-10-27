

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
--		
-- Example Call:
-- exec spLocal_EY_DxH_Get_InterShiftData 416, '2020-04-01', 14

--
CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Get_InterShiftData_new_1]
--Declare
	@Asset_Id		INT,
	@Production_Day Datetime,
	@Shift_Id		Int
AS

BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;

--Select @Asset_Id = 1,
--	@Production_Day = '2019-07-25',
--	@Shift_Code = '3'

Declare @Shifts_To_Consider table
	(
	Id					Int Identity,
	production_day		Datetime,
	shift_code			Varchar(100),
	shift_name			Varchar(100),
	shift_sequence		Int,
	shift_start			Datetime,
	shift_end			Datetime,
	message				Varchar(256)
	);

Declare 
	@Production_Day_Offset_Minutes		Int,	
	@Site_Timezone						Varchar(100),	
	@Calendar_Day_Start					Datetime,	
	@json_out							nVarchar(max),
	@MaxShiftSequence					Int,
	@Row								Int,
	@Rows								Int,
	@Previous_Shifts_To_Include			Int,
	@Site_Id							Int,
	@Shift_Code							VARCHAR(100),
	@Previous_Day						Datetime;

Select 
@Previous_Day = dateadd(day,-1,@Production_Day),
@Shift_Code = shift_Code
From dbo.Shift st with (nolock)
Where shift_id = @Shift_Id

SELECT @Site_Id = asset_id
FROM [dbo].[Asset] WHERE asset_level = 'Site' AND site_code = (SELECT site_code FROM [dbo].[Asset] WHERE asset_id = @Asset_Id);

Select 
@Production_Day_Offset_Minutes = convert(Int, production_day_offset_minutes),
@Site_Timezone = site_timezone
From dbo.CommonParameters cpt with (nolock)
Where site_id = @Site_Id AND status = 'Active';

Select @MaxShiftSequence = max(shift_sequence)
From dbo.Shift with (nolock)

Select @Calendar_Day_Start = dateadd(minute,@Production_Day_Offset_Minutes,@Production_Day)
--Select @Calendar_Day_Start

Select @Shift_Code = shift_code from dbo.Shift where shift_id = @Shift_Id;

Select @Previous_Shifts_To_Include = 2 

--Get the current shift and any prior shifts in the current Production Day 
Insert @Shifts_To_Consider
	Select 
		@Production_Day,
		s.shift_code,
		s.shift_name,
		s.shift_sequence,
		case 
			when shift_sequence = 1 then  @Calendar_Day_Start
			else dateadd(hour, convert(Int,datepart(hour,start_time)),'2019-10-12')
		end as 'shift_start',
		Null as 'shift_end',
		Null as 'message'
	From dbo.Shift s with (nolock)
	Where s.shift_sequence <= 
		(
		Select s2.shift_sequence 
		From dbo.Shift s2 with (nolock) 
		Where s2.shift_id = @Shift_Id 
		And s2.status = 'Active'
		)
		And s.asset_id = @Site_Id
		And s.status = 'Active'
	Order By
		s.shift_sequence desc

--Always include the current shift passed in
Update @Shifts_To_Consider
Set message = 'Include'
Where production_day = @Production_Day
	And shift_code = @Shift_Code

--Get the shifts for three days prior to Production Day (to cover across weekends)
Select @Row = 1
Select @Rows = 3

While @Row <= @Rows
Begin
	Insert @Shifts_To_Consider
		Select 
			@Production_Day - @Row,
			s.shift_code,
			s.shift_name,
			s.shift_sequence,
			case 
				when shift_sequence = 1 then  @Calendar_Day_Start - @Row
				else dateadd(hour, convert(Int,datepart(hour,start_time)),@Production_Day - @Row)
			end as 'shift_start',
			Null as 'shift_end',
			Null as 'message'
		From dbo.Shift s with (nolock)
		Where s.status = 'Active'
		Order By
			s.shift_sequence desc

	Set @Row = @Row + 1

End

--mark the desired number of previous shifts
Set @Row = 1
While @Row <= @Previous_Shifts_To_Include
Begin
	Update @Shifts_To_Consider
	Set message = 'Include'
	From @Shifts_To_Consider stc,
		(
		Select top 1
			Id
		From @Shifts_To_Consider stc2
		Where message is Null
		Order By
			production_day desc,
			shift_start desc
		) s
	Where stc.id = s.Id

	Set @Row = @Row + 1
End

-- If the asset is not in use for a few days (weekends, major maintenance, low demand), you may want that older 
-- InterShiftData when you start using that asset again. 
-- For purposes of including X previous shifts on the dashboard, older shifts may be included if there was no production 
-- on that asset (and no InterShiftData). Note that initially, only the last 3 days are being considered

Update @Shifts_To_Consider
Set message = 'Had Production'
From @Shifts_To_Consider stc,
	dbo.DxHData dxh with (nolock),
	dbo.ProductionData pd with (nolock)
Where stc.production_day = dxh.production_day
	And stc.shift_code = dxh.shift_code
	And dxh.dxhdata_id = pd.dxhdata_id
	And dxh.asset_id = @Asset_Id
	And stc.message is Null

-- unmark the previous shifts if they don't have production to extend the window and allow some older shifts
-- but don't unmark them if they have IntershiftData
Update @Shifts_To_Consider
Set message = Null
From @Shifts_To_Consider stc
Where message = 'Include'
	And not exists
	(
	Select  
		dxh.dxhdata_id
	From dbo.DxHData dxh with (nolock),
		dbo.ProductionData pd with (nolock)
	Where stc.production_day = dxh.production_day
		And stc.shift_code = dxh.shift_code
		And dxh.dxhdata_id = pd.dxhdata_id
		And dxh.asset_id = @Asset_Id
	)
	And not exists
	(
	Select intershift_id
	From dbo.InterShiftData isd with (nolock)
	Where isd.production_day = stc.production_day
		And isd.shift_code = stc.shift_code
		And isd.asset_id = @Asset_Id
	)
	--do not unmark the current shift
	And (stc.production_day <> @Production_Day And stc.shift_code <> @Shift_Code)

Select @Row = count(*)
From @Shifts_To_Consider stc
Where message = 'Include'
	--do not count the current shift
	And (stc.production_day <> @Production_Day And stc.shift_code <> @Shift_Code)

If IsNull(@Row,-1) < 0
Begin
	Set @Row = 0
End

While @Row < @Previous_Shifts_To_Include
Begin
	Update @Shifts_To_Consider
	Set message = 'Include'
	From @Shifts_To_Consider stc,
		(
		Select top 1
			Id
		From @Shifts_To_Consider stc2
		Where message = 'Had Production'
		Order By
			production_day desc,
			shift_start desc
		) s
	Where stc.id = s.Id

	Set @Row = @Row + 1

End

SELECT 
		isd.intershift_id,			
		isd.asset_id,
		isd.production_day,
		isd.shift_code,
		stc.shift_name,
		stc.shift_start,
		stc.shift_end,
		isd.comment,
		isd.entered_by,
		isd.entered_on at time zone 'UTC' at time zone @Site_Timezone,
		isd.first_name,
		isd.last_name
	From dbo.InterShiftData isd with (nolock),
		@Shifts_To_Consider stc
	Where isd.asset_id = @Asset_Id
		And isd.production_day = stc.production_day
		And isd.shift_code = stc.shift_code
		And stc.message = 'Include'
	Order By 
		stc.shift_start desc			

END


/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_OrderData]    Script Date: 4/12/2019 15:17:29 ******/
SET ANSI_NULLS ON
