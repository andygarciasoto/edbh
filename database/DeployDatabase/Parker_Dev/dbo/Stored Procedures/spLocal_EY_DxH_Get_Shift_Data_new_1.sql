




--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_Shift_Data
--
--  Purpose:
--	Given an asset, a Production_Day, and a shift code, get the data for a full shift and pass it to the dashboard display
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
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20190724		C00V00 - Intial code created		
--	20190814		C00V01 - Add some IDs to the output		
--	20190822		C00V02 - Adjusted output of datetimes to site_timezone, reworked left join		
--	20190823		C00V03 - Added routed cycle time to output		
--	20190903		C00V04 - extended predictive values to include any hour in the shift without production		
--	20190905		C00V05 - adjust predictive values to not reduce predictive remaining quantity from hours before Now
--	20190917		C00V06 - relocated BreakLunch_Details section
--	20190918		C00V07 - setup time for orders without production now uses started, ended, or spanned current hour
--  20191203		C00V08 - Change Asset_Code for Asset_Id
--	20191204		C00V09 - Change CommonParameters to CommonParameters
--	20191204		C00V10 - Change Shift_Code to Shift_Id because this information is from the database
--		
-- Example Call:
-- exec spLocal_EY_DxH_Get_Shift_Data 0,'2019-11-12',2
--
CREATE   PROCEDURE [dbo].[spLocal_EY_DxH_Get_Shift_Data_new_1]
--Declare
	@Asset_Id		INT,
	@Production_Day Datetime,
	@Shift_id		Int
AS
--exec spLocal_EY_DXH_GET_SHIFT_dATA 0, '20191111', 8
--exec spLocal_EY_DxH_Get_Shift_Data 1, '20191101', 9

BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;

--Select @Asset_Id = 1,
--	@Production_Day = '2019-09-18',
--	@Shift_Code = '1'

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

Declare @Output table
	(
	Id								Int Identity,
	dxhdata_id						Int,			
	asset_id						INT,
	production_day					Datetime,
	shift_code						Varchar(100),
	shift_name						Varchar(100),
	hour_interval					Varchar(100),
	hour_interval_start				Datetime,
	hour_interval_end				Datetime,
	summary_product_code			Varchar(100),
	summary_ideal					Float,
	summary_target					Float,				
	summary_actual					Float,
	summary_setup_scrap				Float,
	summary_other_scrap				Float,
	summary_adjusted_actual			Float,				
	cumulative_target				Float,
	cumulative_actual				Float,
	cumulative_setup_scrap			Float,
	cumulative_other_scrap			Float,
	cumulative_adjusted_actual		Float,
	summary_dtminutes				Float,
	summary_dtreason_code			Varchar(100),
	summary_dtreason_name			Varchar(100),
	summary_setup_minutes			Float,
	summary_breakandlunch_minutes	Float,
	summary_comment					Varchar(256),
	operator_signoff				Varchar(100),
	operator_signoff_timestamp		Datetime,
	supervisor_signoff				Varchar(100),
	supervisor_signoff_timestamp	Datetime,
	product_code					Varchar(100),	-- ProductionData
	ideal							Float,			
	target							Float,
	actual							Float,
	setup_scrap						Float,
	other_scrap						Float,
	adjusted_actual					Float,
	UOM_Code						Varchar(100),
	order_number					Varchar(100),
	start_time						Datetime,
	end_time						Datetime,
	dtminutes						Float,			--DTData
	dtminutes_provisional			Float,
	dtreason_code					Varchar(100),
	dtreason_name					Varchar(200),
	comment							Varchar(256),	--CommentData
	first_name						Varchar(100),
	last_name						Varchar(100),
	last_modified_on				Datetime,	
	message							Varchar(256)	
	)

Declare @Production table
	(
	Id						Int Identity,
	productiondata_id		Int,			
	dxhdata_id				Int,			
	product_code			Varchar(100),	-- ProductionData
	ideal					Float,			
	target					Float,
	actual					Float,
	UOM_Code				Varchar(100),
	order_number			Varchar(100),
	routed_cycle_time		Float,
	start_time				Datetime,
	end_time				Datetime,
	entered_on				Datetime,
	setup_scrap				Float,
	other_scrap				Float,
	adjusted_actual			Float,
	message					Varchar(256)
	)

Declare @DT table
	(
	Id						Int Identity,
	dtdata_id				Int,			
	dxhdata_id				Int,			
	dtreason_id				Int,
	dtminutes				Float,			--DTData
	dtminutes_provisional	Float,
	dtreason_code			Varchar(100),
	dtreason_name			Varchar(200),
	dtminutes_total			Float,
	dtminutes_breaks		Float,
	dtminutes_setup			Float,
	message					Varchar(256)
	)

