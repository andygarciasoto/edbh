--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Put_ProductionData
--
--  Purpose:

--	Given a dxhdata_id and needed production info, store the production data
--
--	If the @Override field is Null or 0, then it is a new insert or an increment
--	If the @Override field is Not Null and Not 0, it is an Override. The existing value of Actual 
--		will be replaced. The value of @Override is the productiondata_id to be updated
--
--	Returns a status and a message
--		 0 is pass
--		-1 is fail
--	
--	The first production insert in an hour for each order is where the ideal and target 
--	are calculated. Any data sent for the same order in that hour will just increment the actual.
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
--	20190809		C00V00 - Intial code created		
--	20191204		C00V01 - Change CommonParameters to CommonParameters		
--		
-- Example Call:
-- exec spLocal_EY_DxH_Put_ProductionData 261042, 30, 10, 2, 18, '123456789123', Null, Null, '2019/11/26 12:18', 1, 17015
--
CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Put_ProductionData_New_1]
--Declare
	@DxHData_Id				Int,			-- the hour Id
	@Actual					Float,			-- to be inserted, increment exisiting Actual, or replace if Override
	@Setup_Scrap			Float,			-- to be inserted, increment exisiting Actual, or replace if Override
	@Other_Scrap			Float,			-- to be inserted, increment exisiting Actual, or replace if Override
	@Adjusted_Actual		Float,			-- to be inserted, increment exisiting Actual, or replace if Override
	@Clock_Number			Varchar(100),	-- used to look up First and Last, leave blank if you have first and last
	@First_Name				Varchar(100),	-- 
	@Last_Name				Varchar(100),	--
	@Timestamp				Datetime,		-- generally current time but note it is used to find break and lunch time
	@Override				Int				-- generally Null or 0, send the productiondata_id for update/replacing Actual
AS
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
	setup_scrap					Float,
	other_scrap					Float,
	adjusted_actual				Float,
	message						Varchar(100),
	name						Varchar(100)
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
	@ProductionData_Id				Int,
	@Existing_Actual				Float,
	@Existing_Setup_Scrap			Float,
	@Existing_Other_Scrap			Float,
	@Existing_Adjusted_Actual		Float,
	@ReturnStatus					Int,
	@ReturnMessage					Varchar(1000),
	@Asset_Id						INT,
	@Site_Id						INT,
	@OrderNumber					Varchar(100),
	@Order_Id						Int,
	@Product_Code					Varchar(100),
	@UOM_Code						Varchar(100),
	@Routed_Cycle_Time				Float,
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
	@Shift_Sequence					Int

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

If IsNull(@Actual,-1) < 0
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Actual ' + convert(varchar,IsNull(@Actual,-1))
		Goto ErrExit
End

If IsNull(@Setup_Scrap,-1) < 0
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Setup Scrap ' + convert(varchar,IsNull(@Setup_Scrap,-1))
		Goto ErrExit
End

If IsNull(@Other_Scrap,-1) < 0
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Other Scrap' + convert(varchar,IsNull(@Other_Scrap,-1))
		Goto ErrExit
End

If IsNull(@Adjusted_Actual,-1) < 0
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Adjusted Actual ' + convert(varchar,IsNull(@Adjusted_Actual,-1))
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

If 
	(IsNull(@Override,0) <> 0) 
	And 
	(not exists (Select productiondata_id From dbo.ProductionData with (nolock) Where productiondata_id = IsNull(@Override,-1)))
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Override ' + convert(varchar,IsNull(@Override,''))
		Goto ErrExit
End

-- Find the Order for this asset at this time 
Select top 1
	@Order_Id = o.order_id,
	@OrderNumber = o.order_number,
	@Product_Code = o.product_code,
	@UOM_Code = o.UOM_code,
	@Order_Quantity = o.order_quantity,
	@Routed_Cycle_Time = o.routed_cycle_time,
	@Target_Percent_Of_Ideal = o.target_percent_of_ideal
From dbo.OrderData o with (nolock),
	dbo.DxHData dxh with (nolock)
Where dxh.dxhdata_id = @DxHData_Id
	And o.asset_id = dxh.asset_id	
	And o.is_current_order = 1
Order By
	o.start_time desc

-- If there is no is_current_order = 1, try using Timestamp
If IsNull(@OrderNumber,'') = ''
Begin
	Select top 1
		@Order_Id = o.order_id,
		@OrderNumber = o.order_number,
		@Product_Code = o.product_code,
		@UOM_Code = o.UOM_code,
		@Order_Quantity = o.order_quantity,
		@Routed_Cycle_Time = o.routed_cycle_time,
		@Target_Percent_Of_Ideal = o.target_percent_of_ideal
	From dbo.OrderData o with (nolock),
		dbo.DxHData dxh with (nolock)
	Where dxh.dxhdata_id = @DxHData_Id
		And o.asset_id = dxh.asset_id	
		And o.start_time < @Timestamp
		And 
			(
			o.end_time > @Timestamp
			Or
			o.end_time is Null
			)
	Order By
		o.start_time desc
