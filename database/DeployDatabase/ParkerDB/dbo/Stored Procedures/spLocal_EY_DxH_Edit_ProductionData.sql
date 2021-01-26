
--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Edit_ProductionData
--
--  Purpose:

--	Given a dxhdata_id and needed production info, store the production data
--
--		Note this is intended to be called by supervisor level people but the enforcement of
--		that is to be handled by the user interface
--
--	The passed in @Product_Code, @Order_Number, and the Asset_Code associated with the 
--	dxhdata_id must be aligned. If they are not, notthing will be edited.
--
--	Returns a status and a message
--		 0 is pass
--		-1 is fail
--	
--	To Do:
--
--  Output Parameters:
---
--  Input Parameters:
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
--	ProductionData
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20190828		C00V00 - Intial code created		
--	20191203		C00V01 - Change Asset_Code for Asset_Id
--	20191204		C00V02 - Change CommonParameters to CommonParametersTest
--		
-- Example Call:
-- exec spLocal_EY_DxH_Edit_ProductionData 3, 3, '1 1/2L4MNS PS', 18,14,11, '23456', Null,'2477', Null, Null, '2019-07-25 01:02:03'
--
CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Edit_ProductionData]
--Declare
	@DxHData_Id				Int,			-- the hour Id
	@ProductionData_Id		Int,
	@Product_Code			Varchar(100),	-- This can only be different if the order number also changes
	@Ideal					Float,			-- Calculated in SP if routed cycle time is provided 
	@Target					Float,			-- Calculated in SP if routed cycle time is provided
	@Actual					Float,			-- must be non-negative
	@Order_Number			Varchar(100),	-- must align with product code	and asset
	@Routed_Cycle_Time		Float,			-- Leave Null if you want to pass in Ideal and Target
	@Clock_Number			Varchar(100),	-- used to look up First and Last, leave Null if you have first and last
	@First_Name				Varchar(100),	-- leave Null if you send clock number
	@Last_Name				Varchar(100),	-- leave Null if you send clock number
	@Timestamp				Datetime		-- generally current time but note it is used to find break and lunch time
AS

--Select 
--	@DxHData_Id	= 3,
--	@ProductionData_Id = 3,
--	@Product_Code = '1 1/2L4MNS PS',
--	@Ideal = 18,
--	@Target = 14,
--	@Actual = 11,
--	@Order_Number = '23456',
----	@Routed_Cycle_Time = '240',
--	@Clock_Number = '2477',
----	@First_Name = '',
----	@Last_Name = '',
--	@Timestamp = '2019-08-28 16:10'


BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;

Declare @Output table
	(
	Id							Int Identity,
	productiondata_id			Int, 
	dxhdata_id					Int, 
	product_code				Varchar(100), 
	ideal						Float,
	target						Float,
	actual						Float, 
	UOM_code					Varchar(100), 
	order_id					Int,
	order_number				Varchar(100), 
	start_time					Datetime, 
	end_time					Datetime, 
	entered_by					Varchar(100), 
	entered_on					Datetime, 
	last_modified_by			Varchar(100), 
	last_modified_on			Datetime,
	message						Varchar(100)
	)

Declare @Shift_Hours table
	(
	Id					Int Identity,
	shift_code			Varchar(100),
	shift_name			Varchar(100),
	hour_interval		Varchar(100),
	hour_interval_start	Datetime,
	hour_interval_end	Datetime,
	message				Varchar(256)
	)

Declare @BreakLunch_Details table
	(
	Id							Int Identity,
	dxhdata_id					Int,
	shift_code					Varchar(100),
	hour_interval				Varchar(100),
	hour_interval_start			Datetime,
	hour_interval_end			Datetime,
	breaklunch_start_time		Datetime,
	breaklunch_end_time			Datetime,
	breaklunch_minutes			Float,
	mod_breaklunch_start_time	Datetime,
	mod_breaklunch_end_time		Datetime,
	mod_breaklunch_minutes		Float,
	message						Varchar(256)
	)

Declare
	@First							Varchar(50),
	@Last							Varchar(50),
	@Initials						Varchar(50),	
