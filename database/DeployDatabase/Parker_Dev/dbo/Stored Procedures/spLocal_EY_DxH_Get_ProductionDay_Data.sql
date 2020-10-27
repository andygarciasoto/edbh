

--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_ProductionDay_Data
--
--  Purpose:
--	Given an asset and a Production_Day, get the data for a full production day and pass it to the dashboard display
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
--	20190826		C00V00 - Intial code created
--  20191203		C00V01 - Change Asset_Code for Asset_Id
--	20191204		C00V03 - Change CommonParameters to CommonParameters
--		
-- Example Call:
-- exec spLocal_EY_DxH_Get_ProductionDay_Data 40,'2019-07-25'
--
CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Get_ProductionDay_Data]
--Declare
	@Asset_Id		INT,
	@Production_Day Datetime
AS

BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;

--Select @Asset_Id = 1,
--	@Production_Day = '2019-07-25'

Declare @Shift_Hours table
	(
	Id					Int Identity,
	shift_code			Varchar(100),
	shift_name			Varchar(100),
	hour_interval		Varchar(100),
	hour_interval_start	Datetime,
	hour_interval_end	Datetime,
	shift_sequence		Int,
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
	shift_sequence					Int,
	summary_product_code			Varchar(100),
	summary_ideal					Float,
	summary_target					Float,				
	summary_actual					Float,				
	cumulative_target				Float,
	cumulative_actual				Float,
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
	@Shift_Code							Varchar(100),
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
	@Prediction_Product_Code			Varchar(100),
	@Prediction_Order_Quantity			Float,
	@Prediction_Produced_Quantity		Float,
	@Prediction_Routed_Cycle_Time		Float,
	@Prediction_Target_Percent_Of_Ideal	Float,
	@Prediction_Hours_To_Complete		Float,
	@Prediction_Remaining_Quantity		Float,
	@Shift_Hours_Remaining				Float,
	@Shift_Sequence						Int,
	@MaxShift_Sequence					Int,
	@Setup_Lookback_Minutes				Int,
	@Current_Order_Id					Int,
	@Site_Id							Int

SELECT @Site_Id = asset_id
FROM [dbo].[Asset] WHERE asset_level = 'Site' AND site_code = (SELECT site_code FROM [dbo].[Asset] WHERE asset_id=@Asset_Id);

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
Select 
	@Loop = 1,
	@Hours = duration_in_minutes/60,
	@IsFirst = is_first_shift_of_day, 
	@First = convert(Int,datepart(hour,start_time)),
	@Shift_Sequence = shift_sequence,
	@Shift_Code = shift_code
From dbo.Shift with (nolock)
Where status = 'Active'
	And is_first_shift_of_day = 1

Select @MaxShift_Sequence = max(shift_sequence)
From dbo.Shift with (nolock)
Where status = 'Active'

--Select @First
While @Shift_Sequence <= @MaxShift_Sequence
Begin

	If IsNull(@Hours,0) > 0
	Begin
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
					shift_sequence,
					Null as 'message'
				From dbo.Shift with (nolock)
				Where shift_code = @Shift_Code
					And status = 'Active'		
	
			Set @Loop = @Loop + 1

		End
	End -- IsNull(@Hours,0) > 0

	Select 
		@Loop = 1,
		@Hours = duration_in_minutes/60,
		@IsFirst = is_first_shift_of_day, 
		@First = convert(Int,datepart(hour,start_time)),
		@Shift_Code = shift_code
	From dbo.Shift with (nolock)
	Where status = 'Active'
		And shift_sequence = @Shift_Sequence + 1

	Set @Shift_Sequence = @Shift_Sequence + 1

End -- While Shift_Sequence

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
		shift_sequence,
		operator_signoff,
		operator_signoff_timestamp,
		supervisor_signoff,
		supervisor_signoff_timestamp
		)
	Select 
		Null as 'dxh.dxhdata_id',
		@Asset_Id,
		@Production_Day,
		s.shift_code,
		s.shift_name,
		s.hour_interval,
		s.hour_interval_start,
		s.hour_interval_end,
		s.shift_sequence,
		Null as 'min(dxh.operator_signoff)',
		Null as 'min(dxh.operator_signoff_timestamp)',
		Null as 'min(dxh.supervisor_signoff)',
		Null as 'min(dxh.supervisor_signoff_timestamp)'
	From @Shift_Hours s 
	Order By 
		s.shift_sequence,	
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
		Null		as 'message'
	From dbo.ProductionData pd with (nolock),
		@Output o
	Where pd.dxhdata_id = o.dxhdata_id
	Group By
		pd.dxhdata_id,			
		pd.product_code,
		pd.order_number

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
				summary_ideal = convert(Int,p.ideal),
				summary_target = convert(Int,p.target),
				summary_actual = p.actual
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
				summary_actual = s.Sum_Actual
			From @Output o, 
				(
				Select
					p.dxhdata_id,
					sum(p.actual) as 'Sum_Actual' 
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
			Set summary_ideal = convert(Int,s.Sum_Max_Ideal)
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
			Set summary_target = convert(Int,s.Sum_Max_Target)
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
	cumulative_actual = s.Running_Actual
From @Output o,
	(
	Select
		Id,
		sum(o2.summary_target) over ( Order By Id ) as 'Running_Target',
		sum(o2.summary_actual) over ( Order By Id ) as 'Running_Actual'
	From @Output o2
	) s
Where o.Id = s.Id
	And o.summary_target is not Null

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
	@Prediction_Target_Percent_Of_Ideal = target_percent_of_ideal
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

Select @Prediction_Remaining_Quantity = IsNull(@Prediction_Order_Quantity,-1) - IsNull(@Prediction_Produced_Quantity,0)

If IsNull(@Prediction_Order_Quantity,-1) > IsNull(@Prediction_Produced_Quantity,0)
Begin
	Select @Prediction_Hours_To_Complete = 
		(
			(@Prediction_Order_Quantity - @Prediction_Produced_Quantity) --remaining quantity
			* (@Prediction_Routed_Cycle_Time / 60.0)					--converted to minutes
		)
		/60.0															--converted to hours

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

Declare
	@MinNoProd			Int,
	@ShiftCounter		Int,
	@ShiftsToPredict	Int

Select @Shift_Hours_Remaining = count(*)
From @Output
Where dxhdata_id is Null

If 
	(
	IsNull(@Shift_Hours_Remaining,0) > 0
	And
	IsNull(@Prediction_Hours_To_Complete,0) > 0
	)
Begin

	Select @MinNoProd = min(Id)
	From @Output 
	Where dxhdata_id is Null

	Select @ShiftCounter = 1

	If IsNull(@Prediction_Hours_To_Complete,0) > IsNull(@Shift_Hours_Remaining,0)
	Begin
		Select @ShiftsToPredict = @Shift_Hours_Remaining
	End
	Else
	Begin
		Select @ShiftsToPredict = @Prediction_Hours_To_Complete
	End

	While (@ShiftCounter <= @ShiftsToPredict And @Prediction_Remaining_Quantity > 0)
	Begin
		If 
			(
			Select ((3600 - IsNull(summary_breakandlunch_minutes,0) * 60.0) / @Prediction_Routed_Cycle_Time)
			From @Output
			Where Id = (@MinNoProd - 1) + @ShiftCounter
			) > @Prediction_Remaining_Quantity
		Begin
			Update @Output
			Set summary_ideal = convert(Int,@Prediction_Remaining_Quantity)
			From @Output
			Where Id = (@MinNoProd - 1) + @ShiftCounter

		End
		Else
		Begin

			Update @Output
			Set summary_ideal = convert(Int,((3600 - IsNull(summary_breakandlunch_minutes,0) * 60.0) / @Prediction_Routed_Cycle_Time))
			From @Output
			Where Id = (@MinNoProd - 1) + @ShiftCounter

		End

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
			From @Output
			Where Id = (@MinNoProd - 1) + @ShiftCounter

		End
		Else
		Begin
			Update @Output
			Set summary_target = convert(Int,((3600 - IsNull(summary_breakandlunch_minutes,0) * 60.0) / @Prediction_Routed_Cycle_Time)
					* @Prediction_Target_Percent_Of_Ideal)
			From @Output
			Where Id = (@MinNoProd - 1) + @ShiftCounter

		End

		Update @Output
		Set summary_product_code = @Prediction_Product_Code
		From @Output
		Where Id = (@MinNoProd - 1) + @ShiftCounter


		--This assumes that the predicted actual is the same as target
		Select @Prediction_Remaining_Quantity = @Prediction_Remaining_Quantity - summary_target 
		From @Output
		Where Id = (@MinNoProd - 1) + @ShiftCounter

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
		And not exists 
			(
			Select sd.Id 
			From @Setup_Details sd
			Where sd.setup_start_time = od.setup_start_time
			)
		And o.hour_interval_start = 
			(
			Select min(o3.hour_interval_start)
			From @Output o3,
				dbo.OrderData od3 with (nolock)
			Where o3.asset_id = od3.asset_id
				And od3.setup_start_time is not Null
				And IsNull(od3.setup_end_time,od3.setup_start_time) > dateadd(minute,-@Setup_Lookback_Minutes,o3.hour_interval_start)
				And not exists 
					(
					Select od4.order_id 
					From @Output o4,
						dbo.ProductionData pd4 with (nolock),
						dbo.OrderData od4 with (nolock)
					Where o4.dxhdata_id = pd4.dxhdata_id
						And pd4.order_number = od4.order_number
						And od4.asset_id = @Asset_Id
						And o4.Id = o3.Id
					)
				And not exists 
					(
					Select sd2.Id 
					From @Setup_Details sd2
					Where sd2.setup_start_time = od3.setup_start_time
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
		o2.shift_code					as 'productionday.shift_code',
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
			shift_sequence					as 'hour.shift_sequence',
			summary_product_code			as 'hour.summary_product_code',
			summary_ideal					as 'hour.summary_ideal',
			summary_target					as 'hour.summary_target',
			summary_actual					as 'hour.summary_actual',
			summary_setup_minutes			as 'hour.summary_setup_minutes',
			summary_breakandlunch_minutes	as 'hour.summary_breakandlunch_minutes',
			cumulative_target				as 'hour.cumulative_target',
			cumulative_actual				as 'hour.cumulative_actual',
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
				p2.order_number,		-- as 'Production.order_number', 
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
		Where o.shift_code = o2.shift_code
		Order By 
			o.hour_interval_start
		For Json path, INCLUDE_NULL_VALUES
		) as 'productionday.hour'
	From @Output o2
	Group By 
		o2.shift_code,
		o2.shift_sequence
	Order By
		o2.shift_sequence
	For Json path, INCLUDE_NULL_VALUES
	)

Select @json_out as 'ProductionDay_Data'

--Select * From @Output
--Select * From @Production
--Select * From @DT
--Select * From @Comment
--Select * From @Shift_Hours

Return

END


/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_Shift_Data]    Script Date: 4/12/2019 15:19:33 ******/
SET ANSI_NULLS ON