End

If IsNull(@OrderNumber,'') = ''
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Current Order not found for asset ' + convert(varchar,IsNull(@Asset_Id,''))
		Goto ErrExit
End


SELECT @Site_Id = asset_id
FROM [dbo].[Asset] WHERE asset_level = 'Site' AND site_code = (SELECT site_code FROM [dbo].[Asset] WHERE asset_id=@Asset_Id);


-- Now to decide if it is an insert or some kind of update
-- If there is a productiondata row for this hour and order, then it is an update (increment or override)
-- If not, it is an insert

Select @ProductionData_Id = pd.productiondata_id,
	@Existing_Actual = pd.actual,
	@Existing_Setup_Scrap = pd.setup_scrap,
	@Existing_Other_Scrap = pd.other_scrap
From dbo.ProductionData pd with (nolock)
Where pd.dxhdata_id = @DxHData_Id
	And pd.order_id = @Order_Id

If IsNull(@ProductionData_Id,0) > 0 
--Since it already exixts, this is an update, either an increment existing or replace if an override
Begin

	--Increment 
	If IsNull(@Override,0) = 0
	Begin
		Update dbo.ProductionData
		Set actual = @Existing_Actual + @Actual,
			setup_scrap = @Existing_Setup_Scrap + @Setup_Scrap,
			other_scrap = @Existing_Other_Scrap + @Other_Scrap,
			last_modified_by = @Initials,
			last_modified_on =  GETDATE()
		From dbo.ProductionData pd
		Where pd.productiondata_id = @ProductionData_Id

		Select 
			@ReturnStatus = 0,
			@ReturnMessage = 'Incremented ' + convert(varchar,@ProductionData_Id)

	End
	Else
	Begin		
		-- If there already is a productiondata row and this is an override, then they should match  
		If IsNull(@Override,0) <> IsNull(@ProductionData_Id,0) 
		Begin
			Select 
				@ReturnStatus = -1,
				@ReturnMessage = 'Invalid Override ' + convert(varchar,IsNull(@Override,''))
				Goto ErrExit
		End
		-- If it makes it to here, then override/replace existing with @Actual 
		--
		Update dbo.ProductionData
		Set actual = @Actual,
			setup_scrap = @Setup_Scrap,
			other_scrap = @Other_Scrap,
			last_modified_by = @Initials,
			last_modified_on =   GETDATE()
		From dbo.ProductionData pd
		Where pd.productiondata_id = @ProductionData_Id

		Select 
			@ReturnStatus = 0,
			@ReturnMessage = 'Override ' + convert(varchar,@ProductionData_Id)
	End


End --if ProductionData_Id exists
Else
--do an insert, including computing ideal and target
Begin

	Insert @Output
		Select 
			Null,
			@DxHData_Id,
			@Product_Code,
			Null as 'Ideal',
			Null as 'Target',
			@Actual,
			@UOM_Code,
			@Order_Id,
			@OrderNumber,
			@Timestamp, 
			Null,
			@Initials,
			getDate(),
			@Initials,
			getDate(),
			@Setup_Scrap,
			@Other_Scrap,
			@Adjusted_Actual,
			Null,
			@First_Name + ' ' + @Last_Name

	--Compute Ideal and target	
	-- 
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
	
	--Remaining Quantity adjusted to not run out until a new Order is scanned
	--Select @Remaining_Quantity = 9999

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
	From dbo.Shift
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
			From dbo.Shift
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

	Update @Output
	Set name = @First_Name + ' ' + @Last_Name  

	If (convert(Int,(@TotalRemaining_Minutes * 60.0) / @Routed_Cycle_Time)) > @Remaining_Quantity
	Begin
		Update @Output
		Set Ideal = @Remaining_Quantity
	End
	Else
	Begin
		Update @Output
		Set Ideal = (@TotalRemaining_Minutes * 60.0) / @Routed_Cycle_Time
	End

	--Target
	If (convert(Int,((@Remaining_Minutes * 60.0) / @Routed_Cycle_Time) * @Target_Percent_Of_Ideal)) > @Remaining_Quantity
	Begin
		Update @Output
		Set Target = @Remaining_Quantity
	End
	Else
	Begin
		Update @Output
		Set Target = ((@Remaining_Minutes * 60.0) / @Routed_Cycle_Time) * @Target_Percent_Of_Ideal
	End

	Insert dbo.ProductionData
		Select 
			dxhdata_id, 
			product_code, 
			ideal,
			target,
			actual,
			UOM_code,
			order_id,
			order_number,
			start_time,
			end_time,
			entered_by, 
			entered_on, 
			last_modified_by, 
			last_modified_on,
			setup_scrap,
			other_scrap,
			name
		From @Output			

		Set @ProductionData_Id =  SCOPE_IDENTITY()

		Select 
			@ReturnStatus = 0,
			@ReturnMessage = 'Inserted ' + convert(varchar,@ProductionData_Id)

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