--	@ProductionData_Id				Int,
	@Existing_Actual				Float,
	@ReturnStatus					Int,
	@ReturnMessage					Varchar(1000),
	@Asset_id						INT,
	@OrderNumber					Varchar(100),
	@Existing_OrderNumber			Varchar(100),
	@Order_Id						Int,
--	@Product_Code					Varchar(100),
	@Existing_Product_Code			Varchar(100),
	@UOM_Code						Varchar(100),
--	@Routed_Cycle_Time				Float,
	@Target_Percent_Of_Ideal		Float,
	@Order_Quantity					Float,
	@Produced_Quantity				Float,
	@Remaining_Quantity				Float,
	@Remaining_BreakMinutes			Float,
	@Remaining_Minutes				Float,
	@TotalRemaining_Minutes			Float,
	@Setup_Lookback_Minutes			Float,
	@Shift_Code						Varchar(100),
	@Production_Day					Datetime,
	@Loop							Int,
	@Hours							Int,
	@FirstInt						Int,
	@Production_Day_Offset_Minutes	Int,	
	@IsFirst						Bit,
	@Calendar_Day_Start				Datetime,
	@Shift_Sequence					Int,
	@Site_Id						Int

If not exists (Select dxhdata_id From dbo.DxHData with (nolock) Where dxhdata_id = IsNull(@DxHData_Id,-1))
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid DxHData_Id ' + convert(varchar,IsNull(@DxHData_Id,''))
	Goto ErrExit
End

Select @Shift_Code = shift_code,
	@Production_Day = production_day,
	@Asset_Id = asset_id
From dbo.DxHData dxh with (nolock)
Where dxhdata_id = @DxHData_Id

If not exists (Select productiondata_id From dbo.ProductionData with (nolock) Where productiondata_id = IsNull(@ProductionData_Id,-1))
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid ProductionData_Id ' + convert(varchar,IsNull(@ProductionData_Id,''))
	Goto ErrExit
End

If not exists (Select product_id From dbo.Product with (nolock) Where product_code = IsNull(@Product_Code,''))
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Product Code ' + convert(varchar,IsNull(@Product_Code,''))
	Goto ErrExit
End

If IsNull(@Ideal,0) < 0
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Ideal ' + convert(varchar,IsNull(@Ideal,''))
	Goto ErrExit
End

If IsNull(@Target,0) < 0
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Target ' + convert(varchar,IsNull(@Target,''))
	Goto ErrExit
End

If IsNull(@Actual,0) < 0
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Actual ' + convert(varchar,IsNull(@Actual,''))
	Goto ErrExit
End

If not exists 
	(
	Select order_id 
	From dbo.OrderData with (nolock) 
	Where order_number = IsNull(@Order_Number,'')
		And product_code = IsNull(@Product_Code,'')
		And asset_id = @Asset_Id
	)
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Order Number ' + convert(varchar,IsNull(@Order_Number,''))
	Goto ErrExit
End

Select @Existing_OrderNumber = pd.order_number,
	@Existing_Product_Code = pd.product_code
From dbo.ProductionData pd with (nolock)
Where pd.productiondata_id = @ProductionData_Id

If IsNull(@Routed_Cycle_Time,0) < 0
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Routed Cycle Time ' + convert(varchar,IsNull(@Routed_Cycle_Time,-1))
		Goto ErrExit
End

If 
	(
	IsNull(@Routed_Cycle_Time,0) > 0
	And 
		(
		IsNull(@Ideal,0) > 0
		Or
		IsNull(@Target,0) > 0
		)
	)
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Unexpected combination of values ' + convert(varchar,IsNull(@Routed_Cycle_Time,-1))
		Goto ErrExit
End

If exists (Select Badge From dbo.TFDUsers with (nolock) Where Badge = IsNull(@Clock_Number,-1))
Begin
	Select @First = First_Name,
		@Last = Last_Name
	From dbo.TFDUsers with (nolock) 
	Where Badge = @Clock_Number

	If IsNull(@First_Name,'') = ''
	Begin
		Set @First_Name = @First
	End

	If IsNull(@Last_Name,'') = ''
	Begin
		Set @Last_Name = @Last
	End
End

If IsNull(@First_Name,'') = ''
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid First Name ' + convert(varchar,IsNull(@First_Name,''))
		Goto ErrExit
End