Declare @Setup_Details table
	(
	Id							Int Identity,
	dxhdata_id					Int,
	shift_code					Varchar(100),
	hour_interval				Varchar(100),
	hour_interval_start			Datetime,
	hour_interval_end			Datetime,
	setup_start_time			Datetime,
	setup_end_time				Datetime,
	setup_minutes				Float,
	mod_setup_start_time		Datetime,
	mod_setup_end_time			Datetime,
	mod_setup_minutes			Float,
	message						Varchar(256)
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

Declare @Comment table
	(
	Id					Int Identity,
	commentdata_id		Int, 
	dxhdata_id			Int, 
	comment				Varchar(256), 
	first_name			Varchar(100), 
	last_name			Varchar(100), 
	last_modified_on	Datetime,
	message				Varchar(256)
	)

Declare 
	@First								Int,
	@Loop								Int,
	@Hours								Int,
	@Production_Day_Offset_Minutes		Int,	
	@Site_Timezone						Varchar(100),	
	@IsFirst							Bit,
	@Calendar_Day_Start					Datetime,	
	@json_out							nVarchar(max),
	@Min								Int,
	@Max								Int,
	@Production_Rows					Int,
	@DT_Rows							Int,
	@Comment_Rows						Int,
	@Prediction_Order					Varchar(100),
	@Prediction_Order_Start_Time		Datetime,
	@Prediction_Order_End_Time			Datetime,
	@Prediction_Product_Code			Varchar(100),
	@Prediction_Order_Quantity			Float,
	@Prediction_Produced_Quantity		Float,
	@Prediction_Routed_Cycle_Time		Float,
	@Prediction_Target_Percent_Of_Ideal	Float,
	@Prediction_Hours_To_Complete		Float,
	@Prediction_Remaining_Quantity		Float,
	@Shift_Hours_Remaining				Float,
	@Shift_Sequence						Int,
	@Setup_Lookback_Minutes				Int,
	@Current_Order_Id					Int,
	@MinNoProd							Int,
	@ShiftCounter						Int,
	@ShiftsToPredict					Int,
    @Hour								Int,
	@Shift1								Int,
	@Shift2								Int,
	@Shift3								Int,
	@site_code							Varchar(100),
	@Site_Id							INT,
	@Shift_Code							VARCHAR(100)

IF @Hour = 23
Begin
Set @Production_Day = (SELECT DATEADD(DAY, 1, @Production_Day))
End

Select 
	@Loop = 1,
	@Hours = duration_in_minutes/60,
	@IsFirst = is_first_shift_of_day,
	@Site_Id = asset_id,
	@First = convert(Int,datepart(hour,start_time)),
	@Shift_Sequence = shift_sequence,
	@Shift_Code = shift_code
From dbo.Shift with (nolock)
Where shift_id = @Shift_Id
	And status = 'Active';

Select @Setup_Lookback_Minutes = convert(Int, setup_lookback_minutes)
From dbo.CommonParameters cpt with (nolock)
Where site_id = @Site_Id AND status = 'Active';

Select @Production_Day_Offset_Minutes = convert(Int, production_day_offset_minutes)
From dbo.CommonParameters cpt with (nolock)
Where site_id = @Site_Id AND status = 'Active';

Select @Site_Timezone = site_timezone
From dbo.CommonParameters cpt with (nolock)
Where site_id = @Site_Id AND status = 'Active';

--Select @Production_Day_Offset_Minutes = 420, @IsFirst = 1

Select @Calendar_Day_Start = dateadd(minute,@Production_Day_Offset_Minutes,@Production_Day)

--Select @Calendar_Day_Start
--Select @Production_Day_Offset_Minutes

--Select @First

While @Loop - 1 < IsNull(@Hours,0)
Begin

	Insert @Shift_Hours
		Select 
			shift_code,
			shift_name,
			Null as 'hour_interval',
			case 
				when @IsFirst = 1 then dateadd(hour,@Loop - 1, @Calendar_Day_Start)
				when @IsFirst = 0 then dateadd(hour,@Loop - 1 + @First,@Production_Day)
				else 0 
			end as 'hour_interval_start',
			Null as 'hour_interval_end',
			Null as 'message'
		From dbo.Shift
		Where shift_id = @Shift_Id
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

Insert @Output
		(
		dxhdata_id,
		asset_id,
		production_day,
		shift_code,
		shift_name,
		hour_interval,
		hour_interval_start,
		hour_interval_end,
		operator_signoff,
		operator_signoff_timestamp,
		supervisor_signoff,
		supervisor_signoff_timestamp
		)
	--Select 
	--	dxh.dxhdata_id,
	--	@Asset_Id,
	--	@Production_Day,
	--	@Shift_Code,
	--	s.shift_name,
	--	s.hour_interval,
	--	s.hour_interval_start,
	--	s.hour_interval_end,
	--	min(dxh.operator_signoff),
	--	min(dxh.operator_signoff_timestamp),
	--	min(dxh.supervisor_signoff),
	--	min(dxh.supervisor_signoff_timestamp)
	--From @Shift_Hours s left join dbo.DxHData dxh with (nolock) on s.shift_code = dxh.shift_code
	--	And s.hour_interval = dxh.hour_interval
	--Where IsNull(dxh.asset_id,@Asset_Id) = @Asset_Id
	--	And IsNull(dxh.production_day,@Production_Day) = @Production_Day
	--	And IsNull(dxh.shift_code,@Shift_Code) = @Shift_Code
	--Group By
	--	dxh.dxhdata_id,
	--	s.shift_name,
	--	s.hour_interval,
	--	s.hour_interval_start,
	--	s.hour_interval_end
	--Order By 
	--	s.hour_interval_start			
	Select 
		Null as 'dxh.dxhdata_id',
		@Asset_Id,
		@Production_Day,
		@Shift_Code,
		s.shift_name,
		s.hour_interval,
		s.hour_interval_start,
		s.hour_interval_end,
		Null as 'min(dxh.operator_signoff)',
		Null as 'min(dxh.operator_signoff_timestamp)',
		Null as 'min(dxh.supervisor_signoff)',
		Null as 'min(dxh.supervisor_signoff_timestamp)'
	From @Shift_Hours s 
	Order By 
		s.hour_interval_start			

Update @Output
Set dxhdata_id = dxh.dxhdata_id,
	operator_signoff = dxh.operator_signoff,
	operator_signoff_timestamp = dxh.operator_signoff_timestamp,
	supervisor_signoff = dxh.supervisor_signoff,
	supervisor_signoff_timestamp = dxh.supervisor_signoff_timestamp
From @Output o,
	dbo.DxHData dxh
Where o.asset_id = dxh.asset_id
	And o.production_day = dxh.production_day
	And o.shift_code = o.shift_code
	And o.hour_interval = dxh.hour_interval

--Select * From @Output
--	For Json path, INCLUDE_NULL_VALUES

--There may be MANY rows per order so these are aggregated
--In a given hour,order and product, the ideal, target, and UOM should all be the same
Insert @Production
	Select
		max(pd.productiondata_id),			
		pd.dxhdata_id,			
		pd.product_code,
		min(pd.ideal),			
		min(pd.target),
		sum(pd.actual),	
		min(pd.UOM_Code),
		pd.order_number,
		Null  as 'routed_cycle_time',
		min(pd.start_time),
		max(pd.end_time),
		max(pd.entered_on),
		sum(pd.setup_scrap),
		sum(pd.other_scrap),
		sum(pd.adjusted_actual),
		Null		as 'message'
	From dbo.ProductionData pd with (nolock),
		@Output o
	Where pd.dxhdata_id = o.dxhdata_id
	Group By
		pd.dxhdata_id,			
		pd.product_code,
		pd.order_number

Update @Production
Set start_time = (Select TOP 1 entered_on from OrderData where order_number = pd.order_number order by entered_on desc)
From @Production p, dbo.ProductionData pd with (nolock)
Where p.order_number = pd.order_number

Update @Production
Set routed_cycle_time = od.routed_cycle_time
From @Production p,
	dbo.OrderData od 
Where p.order_number = od.order_number 

--Select * From @Production

--Compute the production summaries for each hour
Select @Min = min(Id)
From @Output o
Where exists 
	(
	Select Id
	From @Production p
	Where p.dxhdata_id = o.dxhdata_id
	)

Select @Max = max(Id)
From @Output o
Where exists 
	(
	Select Id
	From @Production p
	Where p.dxhdata_id = o.dxhdata_id
	)

If IsNull(@Min,0) > 0
Begin

	While @Min <= @Max
	Begin	

		Set @Production_Rows = Null

		Select @Production_Rows = count(*)
		From @Production p,
			@Output o
		Where p.dxhdata_id = o.dxhdata_id
			And o.Id = @Min

		If IsNull(@Production_Rows,0) = 1
		Begin
			Update @Output
			Set summary_product_code = p.product_code,
				summary_ideal = p.ideal,
				summary_target = p.target,
				summary_actual = p.actual,
				summary_setup_scrap = p.setup_scrap,
				summary_other_scrap = p.other_scrap,
				summary_adjusted_actual = p.adjusted_actual
			From @Output o, 
				@Production p
			Where o.dxhdata_id = p.dxhdata_id
				And o.Id = @Min
		End

		If IsNull(@Production_Rows,0) > 1
		Begin
			Update @Output
			Set summary_product_code = 'multiple',
				--summary_ideal = p.ideal,
				--summary_target = p.target,
				summary_actual = s.Sum_Actual,
				summary_setup_scrap = s.Sum_Setup_Scrap,
				summary_other_scrap = s.Sum_Other_Scrap,
				summary_adjusted_actual = s.Sum_Adjusted_Actual
			From @Output o, 
				(
				Select
					p.dxhdata_id,
					sum(p.actual) as 'Sum_Actual',
					sum(p.setup_scrap) as 'Sum_Setup_Scrap',
					sum(p.other_scrap) as 'Sum_Other_Scrap',
					sum(p.adjusted_actual) as 'Sum_Adjusted_Actual'
				From @Production p,
					@Output o2
				Where p.dxhdata_id = o2.dxhdata_id
					And o2.Id = @Min
				Group By
					p.dxhdata_id
				) s
			Where o.dxhdata_id = s.dxhdata_id
				And o.Id = @Min

			Update @Output
			Set summary_ideal = s.Sum_Max_Ideal
			From @Output o, 
				(
				Select
					p.dxhdata_id,
					sum(p.ideal) as 'Sum_Max_Ideal' 
				From @Production p,
					@Output o2
				Where p.dxhdata_id = o2.dxhdata_id
					And o2.Id = @Min
					And p.Id = 
						(
						Select max(Id)
						From @Production p2
						Where p2.dxhdata_id = o2.dxhdata_id
							And p2.product_code = p.product_code --should work the same as order
						)
				Group By
					p.dxhdata_id
				) s
			Where o.dxhdata_id = s.dxhdata_id
				And o.Id = @Min

			Update @Output
			Set summary_target = s.Sum_Max_Target
			From @Output o, 
				(
				Select
					p.dxhdata_id,
					sum(p.target) as 'Sum_Max_Target' 
				From @Production p,
					@Output o2
				Where p.dxhdata_id = o2.dxhdata_id
					And o2.Id = @Min
					And p.Id = 
						(
						Select max(Id)
						From @Production p2
						Where p2.dxhdata_id = o2.dxhdata_id
							And p2.product_code = p.product_code --should work the same as order
						)
				Group By
					p.dxhdata_id
				) s
			Where o.dxhdata_id = s.dxhdata_id
				And o.Id = @Min

		End -- If Production Rows > 1
	
		Set @Min = @Min + 1

	End --while

End -- if min > 0

--Cumulatives are across the shift
Update @Output
Set cumulative_target = s.Running_Target,
	cumulative_actual = s.Running_Actual,
	cumulative_setup_scrap = s.Running_Setup_Scrap,
	cumulative_other_scrap = s.Running_Other_Scrap,
	cumulative_adjusted_actual = s.Running_Adjusted_Actual
From @Output o,
	(
	Select
		Id,
		sum(o2.summary_target) over ( Order By Id ) as 'Running_Target',
		sum(o2.summary_actual) over ( Order By Id ) as 'Running_Actual',
		sum(o2.summary_setup_scrap) over (Order By Id) as 'Running_Setup_Scrap',
		sum(o2.summary_other_scrap) over (Order By Id) as 'Running_Other_Scrap',
		sum(o2.summary_adjusted_actual) over (Order By Id) as 'Running_Adjusted_Actual'
	From @Output o2
	) s
Where o.Id = s.Id
	And o.summary_target is not Null

--For some reason,breaklunchdetails was way down at the bottom of the code, now moved up
-- where it can be useful
-- This may need some tweaking if the shifts change and there is a positive production day offset 
-- or if the break starts in one hour and ends in another
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
		shift_code,
		hour_interval,
		hour_interval_start,
		hour_interval_end,
		cast(cast(hour_interval_start as date) as datetime) + cast(u.start_time as datetime) as 'breaklunch_start_time',
		cast(cast(hour_interval_start as date) as datetime) + cast(u.end_time as datetime) as 'breaklunch_end_time',
		Null as 'breaklunch_minutes'
	From @Output o,
		dbo.Unavailable u with (nolock)
	Where o.asset_id = u.asset_id
		And o.asset_id = @Asset_Id
		And cast(o.hour_interval_start as time) <= u.start_time
		And (cast(o.hour_interval_end as time) > u.start_time or cast(o.hour_interval_end as time) = '00:00:00')
		And (cast(o.hour_interval_end as time) > u.end_time or cast(o.hour_interval_end as time) = '00:00:00')
		And u.status = 'Active'
			
Update @BreakLunch_Details
Set breaklunch_minutes = datediff(minute,breaklunch_start_time,breaklunch_end_time)

-- Modify the breaklunch times to bound them by the edges of the hour
Update @BreakLunch_Details
Set mod_breaklunch_start_time = hour_interval_start
Where breaklunch_start_time < hour_interval_start
	And mod_breaklunch_start_time is Null

Update @BreakLunch_Details
Set mod_breakLunch_start_time = breaklunch_start_time
Where breaklunch_start_time >= hour_interval_start
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

Update @Output
Set summary_breakandlunch_minutes = s.sum_breaklunch_minutes
From @Output o,
	(
	Select 
		sd.hour_interval,
		sum(sd.mod_breaklunch_minutes) as 'sum_breaklunch_minutes'
	From @BreakLunch_Details sd
	Group By
		sd.hour_interval
	) s
Where o.hour_interval = s.hour_interval


--Predictive now.

--	For the current order for this asset (is_current_order = 1, there is an index here, use it), 
--		find the order quantity, total produced quantity and routed cycle time
--			Note total produced for an order could span days
--		If order quantity > total produced
--			Determine how many hours in this shift it is expected to run
--			Populate summary_product_code, summary_ideal, and summary_target in those hours
--	

-- There should be only one current order but just in case, take the top 1
Select top 1
	@Current_Order_Id = od.order_id,
	@Prediction_Order = od.order_number,
	@Prediction_Product_Code = od.product_code,
	@Prediction_Order_Quantity = order_quantity,
	@Prediction_Routed_Cycle_Time = routed_cycle_time,
	@Prediction_Target_Percent_Of_Ideal = target_percent_of_ideal,
	@Prediction_Order_Start_Time = start_time,
	@Prediction_Order_End_Time = end_time
From dbo.OrderData od with (nolock)
Where od.is_current_order = 1
	And od.asset_id = @Asset_Id
Order by 
	od.entered_on desc

If @Prediction_Routed_Cycle_Time is Null
Begin
	Select @Prediction_Routed_Cycle_Time = convert(float,default_routed_cycle_time)
	From dbo.CommonParameters cpt with (nolock)
	Where site_id = @Site_Id AND status = 'Active';
End

If @Prediction_Routed_Cycle_Time is Null
Begin
	Select @Prediction_Routed_Cycle_Time = 300
End

If @Prediction_Target_Percent_Of_Ideal is Null
Begin
	Select @Prediction_Target_Percent_Of_Ideal = convert(float,default_target_percent_of_ideal)
	From dbo.CommonParameters cpt with (nolock)
	Where site_id = @Site_Id AND status = 'Active';
End

If @Prediction_Target_Percent_Of_Ideal is Null
Begin
	Select @Prediction_Target_Percent_Of_Ideal = 0.75
End

Select @Prediction_Produced_Quantity = sum(pd.actual)
	From dbo.ProductionData pd with (nolock),
		dbo.OrderData od with (nolock),
		dbo.DxHData dxh with (nolock)
	Where pd.dxhdata_id = dxh.dxhdata_id
		And pd.order_id = od.order_id
		And dxh.asset_id = @Asset_Id
		And od.order_id = @Current_Order_Id
		And od.is_current_order = 1				--added to try and make it use this index

Select @Prediction_Remaining_Quantity = IsNull(@Prediction_Order_Quantity,-1) - IsNull(@Prediction_Produced_Quantity,0)

If IsNull(@Prediction_Order_Quantity,-1) > IsNull(@Prediction_Produced_Quantity,0)
Begin
	Select @Prediction_Hours_To_Complete = 
		(
			(@Prediction_Order_Quantity - IsNull(@Prediction_Produced_Quantity,0)) --remaining quantity
			* (@Prediction_Routed_Cycle_Time / 60.0)					--converted to minutes
		)
		/60.0															--converted to hours

	Select @Prediction_Hours_To_Complete = ceiling(@Prediction_Hours_To_Complete)

	If
		(
		Select sum(IsNull(summary_breakandlunch_minutes,0))/60.0
		From @Output
		Where dxhdata_id is Null
		) > 0
	Begin
		-- Add in the break and lunch time
		Select @Prediction_Hours_To_Complete = @Prediction_Hours_To_Complete + 
			(
			Select sum(IsNull(summary_breakandlunch_minutes,0))/60.0
			From @Output
			Where dxhdata_id is Null
			)
	End
End 

Select @Shift_Hours_Remaining = count(*)
From @Output o
Where 
	(
	dxhdata_id is Null
	Or
	not exists (Select Id From @Production p Where p.dxhdata_id = o.dxhdata_id)
	)
	--starts, ends, or spans
	And
		(
			(
			@Prediction_Order_Start_Time >= hour_interval_start
			And 
			@Prediction_Order_Start_Time < hour_interval_end
			)
			Or
			(
			@Prediction_Order_End_Time >= hour_interval_start
			And 
			@Prediction_Order_End_Time <= hour_interval_end
			)
			Or
			(
			@Prediction_Order_Start_Time < hour_interval_start
			And 
			IsNull(@Prediction_Order_End_Time,hour_interval_end) <= hour_interval_end
			)
		)


--Select @Shift_Hours_Remaining

If 
	(
	IsNull(@Shift_Hours_Remaining,0) > 0
	And
	IsNull(@Prediction_Hours_To_Complete,0) > 0.0
	)
Begin

	Select @MinNoProd = min(Id)
	From @Output o
	Where 
		(
		dxhdata_id is Null
		Or
		not exists (Select Id From @Production p Where p.dxhdata_id = o.dxhdata_id)
		)
		And
			(
				(
				@Prediction_Order_Start_Time >= hour_interval_start
				And 
				@Prediction_Order_Start_Time < hour_interval_end
				)
				Or
				(
				@Prediction_Order_End_Time >= hour_interval_start
				And 
				@Prediction_Order_End_Time <= hour_interval_end
				)
				Or
				(
				@Prediction_Order_Start_Time < hour_interval_start
				And 
				IsNull(@Prediction_Order_End_Time,hour_interval_end) <= hour_interval_end
				)
			)

	Select @ShiftCounter = 1

	If IsNull(@Prediction_Hours_To_Complete,0) > IsNull(@Shift_Hours_Remaining,0)
	Begin
		Select @ShiftsToPredict = @Shift_Hours_Remaining
	End
	Else
	Begin
--		Select @ShiftsToPredict = @Prediction_Hours_To_Complete
		Select @ShiftsToPredict = @Prediction_Hours_To_Complete +
			(
			Select count(Id) 
			From @Output o
			Where hour_interval_end < getutcdate() at time zone 'UTC' at time zone @Site_Timezone
				And not exists (Select Id From @Production p Where p.dxhdata_id = o.dxhdata_id)
			)
	End

	While (@ShiftCounter <= @ShiftsToPredict And @Prediction_Remaining_Quantity > 0)
	Begin

		-- Calculate Ideal
		If 
			(
			Select (3600 / @Prediction_Routed_Cycle_Time)
			From @Output
			Where Id = (@MinNoProd - 1) + @ShiftCounter
			) > @Prediction_Remaining_Quantity
		Begin
			Update @Output
			Set summary_ideal = @Prediction_Remaining_Quantity
			From @Output o
			Where Id = (@MinNoProd - 1) + @ShiftCounter
				And not exists (Select Id From @Production p Where p.dxhdata_id = o.dxhdata_id)
		End
		Else
		Begin

			Update @Output
			Set summary_ideal = (3600 / @Prediction_Routed_Cycle_Time)
			From @Output o
			Where Id = (@MinNoProd - 1) + @ShiftCounter
				And not exists (Select Id From @Production p Where p.dxhdata_id = o.dxhdata_id)

		End

		-- Calculate Target
		If 
			(
			Select ((3600 - IsNull(summary_breakandlunch_minutes,0) * 60.0) / @Prediction_Routed_Cycle_Time)
				* @Prediction_Target_Percent_Of_Ideal
			From @Output
			Where Id = (@MinNoProd - 1) + @ShiftCounter
			) > @Prediction_Remaining_Quantity
		Begin
			Update @Output
			Set summary_target = @Prediction_Remaining_Quantity 
			From @Output o
			Where Id = (@MinNoProd - 1) + @ShiftCounter
				And not exists (Select Id From @Production p Where p.dxhdata_id = o.dxhdata_id)

		End
		Else
		Begin
			Update @Output
			Set summary_target = ((3600 - IsNull(summary_breakandlunch_minutes,0) * 60.0) / @Prediction_Routed_Cycle_Time
					* @Prediction_Target_Percent_Of_Ideal)
			From @Output o
			Where Id = (@MinNoProd - 1) + @ShiftCounter
				And not exists (Select Id From @Production p Where p.dxhdata_id = o.dxhdata_id)

		End

		Update @Output
		Set summary_product_code = @Prediction_Product_Code
		From @Output o
		Where Id = (@MinNoProd - 1) + @ShiftCounter
			And not exists (Select Id From @Production p Where p.dxhdata_id = o.dxhdata_id)

		--This assumes that the predicted actual is the same as target
		--don't reduce remaining from hours earlier in the shift 
		Select @Prediction_Remaining_Quantity = @Prediction_Remaining_Quantity - summary_target 
		From @Output o
		Where Id = (@MinNoProd - 1) + @ShiftCounter
			And not exists (Select Id From @Production p Where p.dxhdata_id = o.dxhdata_id)
			--this extends the prediction 
			And hour_interval_end at time zone @Site_Timezone > getutcdate() at time zone 'UTC' at time zone @Site_Timezone	

		Select 
			@ShiftCounter = @ShiftCounter + 1
	
	End -- While

End -- If IsNull(@Shift_Hours_Remaining,0) > 0



--Select @Shift_Hours_Remaining

------***********************************************************
------Remove this!!!
------This is just to put something in the json output for testing
----Update @Output 
----Set summary_product_code = '1 1/4 CD45-S PS',
----	summary_ideal = 7,
----	summary_target = 5
----From @Output
----Where Id = 4

----Update @Output 
----Set summary_product_code = '1 1/4 CD45-S PS',
----	summary_ideal = 5,
----	summary_target = 3
----From @Output
----Where Id = 5

----Update @Output 
----Set summary_product_code = '1 1/4 CD45-S PS',
----	summary_ideal = 7,
----	summary_target = 5
----From @Output
----Where Id = 6
	
------***********************************************************


--	  
Insert @DT
	Select
		dt.dtdata_id,			
		dt.dxhdata_id,			
		dt.dtreason_id,
		dt.dtminutes,			-- DTData
		dt.dtminutes_provisional,	--ignore this for now		
		Null		as 'dtreason_code',
		Null		as 'dtreason_name',
		dt.dtminutes_total,			--ignore this for now
		dt.dtminutes_breaks,		--ignore this for now
		dt.dtminutes_setup,			--ignore this for now
		Null		as 'message'
	From dbo.DTData dt with (nolock),
		@Output o
	Where dt.dxhdata_id = o.dxhdata_id

Update @DT
Set dtreason_code = dtr.dtreason_code,
	dtreason_name = dtr.dtreason_name
From @DT dt,
	dbo.DTReason dtr with (nolock),
	@Output o
Where dt.dtreason_id = dtr.dtreason_id
	And dt.dxhdata_id = o.dxhdata_id
	And o.asset_id = dtr.asset_id

--Compute the DT summaries for each hour
Select 
	@Min = Null,
	@Max = Null

Select @Min = min(Id)
From @Output o
Where exists 
	(
	Select Id
	From @DT dt
	Where dt.dxhdata_id = o.dxhdata_id
	)

Select @Max = max(Id)
From @Output o
Where exists 
	(
	Select Id
	From @DT dt
	Where dt.dxhdata_id = o.dxhdata_id
	)

If IsNull(@Min,0) > 0
Begin

	While @Min <= @Max
	Begin	

		Set @DT_Rows = Null

		Select @DT_Rows = count(*)
		From @DT dt,
			@Output o
		Where dt.dxhdata_id = o.dxhdata_id
			And o.Id = @Min

		If IsNull(@DT_Rows,0) = 1
		Begin
			Update @Output
			Set summary_dtminutes = dt.dtminutes,
				summary_dtreason_code = dt.dtreason_code,
				summary_dtreason_name = dt.dtreason_name
			From @Output o, 
				@DT dt
			Where o.dxhdata_id = dt.dxhdata_id
				And o.Id = @Min
		End

		If IsNull(@DT_Rows,0) > 1
		Begin
			Update @Output
			Set summary_dtminutes = s.Sum_dtminutes,
				summary_dtreason_code = 'multiple',
				summary_dtreason_name = 'multiple'
			From @Output o, 
				(
				Select
					dt.dxhdata_id,
					sum(dt.dtminutes) as 'Sum_dtminutes' 
				From @DT dt,
					@Output o2
				Where dt.dxhdata_id = o2.dxhdata_id
					And o2.Id = @Min
				Group By
					dt.dxhdata_id
				) s
			Where o.dxhdata_id = s.dxhdata_id
				And o.Id = @Min

		End -- If DT Rows > 1
	
		Set @Min = @Min + 1

	End --while

End -- if min > 0

--
--Get the setup and breaklunch minutes
-- 
-- Setup time in an hour can be
--		In the hour and related to orders that have reported production
--		In the hour and related to orders that have not yet reported production
--			Note that the setup may have started prior to the start of the hour. A CommonParameter 
--			called setup_lookback_minutes limits the time to look back in OrderData for setups that 
--			span the start of the hour.

--get the setup for orders that have reported production 
Insert @Setup_Details
	(
	dxhdata_id,
	shift_code,
	hour_interval,
	hour_interval_start,
	hour_interval_end,
	setup_start_time,
	setup_end_time,
	setup_minutes,
	message
	)
	Select
		o.dxhdata_id,
		o.shift_code,
		o.hour_interval,
		o.hour_interval_start,
		o.hour_interval_end,
		od.setup_start_time,
		od.setup_end_time,
		Null,
		od.order_number as 'message'
	From @Output o,
		dbo.ProductionData pd with (nolock),
		dbo.OrderData od with (nolock)
	Where o.dxhdata_id = pd.dxhdata_id
		And pd.order_number = od.order_number
		-- setuptime must start, end, or span the hour interval
		And 
			(
				(
				od.setup_start_time >= o.hour_interval_start
				And
				od.setup_start_time < o.hour_interval_end 
				)
				Or
				(
				od.setup_end_time >= o.hour_interval_start
				And
				od.setup_end_time < o.hour_interval_end 
				)
				Or
				(
				od.setup_start_time < o.hour_interval_start
				And
				od.setup_end_time > o.hour_interval_end 
				)
			)

--get the setup for orders that have NOT reported production 
Insert @Setup_Details
	(
--	dxhdata_id,
	shift_code,
	hour_interval,
	hour_interval_start,
	hour_interval_end,
	setup_start_time,
	setup_end_time,
	setup_minutes,
	message
	)
	Select
--		o.dxhdata_id,
		o.shift_code,
		o.hour_interval,
		o.hour_interval_start,
		o.hour_interval_end,
		od.setup_start_time,
		od.setup_end_time,
		Null,
		'Setup without production'
	From @Output o,
		dbo.OrderData od with (nolock)
	Where o.asset_id = od.asset_id
		And od.setup_start_time is not Null
		And IsNull(od.setup_end_time,od.setup_start_time) > dateadd(minute,-@Setup_Lookback_Minutes,o.hour_interval_start)
		And not exists 
			(
			Select od2.order_id 
			From @Output o2,
				dbo.ProductionData pd2 with (nolock),
				dbo.OrderData od2 with (nolock)
			Where o2.dxhdata_id = pd2.dxhdata_id
				And pd2.order_number = od2.order_number
				And od2.asset_id = @Asset_Id
				And o2.Id = o.Id
			)
		And 
			(
				(
				od.setup_start_time >= o.hour_interval_start
				And
				od.setup_start_time < o.hour_interval_end 
				)
				Or
				(
				od.setup_end_time >= o.hour_interval_start
				And
				od.setup_end_time < o.hour_interval_end 
				)
				Or
				(
				od.setup_start_time < o.hour_interval_start
				And
				od.setup_end_time > o.hour_interval_end 
				)
			)

Update @Setup_Details
Set setup_minutes = datediff(minute,setup_start_time,setup_end_time)

-- Modify the setup times to bound them by the edges of the hour
Update @Setup_Details
Set mod_setup_start_time = hour_interval_start
Where setup_start_time < hour_interval_start
	And mod_setup_start_time is Null

Update @Setup_Details
Set mod_setup_start_time = setup_start_time
Where setup_start_time >= hour_interval_start
	And mod_setup_start_time is Null

Update @Setup_Details
Set mod_setup_end_time = hour_interval_end
Where setup_end_time > hour_interval_end
	And mod_setup_end_time is Null

Update @Setup_Details
Set mod_setup_end_time = setup_end_time
Where setup_end_time < hour_interval_end
	And mod_setup_end_time is Null
	  
Update @Setup_Details
Set mod_setup_end_time = hour_interval_end
Where setup_end_time is Null
	And mod_setup_end_time is Null

Update @Setup_Details
Set mod_setup_minutes = datediff(minute,mod_setup_start_time,mod_setup_end_time)

Update @Output
Set summary_setup_minutes = s.sum_setup_minutes
From @Output o,
	(
	Select 
		sd.hour_interval,
		sum(sd.mod_setup_minutes) as 'sum_setup_minutes'
	From @Setup_Details sd
	Group By
		sd.hour_interval
	) s
Where o.hour_interval = s.hour_interval

--Why was breakAndLunch down here? Moved it up


--Select * From @Output
--Select * From @Setup_BreakLunch_Minutes

--Select * From @Setup_Details
--select * From @BreakLunch_Details

--return


Insert @Comment
	Select
		cd.commentdata_id, 
		cd.dxhdata_id, 
		cd.comment, 
		cd.first_name, 
		cd.last_name, 
		cd.last_modified_on at time zone 'UTC' at time zone @Site_Timezone,
		Null as 'message'
	From dbo.CommentData cd with (nolock),
		@Output o
	Where cd.dxhdata_id = o.dxhdata_id

--comment summaries for each hour
Select 
	@Min = Null,
	@Max = Null

Select @Min = min(Id)
From @Output o
Where exists 
	(
	Select Id
	From @Comment c 
	Where c.dxhdata_id = o.dxhdata_id
	)

Select @Max = max(Id)
From @Output o
Where exists 
	(
	Select Id
	From @Comment c
	Where c.dxhdata_id = o.dxhdata_id
	)

If IsNull(@Min,0) > 0
Begin

	While @Min <= @Max
	Begin	

		Set @Comment_Rows = Null

		Select @Comment_Rows = count(*)
		From @Comment c,
			@Output o
		Where c.dxhdata_id = o.dxhdata_id
			And o.Id = @Min

		If IsNull(@Comment_Rows,0) = 1
		Begin
			Update @Output
			Set summary_comment = c.comment
			From @Output o, 
				@Comment c
			Where o.dxhdata_id = c.dxhdata_id
				And o.Id = @Min
		End

		If IsNull(@Comment_Rows,0) > 1
		Begin
			Update @Output
			Set summary_comment = 'multiple'
			From @Output o, 
				@Comment c
			Where o.dxhdata_id = c.dxhdata_id
				And o.Id = @Min

		End -- If Comment Rows > 1
	
		Set @Min = @Min + 1

	End --while

End -- if min > 0

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
		o.dxhdata_id					as 'hour.dxhdata_id',			
		asset_id						as 'hour.asset_id',
		production_day					as 'hour.production_day',
		shift_code						as 'hour.shift_code',
		shift_name						as 'hour.shift_name',
		hour_interval					as 'hour.hour_interval',
		hour_interval_start				as 'hour.hour_interval_start',
		hour_interval_end				as 'hour.hour_interval_end',
		start_time						as 'hour.hour_start_time',
		summary_product_code			as 'hour.summary_product_code',
		summary_ideal					as 'hour.summary_ideal',
		summary_target					as 'hour.summary_target',
		summary_actual					as 'hour.summary_actual',
		summary_setup_scrap				as 'hour.summary_setup_scrap',
		summary_other_scrap				as 'hour.summary_other_scrap',
		summary_adjusted_actual			as 'hour.summary_adjusted_actual',
		summary_setup_minutes			as 'hour.summary_setup_minutes',
		summary_breakandlunch_minutes	as 'hour.summary_breakandlunch_minutes',
		cumulative_target				as 'hour.cumulative_target',
		cumulative_actual				as 'hour.cumulative_actual',
		cumulative_setup_scrap			as 'hour.cumulative_setup_scrap',
		cumulative_other_scrap			as 'hour.cumulative_other_scrap',
		cumulative_adjusted_actual		as 'hour.cumulative_adjusted_actual',
		summary_dtminutes				as 'hour.symmary_dtminutes',
		summary_dtreason_code			as 'hour.symmary_dtreason_code',
		summary_dtreason_name			as 'hour.symmary_dtreason_name',
		summary_comment					as 'hour.symmary_comment',
		operator_signoff				as 'hour.operator_signoff',
		operator_signoff_timestamp		as 'hour.operator_signoff_timestamp',
		supervisor_signoff				as 'hour.supervisor_signoff',
		supervisor_signoff_timestamp	as 'hour.supervisor_signoff_timestamp',
		o.message						as 'hour.message',	
		(
		Select
			p2.productiondata_id,	 -- as 'Production.productiondata_id',
			--p2.dxhdata_id,
			p2.product_code,		--as 'Production.product_code', 
			p2.ideal,				-- as 'Production.ideal', 
			p2.target,				-- as 'Production.target', 
			p2.actual,				-- as 'Production.actual', 
			p2.setup_scrap,			-- as 'Production.setup_scrap',
			p2.other_scrap,			-- as 'Production.other_scrap',
			p2.adjusted_actual,		-- as 'Production.adjusted_actual',
			p2.order_number,		-- as 'Production.order_number',
			p2.start_time,			-- as 'Production.start_time,
			p2.routed_cycle_time	-- as 'Production.routed_cycle_time' 
		From @Production p2
		Where p2.dxhdata_id = o.dxhdata_id
		For Json path, INCLUDE_NULL_VALUES
		) as 'hour.production',
		(
		Select
			dt.dtdata_id,			
			dt.dxhdata_id,			
			dt.dtreason_id,
			dt.dtminutes,				-- DTData
			dt.dtminutes_provisional,	--ignore this for now		
			dt.dtreason_code,
			dt.dtreason_name,
			dt.dtminutes_total,			--ignore this for now
			dt.dtminutes_breaks,		--ignore this for now
			dt.dtminutes_setup			--ignore this for now
		From @DT dt
		Where dt.dxhdata_id = o.dxhdata_id
		For Json path, INCLUDE_NULL_VALUES
		) as 'hour.timelost',
		(
		Select
			c.commentdata_id, 
			c.dxhdata_id, 
			c.comment, 
			c.first_name, 
			c.last_name, 
			c.last_modified_on,
			c.message
		From @Comment c
		Where c.dxhdata_id = o.dxhdata_id
		For Json path, INCLUDE_NULL_VALUES
		) as 'hour.comment'
	From @Output o 
	Order By 
		o.hour_interval_start
	For Json path, INCLUDE_NULL_VALUES
	)

Select @json_out as 'Shift_Data'

--Select * From @Output
--Select * From @Setup_Details
--Select * From @Production
--Select * From @Shift_Hours
--Select @Prediction_Hours_To_Complete as 'Hours_to_Complete',
--	@Prediction_Produced_Quantity as 'Produced',
--	@Prediction_Order_Quantity as 'Order Qty',
--	@Prediction_Remaining_Quantity as 'Remaining',
--	@Current_Order_id as 'Current_Order_Id',
--	@Prediction_Order_Start_Time,
--	@Prediction_Order_End_Time

Return

END