If IsNull(@Last_Name,'') = ''
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Last Name ' + convert(varchar,IsNull(@Last_Name,''))
		Goto ErrExit

End

Select @Initials = convert(varchar,left(@First_Name,1)) +  convert(varchar,left(@last_Name,1))

If IsDate(@Timestamp) <> 1 
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Timestamp ' + convert(varchar,IsNull(@Timestamp,''))
		Goto ErrExit
End

-- Find the Order for this asset at this time 
Select top 1
	@Order_Id = o.order_id,
--	@OrderNumber = o.order_number,	--Different variable name
--	@Product_Code = o.product_code,	--passed in
	@UOM_Code = o.UOM_code,
	@Order_Quantity = o.order_quantity,
--	@Routed_Cycle_Time = o.routed_cycle_time,	--passed in
	@Target_Percent_Of_Ideal = o.target_percent_of_ideal
From dbo.OrderData o with (nolock),
	dbo.DxHData dxh with (nolock)
Where dxh.dxhdata_id = @DxHData_Id
	And o.asset_id = dxh.asset_id	
--	And o.is_current_order = 1	--maybe not active
	And o.order_number = @Order_Number
Order By
	o.start_time desc

-- Now to decide if it is an insert or some kind of update
-- If there is a productiondata row for this hour and order, then it is an update (increment or override)
-- If not, it is an insert

--************* for the Edit this is always an update/override but sometimes the Ideal/Target get recalculated 
--************* based on a new routed cycle time which is in the "insert" section of the Put code

Select --@ProductionData_Id = pd.productiondata_id,
	@Existing_Actual = pd.actual
From dbo.ProductionData pd with (nolock)
Where pd.dxhdata_id = @DxHData_Id
	And pd.order_id = @Order_Id

If IsNull(@Routed_Cycle_Time,0) <= 0 
--The values for Ideal and Target that are passed in should be Null if there is a value for Routed Cycle Time
--And if there is no Routed Cycle Time then there should be values for Ideal and Target 
Begin

	Update dbo.ProductionData
	Set product_code = @Product_Code,
		ideal = @Ideal,
		target = @Target,
		actual = @Actual,
		order_id = @Order_Id,
		order_number = @Order_Number,
		last_modified_by = @Initials,
		last_modified_on =  GETDATE()
	From dbo.ProductionData pd
	Where pd.productiondata_id = @ProductionData_Id

	Select 
		@ReturnStatus = 0,
		@ReturnMessage = 'Edited ' + convert(varchar,@ProductionData_Id)

End --if Routed Cycle Time <= 0
Else
--still do an update but recalc Ideal and Target
Begin

	--Compute Ideal and target	
	-- 

	SELECT @Site_Id = asset_id FROM [dbo].[Asset] WHERE asset_level = 'Site' AND site_code = (SELECT site_code FROM [dbo].[Asset] WHERE asset_id=@Asset_Id);

	If IsNull(@Routed_Cycle_Time,-1) < 0
	Begin
		Select @Routed_Cycle_Time = convert(float,default_routed_cycle_time)
		From dbo.CommonParameters cpt with (nolock)
		Where site_id = @Site_Id AND status = 'Active';
	End

	If IsNull(@Target_Percent_Of_Ideal,-1) < 0
	Begin
		Select @Target_Percent_Of_Ideal = convert(float,default_target_percent_of_ideal)
		From dbo.CommonParameters cpt with (nolock)
		Where site_id = @Site_Id AND status = 'Active';
	End

	-- Remaining Quantity is Order Quantity - Produced
	-- Don't look back to the beginning of time, but this needs to cover the longest time an order can run
	Select @Setup_Lookback_Minutes = convert(float,setup_lookback_minutes)
	From dbo.CommonParameters cpt with (nolock)
		Where site_id = @Site_Id AND status = 'Active';

	Select @Produced_Quantity = sum(Actual)
	From dbo.ProductionData pd with (nolock)
	Where pd.order_id = @Order_Id
		And start_time >= dateadd(minute,-@Setup_Lookback_Minutes,@Timestamp)		
	Group by
		pd.order_id

	Select @Remaining_Quantity = IsNull(@Order_Quantity,0) - IsNull(@Produced_Quantity,0)

	If IsNull(@Remaining_Quantity,0) < 0
	Begin
		Set @Remaining_Quantity = 0
	End
			
	--Remaining time (minus breaks) is from @Timestamp to the end of the hour 

	Select 
		@Loop = 1,
		@Hours = duration_in_minutes/60,
		@IsFirst = is_first_shift_of_day 
	From dbo.Shift with (nolock)
	Where shift_code = @Shift_Code
		And status = 'Active'

	Select @Production_Day_Offset_Minutes = convert(Int, production_day_offset_minutes)
	From dbo.CommonParameters cpt with (nolock)
		Where site_id = @Site_Id AND status = 'Active';

	--Select @Production_Day_Offset_Minutes = 420, @IsFirst = 1

	Select @Calendar_Day_Start = dateadd(minute,@Production_Day_Offset_Minutes,@Production_Day)

	Select 
		@FirstInt = convert(Int,datepart(hour,start_time)),
		@Shift_Sequence = shift_sequence
	From dbo.Shift with (nolock)
	Where shift_code = @Shift_Code
		And status = 'Active'

	While @Loop - 1 < IsNull(@Hours,0)
	Begin

		Insert @Shift_Hours
			Select 
				shift_code,
				shift_name,
				Null as 'hour_interval',
				case 
					when @IsFirst = 1 then dateadd(hour,@Loop - 1, @Calendar_Day_Start)
					when @IsFirst = 0 then dateadd(hour,@Loop - 1 + @FirstInt,@Production_Day)
					else 0 
				end as 'hour_interval_start',
				Null as 'hour_interval_end',
				Null as 'message'
			From dbo.Shift with (nolock)
			Where shift_code = @Shift_Code
				And status = 'Active'
				
		Set @Loop = @Loop + 1

	End

	Update @Shift_Hours
	Set hour_interval_end =  dateadd(hour,1,hour_interval_start) 

	Update @Shift_Hours
	Set hour_interval = 
		lower
		(
			replace(
				convert
					(varchar(15),cast(hour_interval_start as time),100) 
					+ ' - ' 
					+ convert(varchar(15),cast(hour_interval_end as time),100
					), 
			':00', ''
			)
		)

--Select * From @Shift_Hours

	Insert @BreakLunch_Details
		(
		shift_code,
		hour_interval,
		hour_interval_start,
		hour_interval_end,
		breaklunch_start_time,
		breaklunch_end_time,
		breaklunch_minutes
		)
		Select
			dxh.shift_code,
			dxh.hour_interval,
			hour_interval_start,
			hour_interval_end,
			cast(cast(hour_interval_start as date) as datetime) + cast(u.start_time as datetime) as 'breaklunch_start_time',
			cast(cast(hour_interval_start as date) as datetime) + cast(u.end_time as datetime) as 'breaklunch_end_time',
			Null as 'breaklunch_minutes'
		From dbo.DxHData dxh with (nolock),
			dbo.Unavailable u with (nolock),
			@Shift_Hours sh
		Where dxh.asset_id = u.asset_id
			And dxh.dxhdata_id = @DxHData_Id
			And dxh.shift_code = sh.shift_code
			And dxh.hour_interval = sh.hour_interval
			And cast(sh.hour_interval_start as time) <= u.start_time
			And (cast(sh.hour_interval_end as time) > u.start_time or cast(sh.hour_interval_end as time) = '00:00:00')
			And (cast(sh.hour_interval_end as time) > u.end_time or cast(sh.hour_interval_end as time) = '00:00:00')
			And u.status = 'Active'

	Update @BreakLunch_Details
	Set breaklunch_minutes = datediff(minute,breaklunch_start_time,breaklunch_end_time)

	-- Modify the breaklunch times to bound them by the edges of the hour
	-- In this case @Timestamp is the start of the hour
	Update @BreakLunch_Details
	Set mod_breaklunch_start_time = @Timestamp
	Where breaklunch_start_time < @Timestamp
		And mod_breaklunch_start_time is Null

	Update @BreakLunch_Details
	Set mod_breakLunch_start_time = breaklunch_start_time
	Where breaklunch_start_time >= @Timestamp
		And mod_breaklunch_start_time is Null

	Update @BreakLunch_Details
	Set mod_breaklunch_end_time = hour_interval_end
	Where breaklunch_end_time > hour_interval_end
		And mod_breaklunch_end_time is Null

	Update @Breaklunch_Details
	Set mod_breaklunch_end_time = breaklunch_end_time
	Where breaklunch_end_time < hour_interval_end
		And mod_breaklunch_end_time is Null
	  
	Update @BreakLunch_Details
	Set mod_breaklunch_end_time = hour_interval_end
	Where breaklunch_end_time is Null
		And mod_breaklunch_end_time is Null

	Update @BreakLunch_Details
	Set mod_breaklunch_minutes = datediff(minute,mod_breaklunch_start_time,mod_breaklunch_end_time)

	Select @Remaining_BreakMinutes = mod_breaklunch_minutes
	From @BreakLunch_Details

	If IsNull(@Remaining_BreakMinutes,-1) > 60
	Begin
		Set @Remaining_BreakMinutes = 60
	End

	If IsNull(@Remaining_BreakMinutes,-1) < 0
	Begin
		Set @Remaining_BreakMinutes = 0
	End


	Select @Remaining_Minutes = (60 - @Remaining_BreakMinutes) - datepart(minute,@Timestamp)

	If IsNull(@Remaining_Minutes,-1) > 60
	Begin
		Select @Remaining_Minutes = 60
	End

	If IsNull(@Remaining_Minutes,-1) < 0
	Begin
		Select @Remaining_Minutes = 0
	End

	
	Select @TotalRemaining_Minutes = 60 - datepart(minute,@Timestamp)

	If IsNull(@TotalRemaining_Minutes,-1) > 60
	Begin
		Select @TotalRemaining_Minutes = 60
	End

	If IsNull(@TotalRemaining_Minutes,-1) < 0
	Begin
		Select @TotalRemaining_Minutes = 0
	End

	--Ideal
	--If (Remaining Seconds in an hour / Routed Cycle Time) > Remaining Quantity
	--then Ideal = Remaining Quantity 
	--Else Remaining Seconds in an hour / Routed Cycle Time

	If (convert(Int,(@TotalRemaining_Minutes * 60.0) / @Routed_Cycle_Time)) > @Remaining_Quantity
	Begin
		Update @Output
		Set Ideal = convert(Int,@Remaining_Quantity)
	End
	Else
	Begin
		Update @Output
		Set Ideal = convert(Int,(@TotalRemaining_Minutes * 60.0) / @Routed_Cycle_Time)
	End

	--Target
	If (convert(Int,((@Remaining_Minutes * 60.0) / @Routed_Cycle_Time) * @Target_Percent_Of_Ideal)) > @Remaining_Quantity
	Begin
		Update @Output
		Set Target = convert(Int,@Remaining_Quantity)
	End
	Else
	Begin
		Update @Output
		Set Target = convert(Int,((@Remaining_Minutes * 60.0) / @Routed_Cycle_Time) * @Target_Percent_Of_Ideal)
	End

	If (IsNull(@Ideal,-1) >= 0 And IsNull(@Target,-1) >= 0)
	Begin
		Update dbo.ProductionData
		Set product_code = @Product_Code,
			ideal = @Ideal,
			target = @Target,
			actual = @Actual,
			order_id = @Order_Id,
			order_number = @Order_Number,
			last_modified_by = @Initials,
			last_modified_on =  GETDATE()
		From dbo.ProductionData pd
		Where pd.productiondata_id = @ProductionData_Id

		Select 
			@ReturnStatus = 0,
			@ReturnMessage = 'Updated after calc ' + convert(varchar,@ProductionData_Id)
	End
	Else
	Begin
		Select 
			@ReturnStatus = -1,
			@ReturnMessage = 'Problem with calc of Ideal or Target ' + convert(varchar,@ProductionData_Id)

	End
End

ErrExit:

	If @ReturnStatus is Null
	Begin
		Select 
			@ReturnStatus = -1,
			@ReturnMessage = 'Unknown Error'
	End 

	Select 
		@ReturnStatus as 'Return.Status',
		@ReturnMessage as 'Return.Message'
	For Json path, INCLUDE_NULL_VALUES 

--Select * From @BreakLunch_Details
--Select * From @Output
--Select * From @Shift_Hours

Return

END
