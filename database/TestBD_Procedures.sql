/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Create_OrderData]    Script Date: 4/12/2019 15:13:55 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Create_OrderData
--
--  Purpose:

--	Given all the order info like asset, product, qty, UOM, routed_cycle_time, etc, create a new  OrderData row
--
--	The expectation is that this is to be used by supervisors, but rarely. If there is a situation where order 
--	information is not normally passed in, this is allows for manual creation.
--
--	An asset can have only one active order. When this is called, it will close whatever is currently active
--	and make the newly created order active
--
--	Returns a status and a message
--		 0 is pass
--		-1 is fail
--		
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
--	OrderData
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20190828		C00V00 - Intial code created		
--	20190907		C00V01 - Set quoted_identifier on because filtered indexed added		
--	20191203		C00V02 - Change Asset_Code for Asset_Id
--		
-- Example Call:
-- exec spLocal_EY_DxH_Create_OrderData 40, '1 1/4 FF-SS PS',25,'PCS', 325, 18, 0.75,'setup','821795000101', Null, Null
--
ALTER PROCEDURE [dbo].[spLocal_EY_DxH_Create_OrderData]
--Declare
	@Asset_Id					INT,			-- required and must be in Asset table
	@Product_Code				Varchar(100),	-- required and must be in Product table
	@Order_Quantity				Float,			-- should be greater than 0
	@UOM_Code					Varchar(100),	-- required and must be in UOM table
	@Routed_Cycle_Time			Float,			-- seconds to create one part, can use default common parameter
	@Minutes_Allowed_Per_Setup	Float,			-- Not required 
	@Target_Percent_Of_Ideal	Float,			-- can use default common parameter
	@Production_Status			Varchar(100),	-- setup or production
	@Clock_Number				Varchar(100),	-- used to look up First and Last, leave Null if you have first and last
	@First_Name					Varchar(100),	-- Leave Null if you send Clock Number
	@Last_Name					Varchar(100)	-- Leave Null if you send Clock Number
AS

BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;

Declare @Output table
	(
	Id							Int Identity,  
	order_number				Varchar(100), 
	asset_id					INT, 
	product_code				Varchar(100), 
	order_quantity				Float, 
	UOM_code					Varchar(100), 
	routed_cycle_time			Float, 
	minutes_allowed_per_setup	Float, 
	target_percent_of_ideal		Float, 
	production_status			Varchar(100), 
	setup_start_time			Datetime,
	production_start_time		Datetime,
	start_time					Datetime, 
	is_current_order			Bit, 
	entered_by					Varchar(100), 
	entered_on					Datetime, 
	last_modified_by			Varchar(100), 
	last_modified_on			Datetime,
	message						Varchar(100)
	)

Declare
	@First						Varchar(50),
	@Last						Varchar(50),
	@Initials					Varchar(50),	
	@Order_Id					Int,
	@Existing_Order_Id			Int,
	@Existing_Production_Status	Varchar(100),
	@ReturnStatus				Int,
	@ReturnMessage				Varchar(1000),
	@Site_Timezone				Varchar(100),
	@Timestamp					Datetime,
	@Timestamp_UTC				Datetime,
	@Setup_Start_Time			Datetime,		
	@Production_Start_Time		Datetime,
	@Order_Number				Varchar(100),
	@site_code					Varchar(100),
	@Site_Id					Int

SET @site_code = (SELECT site_code
				FROM dbo.Asset		
				WHERE asset_id = @asset_id)
SET @site_id = (SELECT site_id 
				FROM dbo.CommonParametersTest
				WHERE site_name = @site_code
				AND status = 'Active')

Select @Site_Timezone = site_timezone
From dbo.CommonParametersTest cp with (nolock)
Where site_id = @site_id
	And cp.status = 'Active'

Select @Timestamp = getutcdate() at time zone 'UTC' at time zone @Site_Timezone
Select @Timestamp_UTC = @Timestamp at time zone @Site_Timezone at time zone 'UTC'

If not exists (Select asset_id From dbo.Asset with (nolock) Where asset_id = IsNull(@Asset_Id,''))
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Asset Id ' + convert(varchar,IsNull(@Asset_Id,''))
	Goto ErrExit
End

If not exists (Select product_id From dbo.Product with (nolock) Where product_code = IsNull(@Product_Code,''))
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Product Code ' + convert(varchar,IsNull(@Product_Code,''))
	Goto ErrExit
End

If IsNull(@Order_Quantity,0) <= 0
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Order Quantity ' + convert(varchar,IsNull(@Order_Quantity,''))
	Goto ErrExit
End

If not exists (Select UOM_id From dbo.UOM with (nolock) Where UOM_code = IsNull(@UOM_Code,''))
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid UOM Code ' + convert(varchar,IsNull(@UOM_Code,''))
	Goto ErrExit
End

If IsNull(@Routed_Cycle_Time,0) <= 0
Begin
	Select @Routed_Cycle_Time = convert(float, default_routed_cycle_time)
	From dbo.CommonParametersTest cp with (nolock)
	Where cp.site_id = @site_id
		And status = 'Active'
End

If IsNull(@Minutes_Allowed_Per_Setup,0) <= 0
Begin
	Select @Minutes_Allowed_Per_Setup = convert(float, default_setup_minutes)
	From dbo.CommonParametersTest cp with (nolock)
	Where cp.site_id = @site_id
		And status = 'Active'
End

If IsNull(@Target_Percent_Of_Ideal,0) <= 0
Begin
	Select @Target_Percent_Of_Ideal = convert(float, default_target_percent_of_ideal)
	From dbo.CommonParametersTest cp with (nolock)
	Where cp.site_id = @site_id
		And status = 'Active'
End

If IsNull(@Production_Status,'') not in ( 'Setup','Production')
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Production Status ' + convert(varchar,IsNull(@Production_Status,''))
		Goto ErrExit
End

If exists (Select Badge From dbo.TFDUsers with (nolock) Where Badge = IsNull(@Clock_Number,-1))
Begin
	Select @First = [First Name],
		@Last = [Last Name]
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

If IsDate(@Timestamp)  <> 1 
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Timestamp ' + convert(varchar,IsNull(@Timestamp,''))
		Goto ErrExit
End

-- Find the current active order on this asset 
-- 
If exists (Select Order_Id From dbo.OrderData with (nolock) Where asset_id = @Asset_Id And is_current_order = 1)
Begin
	Select top 1
		@Existing_Order_Id = Order_Id,
		@Existing_Production_Status = production_status 
	From dbo.OrderData with (nolock)
	Where asset_id = @Asset_Id 
		And is_current_order = 1
	Order By
		entered_on desc 
End

Select @Order_Number = CONVERT(VARCHAR,@Asset_Id) 
	+ '_' 
	+ replace(replace(replace(replace(convert(varchar,@Timestamp,121),' ',''),'-',''),':',''),',','')

If exists 
	(
	Select order_Id 
	From dbo.OrderData with (nolock) 
	Where asset_id = @Asset_Id 
		And order_number = @Order_Number
	)
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Order number exists ' + convert(varchar,IsNull(@Order_Number,''))
		Goto ErrExit
End

Insert @Output
	(
	order_number, 
	asset_id, 
	product_code, 
	order_quantity, 
	UOM_code, 
	routed_cycle_time, 
	minutes_allowed_per_setup, 
	target_percent_of_ideal, 
	production_status, 
	setup_start_time,
	production_start_time,
	start_time, 
	is_current_order, 
	entered_by, 
	entered_on, 
	last_modified_by, 
	last_modified_on,
	message
	)
	Select 
		@Order_Number,
		@Asset_Id,
		@Product_Code,
		@Order_Quantity,
		@UOM_Code,
		@Routed_Cycle_Time,
		@Minutes_Allowed_Per_Setup,
		@Target_Percent_Of_Ideal,
		@Production_Status,
		Null		as 'setup_start_time',
		Null		as 'production_start_time',
		@Timestamp	as 'start_time',
		0			as 'is_current_order',	--Need to Update after insert and after updating existing
		@Initials,
		@Timestamp_UTC,
		@Initials,
		@Timestamp_UTC,
		Null

If @Production_Status = 'Setup'
Begin
	Update @Output
	Set setup_start_time = @Timestamp
End
Else
Begin
	Update @Output
	Set production_start_time = @Timestamp
End

	Insert dbo.OrderData
		(
		order_number, 
		asset_id, 
		product_code, 
		order_quantity, 
		UOM_code, 
		routed_cycle_time, 
		minutes_allowed_per_setup, 
		target_percent_of_ideal, 
		production_status, 
		setup_start_time,
		production_start_time,
		start_time, 
		is_current_order, 
		entered_by, 
		entered_on, 
		last_modified_by, 
		last_modified_on
		)
		Select 
			order_number, 
			asset_id, 
			product_code, 
			order_quantity, 
			UOM_code, 
			routed_cycle_time, 
			minutes_allowed_per_setup, 
			target_percent_of_ideal, 
			production_status, 
			setup_start_time,
			production_start_time,
			start_time, 
			is_current_order, 
			entered_by, 
			entered_on, 
			last_modified_by, 
			last_modified_on		
		From @Output			

		Set @Order_Id =  SCOPE_IDENTITY()

--
If IsNull(@Order_Id,1) > 1 -- the insert into @Output is 1 
Begin
	If IsNull(@Existing_Order_Id,0) > 0
	Begin
		If IsNull(@Existing_Production_Status,'') = 'Setup'
		Begin
			Update OrderData
			Set is_current_order = 0,
				setup_end_time = @Timestamp,
				end_time = @Timestamp,
				last_modified_by = @Initials,
				last_modified_on = @Timestamp_UTC
			Where order_id = @Existing_Order_Id
				And is_current_order = 1 
		End
		Else
		Begin
			Update OrderData
			Set is_current_order = 0,
				production_end_time = @Timestamp,
				end_time = @Timestamp,
				last_modified_by = @Initials,
				last_modified_on = @Timestamp_UTC
			Where order_id = @Existing_Order_Id
				And is_current_order = 1 
		End
	End

	Update OrderData
	Set is_current_order = 1
	Where order_id = @Order_Id

	Select 
		@ReturnStatus = 0,
		@ReturnMessage = 'Inserted ' + convert(varchar,@Order_Id)
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

Return

END


/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Edit_ProductionData]    Script Date: 4/12/2019 15:14:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO

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
ALTER PROCEDURE [dbo].[spLocal_EY_DxH_Edit_ProductionData]
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
	Select @First = [First Name],
		@Last = [Last Name]
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
		From dbo.CommonParametersTest cpt with (nolock)
		Where site_id = @Site_Id AND status = 'Active';
	End

	If IsNull(@Target_Percent_Of_Ideal,-1) < 0
	Begin
		Select @Target_Percent_Of_Ideal = convert(float,default_target_percent_of_ideal)
		From dbo.CommonParametersTest cpt with (nolock)
		Where site_id = @Site_Id AND status = 'Active';
	End

	-- Remaining Quantity is Order Quantity - Produced
	-- Don't look back to the beginning of time, but this needs to cover the longest time an order can run
	Select @Setup_Lookback_Minutes = convert(float,setup_lookback_minutes)
	From dbo.CommonParametersTest cpt with (nolock)
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
	From dbo.CommonParametersTest cpt with (nolock)
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


/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_Asset]    Script Date: 4/12/2019 15:14:37 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO

--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_Asset
--
--  Purpose:

--	Provide Asset info for displays
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
--	
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20190903		C00V00 - Intial code created		
--  20191203		C00V01 - Change Asset_Code for Asset_Id
--		
-- Example Call:
-- exec spLocal_EY_DxH_Get_Asset 'Cell','Partially_Manual_Scan_Order', 1
--
ALTER   PROCEDURE [dbo].[spLocal_EY_DxH_Get_Asset]
--Declare
	@Level				Varchar(100),	--All, Site, Area, or Cell. Most of the time send Cell 
	@Automation_Level	Varchar(100),	--All, Automated, Partially_Manual_Scan_Order, Manual
	@Site				Int				--Asset_id of the Site
AS

BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;

Declare @Output table
	(
	Id						Int Identity,
	asset_id				Int, 
	asset_code				Varchar(100),
	asset_name				Varchar(200),
	asset_description		Varchar(256),
	asset_level				Varchar(100),
	site_code				Varchar(100),
	parent_asset_code		Varchar(100),
	value_stream			Varchar(100),
	automation_level		Varchar(100),
	include_in_escalation	bit,
	grouping1				Varchar(100),
	grouping2				Varchar(100),
	grouping3				Varchar(100),
	grouping4				Varchar(100),
	grouping5				Varchar(100),
	message					Varchar(100)
	)

Declare
	@ReturnMessage			Varchar(100),
	@json_out				nVarchar(max),
	@site_code				Varchar(100)

Set @site_code = (Select site_code from dbo.Asset where asset_id = @Site)

If IsNull(@Level,'All') not in ('All','Site','Area','Cell')
Begin
	Select 
		@ReturnMessage = 'Invalid Level ' + convert(varchar,IsNull(@Level,''))
	Goto ErrExit

End

If IsNull(@Level,'All') = 'All'
Begin
	Set @Level = Null 
End

If IsNull(@Automation_Level,'All') not in ('All','Automated','Partially_Manual_Scan_Order','Manual')
Begin
	Select 
		@ReturnMessage = 'Invalid Automation Level ' + convert(varchar,IsNull(@Automation_Level,''))
	Goto ErrExit

End

If IsNull(@Automation_Level,'All') = 'All'
Begin
	Set @Automation_Level = Null 
End


Insert @Output
	Select 
		asset_id,
		asset_code,
		asset_name,
		asset_description,
		asset_level,
		site_code,
		parent_asset_code,
		value_stream,
		automation_level,
		include_in_escalation,
		grouping1,
		grouping2,
		grouping3,
		grouping4,
		grouping5,
		Null
	From dbo.Asset with (nolock)
	Where status = 'Active'
		And site_code = @site_code
		And IsNull(asset_level,'') = IsNull(@Level,IsNull(asset_level,''))
		And IsNull(automation_level,'') = IsNull(@Automation_Level,IsNull(automation_level,''))

ErrExit:

If not exists (Select Id From @Output)
Begin
	If IsNull(@ReturnMessage,'') <> ''
	Begin
		Insert @Output (asset_level,automation_level,message)
			Select
				@Level,
				@Automation_Level,
				@ReturnMessage 
	End
	Else
	Begin
		Insert @Output (asset_level,automation_level,message)
			Select
				@Level,
				@Automation_Level,
				'No Data' 
	End
End	

Select @json_out = 
	(
	Select 
		asset_id				as 'Asset.asset_id',			
		asset_code				as 'Asset.asset_code',
		asset_name				as 'Asset.asset_name',
		asset_description		as 'Asset.asset_descriptiomn',
		asset_level				as 'Asset.asset_level',
		site_code				as 'Asset.site_code',
		parent_asset_code		as 'Asset.parent_asset_code',
		value_stream			as 'Asset.value_stream',
		automation_level		as 'Asset.automation_level',
		include_in_escalation	as 'Asset.include_in_escalation',
		grouping1				as 'Asset.grouping1',
		grouping2				as 'Asset.grouping2',
		grouping3				as 'Asset.grouping3',
		grouping4				as 'Asset.grouping4',
		grouping5				as 'Asset.grouping5',
		message					as 'Asset.message'	
	From @Output o 
	Order By 
		o.asset_code
	For Json path, INCLUDE_NULL_VALUES
	)

Select @json_out as 'Asset'

--Select * From @Output

Return

END


/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_Asset_By_Code]    Script Date: 4/12/2019 15:15:06 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO




--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_Asset_By_Code
--
--  Purpose:

--	Provide Specifc Asset info to display
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
--	
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20191202		C00V00 - Intial code created
--		
-- Example Call:
-- exec spLocal_EY_DxH_Get_Asset_By_Code '34002'
--
ALTER PROCEDURE [dbo].[spLocal_EY_DxH_Get_Asset_By_Code]
--Declare
	@Asset_Code				Varchar(100)				--Asset_Code of the Site
AS

BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;

Declare @Output table
	(
	Id						Int Identity,
	asset_id				Int, 
	asset_code				Varchar(100),
	asset_name				Varchar(200),
	asset_description		Varchar(256),
	asset_level				Varchar(100),
	site_code				Varchar(100),
	parent_asset_code		Varchar(100),
	value_stream			Varchar(100),
	automation_level		Varchar(100),
	include_in_escalation	bit,
	grouping1				Varchar(100),
	grouping2				Varchar(100),
	grouping3				Varchar(100),
	grouping4				Varchar(100),
	grouping5				Varchar(100),
	message					Varchar(100)
	)

Declare
	@ReturnMessage			Varchar(100),
	@json_out				nVarchar(max),
	@site_code				Varchar(100)


Insert @Output
	Select 
		asset_id,
		asset_code,
		asset_name,
		asset_description,
		asset_level,
		site_code,
		parent_asset_code,
		value_stream,
		automation_level,
		include_in_escalation,
		grouping1,
		grouping2,
		grouping3,
		grouping4,
		grouping5,
		Null
	From dbo.Asset with (nolock)
	Where status = 'Active'
		And asset_code = @Asset_Code

ErrExit:

If not exists (Select Id From @Output)
Begin
	If IsNull(@ReturnMessage,'') <> ''
	Begin
		Insert @Output (message)
			Select
				@ReturnMessage 
	End
	Else
	Begin
		Insert @Output (message)
			Select
				'No Data' 
	End
End	

Select @json_out = 
	(
	Select 
		asset_id				as 'Asset.asset_id',			
		asset_code				as 'Asset.asset_code',
		asset_name				as 'Asset.asset_name',
		asset_description		as 'Asset.asset_descriptiomn',
		asset_level				as 'Asset.asset_level',
		site_code				as 'Asset.site_code',
		parent_asset_code		as 'Asset.parent_asset_code',
		value_stream			as 'Asset.value_stream',
		automation_level		as 'Asset.automation_level',
		include_in_escalation	as 'Asset.include_in_escalation',
		grouping1				as 'Asset.grouping1',
		grouping2				as 'Asset.grouping2',
		grouping3				as 'Asset.grouping3',
		grouping4				as 'Asset.grouping4',
		grouping5				as 'Asset.grouping5',
		message					as 'Asset.message'	
	From @Output o 
	Order By 
		o.asset_code
	For Json path, INCLUDE_NULL_VALUES
	)

Select @json_out as 'Asset'

--Select * From @Output

Return

END


/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_AssetDisplaySystem]    Script Date: 4/12/2019 15:15:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO



--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_AssetDisplaySystem
--
--  Purpose:

--	Given a display system name, provide the associated sset_code info for displays
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
--	
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20190910		C00V00 - Intial code created		
--		
-- Example Call:
-- exec spLocal_EY_DxH_Get_AssetDisplaySystem 'CR2080435W1'
--
ALTER PROCEDURE [dbo].[spLocal_EY_DxH_Get_AssetDisplaySystem]
--Declare
	@DisplaySystem_Name	Varchar(100)	-- the name of the computer system or other identifier
AS

BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;

Declare @Output table
	(
	Id						Int Identity,
	displaysystem_name		Varchar(200),
	asset_id				Int, 
	asset_code				Varchar(100),
	asset_name				Varchar(200),
	asset_description		Varchar(256),
	asset_level				Varchar(100),
	site_code				Varchar(100),
	parent_asset_code		Varchar(100),
	value_stream			Varchar(100),
	automation_level		Varchar(100),
	include_in_escalation	bit,
	grouping1				Varchar(100),
	grouping2				Varchar(100),
	grouping3				Varchar(100),
	grouping4				Varchar(100),
	grouping5				Varchar(100),
	message					Varchar(100)
	)

Declare
	@ReturnMessage			Varchar(100),
	@json_out				nVarchar(max)

If IsNull(@DisplaySystem_Name,'') = ''
Begin
	Select 
		@ReturnMessage = 'Invalid DisplaySystem_Name ' + convert(varchar,IsNull(@DisplaySystem_Name,''))
	Goto ErrExit

End

Insert @Output
	Select top 1
		ads.displaysystem_name,
		a.asset_id, 
		a.asset_code,
		a.asset_name,
		a.asset_description,
		a.asset_level,
		a.site_code,
		a.parent_asset_code,
		a.value_stream,
		a.automation_level,
		a.include_in_escalation,
		a.grouping1,
		a.grouping2,
		a.grouping3,
		a.grouping4,
		a.grouping5,
		Null
	From dbo.Asset a with (nolock),
		dbo.AssetDisplaySystem ads with (nolock)
	Where a.asset_id = ads.asset_id
		And a.status = 'Active'
		And ads.status = 'Active'
		And ads.displaysystem_name = IsNull(@DisplaySystem_Name,'')

ErrExit:

If not exists (Select Id From @Output)
Begin
	If IsNull(@ReturnMessage,'') <> ''
	Begin
		Insert @Output (displaysystem_name,asset_id,message)
			Select
				@DisplaySystem_Name,
				1,
				@ReturnMessage 
	End
	Else
	Begin
		Insert @Output (displaysystem_name,asset_id,message)
			Select
				@DisplaySystem_Name,
				1,
				'No Data' 
	End
End	

Select @json_out = 
	(
	Select 	
		displaysystem_name		as 'AssetDisplaySystem.displaysystem_name',
		asset_id				as 'AssetDisplaySystem.asset_id',
		asset_code				as 'AssetDisplaySystem.asset_code',
		asset_name				as 'AssetDisplaySystem.asset_name',
		asset_description		as 'AssetDisplaySystem.asset_description',
		asset_level				as 'AssetDisplaySystem.asset_level',
		site_code				as 'AssetDisplaySystem.site_code',
		parent_asset_code		as 'AssetDisplaySystem.parent_asset_code',
		value_stream			as 'AssetDisplaySystem.value_stream',
		automation_level		as 'AssetDisplaySystem.automation_level',
		include_in_escalation	as 'AssetDisplaySystem.include_in_escalation',
		grouping1				as 'AssetDisplaySystem.grouping1',
		grouping2				as 'AssetDisplaySystem.grouping2',
		grouping3				as 'AssetDisplaySystem.grouping3',
		grouping4				as 'AssetDisplaySystem.grouping4',
		grouping5				as 'AssetDisplaySystem.grouping5',
		message					as 'AssetDisplaySystem.message'
	From @Output o 
	Order By 
		o.asset_id
	For Json path, INCLUDE_NULL_VALUES
	)

Select @json_out as 'AssetDisplaySystem'

--Select * From @Output

Return

END


/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_CommonParameters]    Script Date: 4/12/2019 15:15:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO


--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_CommonParameters
--
--  Purpose:

--	Provide the CommonParameter info
--
--	If no input value given for parameter, all CommonParameters are returned
--	If a specific parameter is given as input, only that parameter is returned
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
--	
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20190906		C00V00 - Intial code created		
--	20191129		C00V01 - Change to CommonParametersTest new requirement
--
-- Example Call:
-- exec spLocal_EY_DxH_Get_CommonParameters 1
--
ALTER PROCEDURE [dbo].[spLocal_EY_DxH_Get_CommonParameters]
--Declare
	@Site_Id			INT
AS


BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;

Declare @Output table
	(
	Id								Int Identity,
	parameter_id					Int, 
	site_id							Int,
	site_name						NVARCHAR(100),
	production_day_offset_minutes	FLOAT,
	site_timezone					NVARCHAR(100),
	ui_timezone						NVARCHAR(100),
	escalation_level1_minutes		FLOAT,
	escalation_level2_minutes		FLOAT,
	default_target_percent_of_ideal FLOAT,
	default_setup_minutes			FLOAT,
	default_routed_cycle_time		FLOAT,
	setup_lookback_minutes			FLOAT,
	inactive_timeout_minutes		FLOAT,
	language						NVARCHAR(100),
	message							Varchar(100)
	)

Declare
	@ReturnMessage				Varchar(100),
	@json_out					nVarchar(max)

If 
	(
	IsNull(@Site_Id,'') <> ''
	And
	not exists (Select site_id From dbo.CommonParametersTest with (nolock) Where site_id = IsNull(@Site_Id,0) AND status = 'Active')
	)
Begin
	Select 
		@ReturnMessage = 'Invalid Site Id ' + convert(varchar,IsNull(@Site_Id,''))
	Goto ErrExit
End

	Insert @Output
		Select 
			parameter_id,
			site_id,
			site_name,
			production_day_offset_minutes,
			site_timezone,
			ui_timezone,
			escalation_level1_minutes,
			escalation_level2_minutes,
			default_target_percent_of_ideal,
			default_setup_minutes,
			default_routed_cycle_time,
			setup_lookback_minutes,
			inactive_timeout_minutes,
			language,
			Null
		From dbo.CommonParametersTest with (nolock)
		Where site_id = IsNull(@Site_Id,site_id) AND status = 'Active'

ErrExit:

If not exists (Select Id From @Output)
Begin
	If IsNull(@ReturnMessage,'') <> ''
	Begin
		Insert @Output (site_id,message)
			Select
				@Site_Id,
				@ReturnMessage 
	End
	Else
	Begin
		Insert @Output (site_id,message)
			Select
				@Site_Id,
				'No Data' 
	End
End	

Select @json_out = 
	(
	Select 
		parameter_id						as 'CommonParameters.parameter_id',
		site_id								as 'CommonParameters.site_id',
		site_name							as 'CommonParameters.site_name',
		production_day_offset_minutes		as 'CommonParameters.production_day_offset_minutes',
		site_timezone						as 'CommonParameters.site_timezone',
		ui_timezone							as 'CommonParameters.ui_timezone',
		escalation_level1_minutes			as 'CommonParameters.escalation_level1_minutes',
		escalation_level2_minutes			as 'CommonParameters.escalation_level2_minutes',
		default_target_percent_of_ideal		as 'CommonParameters.default_target_percent_of_ideal',
		default_setup_minutes				as 'CommonParameters.default_setup_minutes',
		default_routed_cycle_time			as 'CommonParameters.default_routed_cycle_time',
		setup_lookback_minutes				as 'CommonParameters.setup_lookback_minutes',
		inactive_timeout_minutes			as 'CommonParameters.inactive_timeout_minutes',
		language							as 'CommonParameters.language',
		message								as 'CommonParameters.message'	
	From @Output o 
	Order By 
		o.parameter_id
	For Json path, INCLUDE_NULL_VALUES
	)

Select @json_out as 'CommonParameters'

--Select * From @Output

Return

END


/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_DTReason]    Script Date: 4/12/2019 15:16:22 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO

--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_DTReason
--
--  Purpose:

--	Given an asset_code, provide the info for displaying DTReason
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
--	
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20190814		C00V00 - Intial code created
--  20191203		C00V01 - Change Asset_Code for Asset_Id
--		
-- Example Call:
-- exec spLocal_EY_DxH_Get_DTReason 40
--
ALTER PROCEDURE [dbo].[spLocal_EY_DxH_Get_DTReason]
--Declare
	@Asset_Id			INT
AS

--Select @Asset_Id = 25

BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;

Declare @Output table
	(
	Id							Int Identity,
	dtreason_id					Int, 
	dtreason_code				Varchar(100),
	dtreason_name				Varchar(200),
	dtreason_category			Varchar(100),
	asset_id					INT,
	message						Varchar(100)
	)

Declare
	@ReturnMessage				Varchar(100),
	@json_out					nVarchar(max)

If not exists (Select asset_id From dbo.Asset with (nolock) Where asset_id = IsNull(@Asset_Id,0))
Begin
	Select 
		@ReturnMessage = 'Invalid Asset Id ' + convert(varchar,IsNull(@Asset_Id,0))
	Goto ErrExit
End

If IsNull(@Asset_Id,'') <> ''
Begin
	Insert @Output
		Select 
			dtreason_id,
			dtreason_code,
			dtreason_name,
			dtreason_category,
			asset_id,
			Null
		From dbo.DTReason with (nolock)
		Where asset_id = @Asset_Id
			And status = 'Active'
End

ErrExit:

If not exists (Select Id From @Output)
Begin
	If IsNull(@ReturnMessage,'') <> ''
	Begin
		Insert @Output (asset_id,message)
			Select
				@Asset_Id,
				@ReturnMessage 
	End
	Else
	Begin
		Insert @Output (asset_id,message)
			Select
				@Asset_Id,
				'No Data' 
	End
End	

Select @json_out = 
	(
	Select 
		dtreason_id			as 'DTReason.dtreason_id',			
		dtreason_code		as 'DTReason.reason_code',
		dtreason_name		as 'DTReason.dtreason_name',
		dtreason_category	as 'DTReason.dtreason_category',
		asset_id			as 'DTReason.asset_id',
		message				as 'DTReason.message'	
	From @Output o 
	Order By 
		o.dtreason_category,
		len(o.dtreason_code),	--trying to sort alpha numeric values as numbers
		o.dtreason_code
	For Json path, INCLUDE_NULL_VALUES
	)

Select @json_out as 'DTReason'

Return

END


/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_DxHDataId]    Script Date: 4/12/2019 15:16:46 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO



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
--	20191204		C00V03 - Change CommonParameters to CommonParametersTest
--		
-- Example Call:
-- Exec dbo.spLocal_EY_DxH_Get_DxHDataId 40, '2019-07-25 02:23', 0
--
ALTER PROCEDURE [dbo].[spLocal_EY_DxH_Get_DxHDataId]
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
FROM [dbo].[Asset] WHERE asset_level = 'Site' AND site_code = (SELECT site_code FROM [dbo].[Asset] WHERE asset_id=@Asset_Id);

Select @Production_Day_Offset_Minutes = convert(Int, production_day_offset_minutes)
From dbo.CommonParametersTest cpt with (nolock)
Where site_id = @Site_Id AND status = 'Active';

Set @Timestamp_Hour = datepart(hour,@Timestamp)
Set @Row = @Timestamp_Hour 
Set @Rows = 24 + @Row

-- Given a Timestamp, determine the Shift_Code
-- find the end time of the shift containing the hour of the @Timestamp
While @Row <= @Rows
Begin
	-- If Timestamp is in the first hour of a shift, then we know the shift already
	If exists (Select shift_id From dbo.Shift with (nolock) Where datepart(hour,start_time) = @Timestamp_Hour)
	Begin
		Select @Shift_Code = shift_code
		From dbo.Shift with (nolock) 
		Where datepart(hour,start_time) = @Row
			And status = 'Active'
--		Select @Shift_Code, ' In start Loop', datepart(hour,end_time) as 'Hour End Time' From dbo.Shift with (nolock) Where datepart(hour,end_time) = @Row
		break
	End

	--If Timestamp is not in the first hour of a shift, then keep adding an hour until you find the end_time
	If exists (Select shift_id From dbo.Shift with (nolock) Where datepart(hour,end_time) = @Row)
	Begin
		Select @Shift_Code = shift_code
		From dbo.Shift with (nolock) 
		Where datepart(hour,end_time) = @Row
			And status = 'Active'
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
GO
SET QUOTED_IDENTIFIER OFF
GO


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
--	20191204		C00V03 - Change CommonParameters to CommonParametersTest
--		
-- Example Call:
-- exec spLocal_EY_DxH_Get_InterShiftData 40,'2019-10-12','2'
--
ALTER PROCEDURE [dbo].[spLocal_EY_DxH_Get_InterShiftData]
--Declare
	@Asset_Id		INT,
	@Production_Day Datetime,
	@Shift_Code		Varchar(100)
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
	)

Declare @Output table
	(
	Id								Int Identity,
	intershift_id					Int,			
	asset_id						INT,
	production_day					Datetime,
	shift_code						Varchar(100),
	shift_name						Varchar(100),
	shift_start						Datetime,
	shift_end						Datetime,
	comment							Varchar(256),
	entered_by						Varchar(100),
	entered_on						Datetime,
	first_name						Varchar(100),
	last_name						Varchar(100),
	message							Varchar(256)	
	)

Declare 
	@Production_Day_Offset_Minutes		Int,	
	@Site_Timezone						Varchar(100),	
	@Calendar_Day_Start					Datetime,	
	@json_out							nVarchar(max),
	@MaxShiftSequence					Int,
	@Row								Int,
	@Rows								Int,
	@Previous_Shifts_To_Include			Int,
	@Site_Id							Int

SELECT @Site_Id = asset_id
FROM [dbo].[Asset] WHERE asset_level = 'Site' AND site_code = (SELECT site_code FROM [dbo].[Asset] WHERE asset_id=@Asset_Id);

Select @Production_Day_Offset_Minutes = convert(Int, production_day_offset_minutes)
From dbo.CommonParametersTest cpt with (nolock)
Where site_id = @Site_Id AND status = 'Active';

Select @Site_Timezone = site_timezone
From dbo.CommonParametersTest cpt with (nolock)
Where site_id = @Site_Id AND status = 'Active';

Select @MaxShiftSequence = max(shift_sequence)
From dbo.Shift with (nolock)

Select @Calendar_Day_Start = dateadd(minute,@Production_Day_Offset_Minutes,@Production_Day)
--Select @Calendar_Day_Start

Set @Previous_Shifts_To_Include = 2 

--Get the current shift and any prior shifts in the current Production Day 
Insert @Shifts_To_Consider
	Select 
		@Production_Day,
		s.shift_code,
		s.shift_name,
		s.shift_sequence,
		case 
			when shift_sequence = 1 then  @Calendar_Day_Start
			else dateadd(hour, convert(Int,datepart(hour,start_time)),@Production_Day)
		end as 'shift_start',
		Null as 'shift_end',
		Null as 'message'
	From dbo.Shift s with (nolock)
	Where s.shift_sequence <= 
		(
		Select s2.shift_sequence 
		From dbo.Shift s2 with (nolock) 
		Where s2.shift_code = @Shift_Code 
		And s2.status = 'Active'
		)
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

Insert @Output
		(
		intershift_id,			
		asset_id,
		production_day,
		shift_code,
		shift_name,
		shift_start,
		shift_end,
		comment,
		entered_by,
		entered_on,
		first_name,
		last_name,
		message	
		)
	Select 
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
		isd.last_name,
		Null				as 'message'
	From dbo.InterShiftData isd with (nolock),
		@Shifts_To_Consider stc
	Where isd.asset_id = @Asset_Id
		And isd.production_day = stc.production_day
		And isd.shift_code = stc.shift_code
		And stc.message = 'Include'
	Order By 
		stc.shift_start desc			

--update first and last names?

--Select * From @Output
--	For Json path, INCLUDE_NULL_VALUES
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
		intershift_id	as 'InterShiftData.intershift_id',			
		asset_id		as 'InterShiftData.asset_id',
		production_day	as 'InterShiftData.production_day',
		shift_code		as 'InterShiftData.shift_code',
		shift_name		as 'InterShiftData.shift_name',
		shift_start		as 'InterShiftData.shift_start',
		shift_end		as 'InterShiftData.shift_end',
		comment			as 'InterShiftData.comment',
		entered_by		as 'InterShiftData.entered_by',
		entered_on		as 'InterShiftData.entered_on',
		first_name		as 'InterShiftData.first_name',		
		last_name		as 'InterShiftData.last_name',
		message			as 'InterShiftData.message'	
	From @Output o 
	Order By 
		o.shift_start desc
	For Json path, INCLUDE_NULL_VALUES
	)

Select @json_out as 'InterShiftData'

--Select * From @Output
--Select * From @Shifts_To_Consider

Return

END


/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_OrderData]    Script Date: 4/12/2019 15:17:29 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO



--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_OrderData
--
--  Purpose:

--	Given an asset_code, and either the order_number or "current" flag, provide the info for displaying OrderData
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
--	
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20190827		C00V00 - Intial code created
--  20191203		C00V01 - Change Asset_Code for Asset_Id
--		
-- Example Call:
-- exec spLocal_EY_DxH_Get_OrderData 65, '14I084', Null
--
ALTER PROCEDURE [dbo].[spLocal_EY_DxH_Get_OrderData]
--Declare
	@Asset_Id			INT,
	@Order_Number		Varchar(100),	--leave Null if you send Is Current Order = 1
	@Is_Current_Order	bit				--leave Null or 0 if you send the order number
AS

--Select @Asset_Id = 1,
--	@Order_Number = '12345',
--	@Is_Current_Order = 0

BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;

Declare @Output table
	(
	Id							Int Identity,
	order_id					Int, 
	order_number				Varchar(100),
	asset_id					INT,
	product_code				Varchar(100),
	order_quantity				float,
	UOM_Code					Varchar(100),
	routed_cycle_time			Float,
	minutes_allowed_per_setup	Float,
--	ideal						Float,
	target_percent_of_ideal		Float,
	production_status			Varchar(100),
	setup_start_time			Datetime,
	setup_end_time				Datetime,
	production_start_time		Datetime,
	production_end_time			Datetime,
	start_time					Datetime,
	end_time					Datetime,
	is_current_order			bit,
	message						Varchar(100)
	)

Declare
	@ReturnMessage				Varchar(100),
	@json_out					nVarchar(max)

If not exists (Select asset_id From dbo.Asset with (nolock) Where asset_id = IsNull(@Asset_Id,''))
Begin
	Select 
		@ReturnMessage = 'Invalid Asset Id ' + convert(varchar,IsNull(@Asset_Id,''))
	Goto ErrExit
End

If IsNull(@Order_Number,'') = '' And IsNull(@Is_Current_Order,0) = 0
Begin
	Select 
		@ReturnMessage = 'Invalid Order Number ' + convert(varchar,IsNull(@Order_Number,''))
	Goto ErrExit
End

If 
	(
	IsNull(@Order_Number,'') <> '' 
	And 
	IsNull(@Is_Current_Order,0) = 0
	And 
	not exists 
		(
		Select order_id 
		From dbo.OrderData with (nolock) 
		Where order_number = IsNull(@Order_Number,'')
			And asset_id = IsNull(@Asset_Id,'') 
		)
	)
Begin
	Select 
		@ReturnMessage = 'Order Number not found  ' + convert(varchar,IsNull(@Order_Number,''))
	Goto ErrExit
End

If 
	(
	IsNull(@Order_Number,'') = '' 
	And 
	IsNull(@Is_Current_Order,0) = 1
	And not exists 
		(
		Select order_id 
		From dbo.OrderData with (nolock) 
		Where is_current_order = 1 
			And asset_id = IsNull(@Asset_Id,'')
		)
	)
Begin
	Select 
		@ReturnMessage = 'Current Order not found for asset_id ' + convert(varchar,IsNull(@Asset_Id,''))
	Goto ErrExit
End

-- If no order number, get it via is current order 
If 
	(
	IsNull(@Order_Number,'') = '' 
	And 
	IsNull(@Is_Current_Order,0) = 1
	And exists 
		(
		Select order_id 
		From dbo.OrderData with (nolock) 
		Where is_current_order = 1 
			And asset_id = IsNull(@Asset_Id,'')
			And is_current_order = 1
		)
	)
Begin
	Select top 1 
		@Order_Number = order_number 
	From dbo.OrderData with (nolock) 
	Where is_current_order = 1 
		And asset_id = IsNull(@Asset_Id,'')
		And is_current_order = 1
End

If IsNull(@Order_Number,'') = '' 
Begin
	Select 
		@ReturnMessage = 'Missing Order Number for Asset Id ' + convert(varchar,IsNull(@Asset_Id,''))
	Goto ErrExit
End

If IsNull(@Asset_Id,'') <> '' And IsNull(@Order_Number,'') <> ''
Begin
	Insert @Output
		Select 
			order_id, 
			order_number,
			asset_id,
			product_code,
			order_quantity,
			UOM_Code,
			routed_cycle_time,
			minutes_allowed_per_setup,
		--	ideal,
			target_percent_of_ideal,
			production_status,
			setup_start_time,
			setup_end_time,
			production_start_time,
			production_end_time,
			start_time,
			end_time,
			is_current_order,
			Null	as 'message'
		From dbo.OrderData with (nolock)
		Where asset_id = @Asset_Id
			And order_number = @Order_Number
End

ErrExit:

If not exists (Select Id From @Output)
Begin
	If IsNull(@ReturnMessage,'') <> ''
	Begin
		Insert @Output (asset_id, order_number, is_current_order, message)
			Select
				@Asset_Id,
				@Order_Number,
				@Is_Current_Order,
				@ReturnMessage 
	End
	Else
	Begin
		Insert @Output (asset_id, order_number, is_current_order, message)
			Select
				@Asset_Id,
				@Order_Number,
				@Is_Current_Order,
				'No Data' 
	End
End	

Select @json_out = 
	(
	Select 
		order_id					as 'OrderData.order_id', 
		order_number				as 'OrderData.order_number',
		asset_id					as 'OrderData.asset_id',
		product_code				as 'OrderData.product_code',
		order_quantity				as 'OrderData.order_quantity',
		UOM_Code					as 'OrderData.UOM_Code',
		routed_cycle_time			as 'OrderData.routed_cycle_time',
		minutes_allowed_per_setup	as 'OrderData.minutes_allowed_per_setup',
	--	ideal						as 'OrderData.',
		target_percent_of_ideal		as 'OrderData.target_percent_of_ideal',
		production_status			as 'OrderData.production_status',
		setup_start_time			as 'OrderData._setup_start_time',
		setup_end_time				as 'OrderData.setup_end_time',
		production_start_time		as 'OrderData.production_start_time',
		production_end_time			as 'OrderData.production_end_time',
		start_time					as 'OrderData.start_time',
		end_time					as 'OrderData.end_time',
		is_current_order			as 'OrderData.is_current_order',
		message						as 'OrderData.message'
	From @Output o 
	For Json path, INCLUDE_NULL_VALUES
	)

Select @json_out as 'OrderData'

--Select * From @Output

Return

END


/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_Product]    Script Date: 4/12/2019 15:17:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO


--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_Product
--
--  Purpose:

--	Provide the info for displaying Product
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
--	
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20190827		C00V00 - Intial code created		
--		
-- Example Call:
-- exec spLocal_EY_DxH_Get_Product 
--
ALTER PROCEDURE [dbo].[spLocal_EY_DxH_Get_Product]
--Declare
AS


BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;

Declare @Output table
	(
	Id							Int Identity,
	product_id					Int, 
	product_code				Varchar(100),
	product_name				Varchar(200),
	product_description			Varchar(256),
	product_family				Varchar(100),
	value_stream				Varchar(100),
	grouping1					Varchar(100),
	grouping2					Varchar(100),
	grouping3					Varchar(100),
	grouping4					Varchar(100),
	grouping5					Varchar(100),
	message						Varchar(100)
	)

Declare
	@ReturnMessage				Varchar(100),
	@json_out					nVarchar(max)

Insert @Output
	Select 
		product_id,
		product_code,
		product_name,
		product_description,
		product_family,
		value_stream,
		grouping1,
		grouping2,
		grouping3,
		grouping4,
		grouping5,
		Null
	From dbo.Product with (nolock)
	Where status = 'Active'

ErrExit:

If not exists (Select Id From @Output)
Begin
	Insert @Output (product_code,message)
		Select
			'No Data',
			IsNull(@ReturnMessage,'No Data') 
End	

Select @json_out = 
	(
	Select 
		product_id			as 'Product.product_id',			
		product_code		as 'Product.product_code',
		product_name		as 'Product.product_name',
		product_description as 'Product.product_description',
		product_family		as 'Product.product_family',
		value_stream		as 'Product.value_stream',
		grouping1			as 'Product.grouping1',
		grouping2			as 'Product.grouping2',
		grouping3			as 'Product.grouping3',
		grouping4			as 'Product.grouping4',
		grouping5			as 'Product.grouping5',
		message				as 'Product.message'	
	From @Output o 
	Order By 
		o.product_family,
		o.product_code
	For Json path, INCLUDE_NULL_VALUES
	)

Select @json_out as 'Product'

--Select * From @Output Order by product_family, product_code

Return

END


/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_ProductionDay_Data]    Script Date: 4/12/2019 15:18:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO


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
--	20191204		C00V03 - Change CommonParameters to CommonParametersTest
--		
-- Example Call:
-- exec spLocal_EY_DxH_Get_ProductionDay_Data 40,'2019-07-25'
--
ALTER PROCEDURE [dbo].[spLocal_EY_DxH_Get_ProductionDay_Data]
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
From dbo.CommonParametersTest cpt with (nolock)
Where site_id = @Site_Id AND status = 'Active';

Select @Production_Day_Offset_Minutes = convert(Int, production_day_offset_minutes)
From dbo.CommonParametersTest cpt with (nolock)
Where site_id = @Site_Id AND status = 'Active';

Select @Site_Timezone = site_timezone
From dbo.CommonParametersTest cpt with (nolock)
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
	From dbo.CommonParametersTest cpt with (nolock)
	Where site_id = @Site_Id AND status = 'Active';
End

If @Prediction_Routed_Cycle_Time is Null
Begin
	Select @Prediction_Routed_Cycle_Time = 300
End

If @Prediction_Target_Percent_Of_Ideal is Null
Begin
	Select @Prediction_Target_Percent_Of_Ideal = convert(float,default_target_percent_of_ideal)
	From dbo.CommonParametersTest cpt with (nolock)
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
GO
SET QUOTED_IDENTIFIER OFF
GO





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
--	20191204		C00V09 - Change CommonParameters to CommonParametersTest
--		
-- Example Call:
-- exec spLocal_EY_DxH_Get_Shift_Data 40,'2019-11-12','2'
--
ALTER   PROCEDURE [dbo].[spLocal_EY_DxH_Get_Shift_Data]
--Declare
	@Asset_Id		INT,
	@Production_Day Datetime,
	@Shift_Code		Varchar(100)
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
	@Site_Id							Int

SET @site_code = (SELECT site_code
				FROM dbo.Asset		
				WHERE asset_id = @asset_id)

Set @Shift1 = (Select datepart(hour, start_time) from dbo.Shift where shift_sequence = 2)
Set @Shift2 = (Select datepart(hour, start_time) from dbo.Shift where shift_sequence = 3) 
Set @Shift3 = (Select datepart(hour, start_time) from dbo.Shift where shift_sequence = 1)

Set @Hour = @Shift_Code
If @Hour >= @Shift1 and @Hour < @Shift2
Begin
Set @Shift_Code = '1'
End
If @Hour >= @Shift2 and @Hour < @Shift3
Begin
Set @Shift_Code = '2'
End
If @Hour >= @Shift3 or @Hour < @Shift1
Begin
Set @Shift_Code = '3'
End

IF @Hour = 23
Begin
Set @Production_Day = (SELECT DATEADD(DAY, 1, @Production_Day))
End

Select 
	@Loop = 1,
	@Hours = duration_in_minutes/60,
	@IsFirst = is_first_shift_of_day 
From dbo.Shift with (nolock)
Where shift_code = @Shift_Code
	And status = 'Active';

SELECT @Site_Id = asset_id
FROM [dbo].[Asset] WHERE asset_level = 'Site' AND site_code = (SELECT site_code FROM [dbo].[Asset] WHERE asset_id=@asset_id);

Select @Setup_Lookback_Minutes = convert(Int, setup_lookback_minutes)
From dbo.CommonParametersTest cpt with (nolock)
Where site_id = @Site_Id AND status = 'Active';

Select @Production_Day_Offset_Minutes = convert(Int, production_day_offset_minutes)
From dbo.CommonParametersTest cpt with (nolock)
Where site_id = @Site_Id AND status = 'Active';

Select @Site_Timezone = site_timezone
From dbo.CommonParametersTest cpt with (nolock)
Where site_id = @Site_Id AND status = 'Active';

--Select @Production_Day_Offset_Minutes = 420, @IsFirst = 1

Select @Calendar_Day_Start = dateadd(minute,@Production_Day_Offset_Minutes,@Production_Day)

--Select @Calendar_Day_Start
--Select @Production_Day_Offset_Minutes

Select 
	@First = convert(Int,datepart(hour,start_time)),
	@Shift_Sequence = shift_sequence
From dbo.Shift
Where shift_code = @Shift_Code
	And status = 'Active'

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
				summary_ideal = convert(Int,p.ideal),
				summary_target = convert(Int,p.target),
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
	From dbo.CommonParametersTest cpt with (nolock)
	Where site_id = @Site_Id AND status = 'Active';
End

If @Prediction_Routed_Cycle_Time is Null
Begin
	Select @Prediction_Routed_Cycle_Time = 300
End

If @Prediction_Target_Percent_Of_Ideal is Null
Begin
	Select @Prediction_Target_Percent_Of_Ideal = convert(float,default_target_percent_of_ideal)
	From dbo.CommonParametersTest cpt with (nolock)
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

		If 
			(
			Select ((3600 - IsNull(summary_breakandlunch_minutes,0) * 60.0) / @Prediction_Routed_Cycle_Time)
			From @Output
			Where Id = (@MinNoProd - 1) + @ShiftCounter
			) > @Prediction_Remaining_Quantity
		Begin
			Update @Output
			Set summary_ideal = convert(Int,@Prediction_Remaining_Quantity)
			From @Output o
			Where Id = (@MinNoProd - 1) + @ShiftCounter
				And not exists (Select Id From @Production p Where p.dxhdata_id = o.dxhdata_id)
		End
		Else
		Begin

			Update @Output
			Set summary_ideal = convert(Int,((3600 - IsNull(summary_breakandlunch_minutes,0) * 60.0) / @Prediction_Routed_Cycle_Time))
			From @Output o
			Where Id = (@MinNoProd - 1) + @ShiftCounter
				And not exists (Select Id From @Production p Where p.dxhdata_id = o.dxhdata_id)

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
			From @Output o
			Where Id = (@MinNoProd - 1) + @ShiftCounter
				And not exists (Select Id From @Production p Where p.dxhdata_id = o.dxhdata_id)

		End
		Else
		Begin
			Update @Output
			Set summary_target = convert(Int,((3600 - IsNull(summary_breakandlunch_minutes,0) * 60.0) / @Prediction_Routed_Cycle_Time)
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


/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_UOM]    Script Date: 4/12/2019 15:20:34 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO



--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_UOM
--
--  Purpose:

--	Provide the info for displaying UOM
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
--	
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20190827		C00V00 - Intial code created		
--		
-- Example Call:
-- exec spLocal_EY_DxH_Get_UOM 
--
ALTER PROCEDURE [dbo].[spLocal_EY_DxH_Get_UOM]
--Declare
AS


BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;

Declare @Output table
	(
	Id							Int Identity,
	UOM_id						Int, 
	UOM_code					Varchar(100),
	UOM_name					Varchar(200),
	UOM_description				Varchar(100),
	site_id						INT,
	message						Varchar(100)
	)

Declare
	@ReturnMessage				Varchar(100),
	@json_out					nVarchar(max)

	Insert @Output
		Select 
			UOM_id,
			UOM_code,
			UOM_name,
			UOM_description,
			site_id,
			Null
		From dbo.UOM with (nolock)
		Where status = 'Active'

ErrExit:

If not exists (Select Id From @Output)
Begin
	If IsNull(@ReturnMessage,'') <> ''
	Begin
		Insert @Output (message)
			Select
				@ReturnMessage 
	End
	Else
	Begin
		Insert @Output (message)
			Select
				'No Data' 
	End
End	

Select @json_out = 
	(
	Select 
		UOM_id			as 'UOM.UOM_id',			
		UOM_code		as 'UOM.UOM_code',
		UOM_name		as 'UOM.UOM_name',
		UOM_description	as 'UOM.UOM_description',
		site_id			as 'UOM.site_id',
		message			as 'UOM.message'	
	From @Output o 
	Order By 
		o.UOM_code
	For Json path, INCLUDE_NULL_VALUES
	)

Select @json_out as 'UOM'

--Select * From @Output

Return

END


/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_Asset]    Script Date: 4/12/2019 15:20:54 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



ALTER     PROCEDURE [dbo].[spLocal_EY_DxH_Put_Asset] (@asset_code as Varchar(100),			
	@asset_name				as Varchar(200),	
	@asset_description		as Varchar(256),	
	@asset_level			as Varchar(100),	
	@site_code				as Varchar(100),	
	@parent_asset_code		as Varchar(100),		
	@value_stream			as Varchar(100),
	@automation_level		as Varchar(100),
	@include				as Varchar(100),
	@grouping1				as Varchar(256),
	@grouping2				as Varchar(256),
	@grouping3    			as Varchar(256),
	@grouping4				as Varchar(256),
	@grouping5				as Varchar(256),
	@status					as Varchar(50),
	@entered_by				as Varchar(100),
	@entered_on				as Datetime,
	@last_modified_by		as Varchar(100),
	@last_modified_on		as Datetime)

 AS  BEGIN 
 DECLARE
 @include_in_escalation as bit

 IF @asset_description = 'NULL'
 BEGIN
 SET @asset_description = NULL
 END

 IF @value_stream = 'NULL'
 BEGIN
 SET @value_stream = NULL
 END

 IF @automation_level = 'NULL'
 BEGIN
 SET @automation_level = NULL
 END

 IF @include = 'NULL'
 BEGIN
 SET @include = NULL
 END

 IF @include = '0'
 BEGIN
 SET @include_in_escalation = 0
 END

 IF @include = '1'
 BEGIN
 SET @include_in_escalation = 1
 END
 
 IF @grouping1 = 'NULL'
 BEGIN
 SET @grouping1 = NULL
 END

 IF @grouping2 = 'NULL'
 BEGIN
 SET @grouping2 = NULL
 END

 IF @grouping3 = 'NULL'
 BEGIN
 SET @grouping3 = NULL
 END

 IF @grouping4 = 'NULL'
 BEGIN
 SET @grouping4 = NULL
 END

 IF @grouping5 = 'NULL'
 BEGIN
 SET @grouping5 = NULL
 END

IF EXISTS (SELECT asset_code FROM dbo.Asset
WHERE
asset_code = @asset_code)
BEGIN
UPDATE [dbo].[Asset]
   SET [asset_name] = @asset_name
      ,[asset_description] = @asset_description
      ,[asset_level] = @asset_level
      ,[site_code] = @site_code
      ,[parent_asset_code] = @parent_asset_code
      ,[value_stream] = @value_stream
      ,[automation_level] = @automation_level
      ,[include_in_escalation] = @include_in_escalation
	  ,[grouping1] = @grouping1
      ,[grouping2] = @grouping2
      ,[grouping3] = @grouping3
      ,[grouping4] = @grouping4
      ,[grouping5] = @grouping5
      ,[status] = @status
      ,[entered_by] = 'SQL manual entry'
      ,[entered_on] = @entered_on
      ,[last_modified_by] = 'SQL manual entry'
      ,[last_modified_on] = getDate()
 WHERE asset_code = @asset_code
END

IF NOT EXISTS (SELECT asset_code FROM dbo.Asset
WHERE
asset_code = @asset_code)
BEGIN
INSERT INTO [dbo].[Asset]
           ([asset_code]
           ,[asset_name]
           ,[asset_description]
           ,[asset_level]
           ,[site_code]
           ,[parent_asset_code]
           ,[value_stream]
           ,[automation_level]
           ,[include_in_escalation]
           ,[grouping1]
           ,[grouping2]
           ,[grouping3]
           ,[grouping4]
           ,[grouping5]
           ,[status]
           ,[entered_by]
           ,[entered_on]
           ,[last_modified_by]
           ,[last_modified_on])
     VALUES
           (@asset_code
           ,@asset_name
           ,@asset_description
           ,@asset_level
           ,@site_code
           ,@parent_asset_code
           ,@value_stream
           ,@automation_level
           ,@include_in_escalation
           ,@grouping1
           ,@grouping2
           ,@grouping3
           ,@grouping4
           ,@grouping5
           ,@status
           ,'SQL manual entry'
           , getDate()
           , 'SQL manual entry'
           , getDate())
END
END


/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_AssetDisplaySystem]    Script Date: 4/12/2019 15:21:36 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO


--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Put_AssetDisplaySystem
--
--  Purpose:

--	Given an asset_code and a display system name, store the info in AssetDisplayName
--
--		If displaysystem_name does not exist, the asset code and displaysystem_name are inserted
--		If displaysystem_name exists, the asset code is updated
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
--	AssetDisplayName
--
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20190910		C00V00 - Intial code created
--  20191203		C00V01 - Change Asset_Code for Asset_Id
--		
-- Example Call:
-- exec spLocal_EY_DxH_Put_AssetDisplaySystem 40, 'CR2080435W4'
--
ALTER PROCEDURE [dbo].[spLocal_EY_DxH_Put_AssetDisplaySystem]
--Declare
	@Asset_Id			Varchar(100),	-- must exist in Asset table and be active
	@DisplaySystem_Name	Varchar(100)	-- the name of the computer system or other identifier
AS

BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;

Declare @Output table
	(
	Id						Int Identity,
	displaysystem_name		Varchar(200),
	status					Varchar(50),
	entered_by				Varchar(100),
	entered_on				Datetime,
	last_modified_by		Varchar(100),
	last_modified_on		Datetime,
	asset_id				INT,
	message					Varchar(100)
	)

Declare
	@AssetDisplaySystem_Id			Int,
	@ExistingAssetId				INT,
	@ExistingAssetDisplaySystemId	Int,
	@ReturnStatus					Int,
	@ReturnMessage					Varchar(100),
	@json_out						nVarchar(max)

If not exists 
	(
	Select asset_id 
	From dbo.Asset with (nolock) 
	Where asset_id = IsNull(@Asset_Id,'')
		And status = 'Active'
	)
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Asset Code ' + convert(varchar,IsNull(@Asset_Id,''))
	Goto ErrExit

End


If IsNull(@DisplaySystem_Name,'') = ''
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid DisplaySystem_Name ' + convert(varchar,IsNull(@DisplaySystem_Name,''))
	Goto ErrExit

End

Insert @Output
	Select
		@DisplaySystem_Name,
		'Active',
		'Unknown',
		getutcdate(),
		'Unknown',
		getutcdate(),
		@Asset_Id,
		Null

If not exists
	(
	Select assetdisplaysystem_id 
	From dbo.AssetDisplaySystem with (nolock) 
	Where displaysystem_name = IsNull(@DisplaySystem_Name,'')
		And status = 'Active'
	)
Begin
	Insert dbo.AssetDisplaySystem
		Select
			displaysystem_name,
			status,
			entered_by,
			entered_on,
			last_modified_by,
			last_modified_on,
			asset_id
		From @Output

		Set @assetdisplaysystem_Id =  SCOPE_IDENTITY()

		Select 
			@ReturnStatus = 0,
			@ReturnMessage = 'Inserted ' + convert(varchar,@AssetDisplaySystem_Id)

End
Else -- means displaysystem_name exists
Begin

	Select 
		@ExistingAssetDisplaySystemId = assetdisplaysystem_id,
		@ExistingAssetId = asset_id
	From dbo.AssetDisplaySystem with (nolock)
	Where displaysystem_name = @DisplaySystem_Name
		And status = 'Active'

	If IsNull(@ExistingAssetId,'') <> IsNull(@Asset_Id,'') And IsNull(@ExistingAssetDisplaySystemId,0) > 0
	Begin
		Update dbo.AssetDisplaySystem
		Set asset_id = @Asset_Id,
			last_modified_by = 'Unknown',
			last_modified_on = getutcdate()
		Where displaysystem_name = @DisplaySystem_Name
			And status = 'Active'
			And assetdisplaysystem_id = IsNull(@ExistingAssetDisplaySystemId,0)

		Select 
			@ReturnStatus = 0,
			@ReturnMessage = 'Updated ' + convert(varchar,@ExistingAssetDisplaySystemId)
	End
	Else
	Begin
		Set @ReturnStatus = -1
		Set @ReturnMessage = 'No change, already exists'
		Goto ErrExit	

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

--Select * From @Output

Return

END



/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_CommentData]    Script Date: 4/12/2019 15:22:29 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO


--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Put_CommentData
--
--  Purpose:

--	Given a dxhdata_id and needed comment info, store the comment data
--
--	If the @Update field is Null or 0, then it is a new insert
--	If the @Update field is Not Null and Not 0, it is an update 
--		and the value is the commentdata_id to update
--
--	Returns a status and a message
--		 0 is pass
--		-1 is fail
--		
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
--	CommentData
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20190808		C00V00 - Intial code created		
--	20190818		C00V01 - Validated Timestamp and used it for entered_on for inserts		
--	20190822		C00V02 - Timestamp adjusted to UTC to be used as entered_on
--	20191204		C00V03 - Change CommonParameters to CommonParametersTest
--		
-- Example Call:
-- Exec spLocal_EY_DxH_Put_CommentData 3, 'Any ole comment', '2136', Null, Null, '2019-07-25 00:00:00.000', 0
--
ALTER PROCEDURE [dbo].[spLocal_EY_DxH_Put_CommentData]
--Declare
	@DxHData_Id				Int,			-- the hour Id
	@Comment				Varchar(256),	-- the main info for the display
	@Clock_Number			Varchar(100),	-- used to look up First and Last, leave Null if you have first and last
	@First_Name				Varchar(100),	-- Leave Null if you send Clock Number
	@Last_Name				Varchar(100),	-- Leave Null if you send Clock Number
	@Timestamp				Datetime,		-- most likely use current time in site timezone
	@Update					Int				-- Null or 0 for insert, send the specific commentdata_id for update
AS

BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;

Declare @Output table
	(
	Id							Int Identity,
	commentdata_id				Int, 
	dxhdata_id					Int, 
	comment						Varchar(256), 
	first_name					Varchar(100), 
	last_name					Varchar(100), 
	entered_by					Varchar(100), 
	entered_on					Datetime, 
	last_modified_by			Varchar(100), 
	last_modified_on			Datetime,
	message						Varchar(100)
	)

Declare
	@First				Varchar(50),
	@Last				Varchar(50),
	@Initials			Varchar(50),	
	@CommentData_Id		Int,
	@Existing_Comment	Varchar(256),
	@ReturnStatus		Int,
	@ReturnMessage		Varchar(1000),
	@Site_Timezone		Varchar(100),
	@Timestamp_UTC		Datetime,
	@asset_id			INT,
	@Site_Id			INT

SET @asset_id = (SELECT asset_id 
                  FROM DxHData
                 WHERE dxhdata_id = @DxHData_Id)

SELECT @Site_Id = asset_id
FROM [dbo].[Asset] WHERE asset_level = 'Site' AND site_code = (SELECT site_code FROM [dbo].[Asset] WHERE asset_id=@asset_id);

Select @Site_Timezone = site_timezone
From dbo.CommonParametersTest cpt with (nolock)
Where site_id = @Site_Id AND status = 'Active';

Select @Timestamp_UTC = @Timestamp at time zone @Site_Timezone at time zone 'UTC'

If not exists (Select dxhdata_id From dbo.DxHData with (nolock) Where dxhdata_id = IsNull(@DxHData_Id,-1))
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid DxHData_Id ' + convert(varchar,IsNull(@DxHData_Id,''))
	Goto ErrExit
End

If IsNull(@Comment,'') = ''
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Comment ' + convert(varchar,IsNull(@Comment,''))
		Goto ErrExit
End

If exists (Select Badge From dbo.TFDUsers with (nolock) Where Badge = IsNull(@Clock_Number,-1))
Begin
	Select @First = [First Name],
		@Last = [Last Name]
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

If IsDate(@Timestamp)  <> 1 
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Timestamp ' + convert(varchar,IsNull(@Timestamp,''))
		Goto ErrExit
End

If 
	(IsNull(@Update,0) <> 0) 
	And 
	(not exists (Select commentdata_id From dbo.CommentData with (nolock) Where commentdata_id = IsNull(@Update,-1)))
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Update ' + convert(varchar,IsNull(@Update,''))
		Goto ErrExit
End


If IsNull(@Update,0) = 0
Begin
	Insert @Output
		Select 
			Null,
			@DxHData_Id,
			@Comment,
			@First_Name,
			@Last_Name,
			@Initials,
			@Timestamp_UTC,
			@Initials,
			getdate(),
			Null

	Insert dbo.CommentData
		Select 
			dxhdata_id, 
			comment, 
			first_name, 
			last_name, 
			entered_by, 
			entered_on, 
			last_modified_by, 
			last_modified_on
		From @Output			

		Set @CommentData_Id =  SCOPE_IDENTITY()

		Select 
			@ReturnStatus = 0,
			@ReturnMessage = 'Inserted ' + convert(varchar,@CommentData_Id)

End
Else
Begin
	If exists (Select commentdata_id From dbo.CommentData with (nolock) Where commentdata_id = IsNull(@Update,-1))
	Begin
		Select @Existing_Comment = comment
		From dbo.CommentData with (nolock) 
		Where commentdata_id = IsNull(@Update,-1)	

		If IsNull(@Existing_Comment,'') <> IsNull(@Comment,'')	
		Begin
			Update dbo.CommentData
			Set comment = @Comment,
				last_modified_by = @Initials,
				last_modified_on = getdate()
			Where commentdata_id = @Update

			Select 
				@ReturnStatus = 0,
				@ReturnMessage = 'Updated ' + convert(varchar,IsNull(@Update,''))
		End	
		Else
		Begin
			Select 
				@ReturnStatus = -1,
				@ReturnMessage = 'Nothing to update ' + convert(varchar,IsNull(@Update,''))

		End

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

Return

END


/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_DTData]    Script Date: 4/12/2019 15:24:50 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO



--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Put_DTData
--
--  Purpose:

--	Given a dxhdata_id and downtime info, store the DTData 
--
--	Note that this does some data validation
--		Minutes must not be negative
--		Minutes must not be greater than 60
-- 
--	This code DOES NOT manage the total minutes
--
--	Returns a status and a message
--		 0 is pass
--		-1 is fail
--		
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
--	DTData
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20190814		C00V00 - Intial code created		
--	20190820		C00V01 - Timestamp used as entered_on for inserts		
--	20190822		C00V02 - Timestamp adjusted to UTC to be used as entered_on 
--	20191204		C00V03 - Change CommonParameters to CommonParametersTest
--		
-- Example Call:
-- Exec spLocal_EY_DxH_Put_DTData 3, 4, 5, '3276', Null, Null, '2019-08-09 15:08:28.220', Null
--
ALTER PROCEDURE [dbo].[spLocal_EY_DxH_Put_DTData]
--Declare
	@DxHData_Id				Int,			-- the hour Id
	@DTReason_Id			Int,
	@DTMinutes				Float,
	@Clock_Number			Varchar(100),	-- used to look up First and Last, leave Null if you have first and last
	@First_Name				Varchar(100),	-- Leave Null if you send Clock Number
	@Last_Name				Varchar(100),	-- Leave Null if you send Clock Number
	@Timestamp				Datetime,		-- generally the current time in site timezone
	@Update					Int				-- generally Null or 0, send dtdata_id to update

AS

--Select @DxHData_Id = 3,
--	@DTReason_Id = 4, 
--	@DTMinutes = 5,
--	@Clock_Number = '3276',
--	@Timestamp = getdate()

BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;

Declare @Output table
	(
	Id							Int Identity,
	dtdata_id					Int, 
	dxhdata_id					Int, 
	dtreason_id					Int,
	dtminutes					Float,
	entered_by					Varchar(100), 
	entered_on					Datetime, 
	last_modified_by			Varchar(100), 
	last_modified_on			Datetime,
	message						Varchar(100)
	)

Declare
	@First					Varchar(50),
	@Last					Varchar(50),
	@Initials				Varchar(50),	
	@ReturnStatus			Int,
	@ReturnMessage			Varchar(1000),
	@DTData_Id				Int,
	@Existing_DTReason_Id	Int,
	@Existing_DTMinutes		Float,
	@Site_Timezone			Varchar(100),
	@Timestamp_UTC			Datetime,
	@asset_id				INT,
	@Site_Id				INT

SET @asset_id = (SELECT asset_id 
                  FROM dbo.DxHData
                 WHERE dxhdata_id = @DxHData_Id);

SELECT @Site_Id = asset_id
FROM [dbo].[Asset] WHERE asset_level = 'Site' AND site_code = (SELECT site_code FROM [dbo].[Asset] WHERE asset_id=@asset_id);

Select @Site_Timezone = site_timezone
From dbo.CommonParametersTest cpt with (nolock)
Where site_id = @Site_Id AND status = 'Active';

Select @Timestamp_UTC = @Timestamp at time zone @Site_Timezone at time zone 'UTC'

If not exists (Select dxhdata_id From dbo.DxHData with (nolock) Where dxhdata_id = IsNull(@DxHData_Id,-1))
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid DxHData_Id ' + convert(varchar,IsNull(@DxHData_Id,''))
	Goto ErrExit
End

If not exists 
	(
	Select dr.dtreason_id 
	From dbo.DTReason dr with (nolock),
		dbo.DxHData dxh with (nolock)
	Where dxh.dxhdata_id = @DxHData_Id
		And dxh.asset_id = dr.asset_id
		And dr.dtreason_id = IsNull(@DTReason_Id,-1)	
	)
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid DTReason_Id ' + convert(varchar,IsNull(@DTReason_Id,''))
	Goto ErrExit
End

If 
	(
	IsNull(@DTMinutes,-1) < 0
	Or
	IsNull(@DTMinutes,-1) > 60.0
	)
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid DTMinutes ' + convert(varchar,IsNull(@DTMinutes,''))
	Goto ErrExit
End

If exists (Select Badge From dbo.TFDUsers with (nolock) Where Badge = IsNull(@Clock_Number,-1))
Begin
	Select @First = [First Name],
		@Last = [Last Name]
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
		@ReturnMessage = 'Invalid timestamp ' + convert(varchar,IsNull(@Timestamp,''))
		Goto ErrExit
End

If 
	(IsNull(@Update,0) <> 0) 
	And 
	(not exists (Select dtdata_id From dbo.DTData with (nolock) Where dtdata_id = IsNull(@Update,-1)))
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Update ' + convert(varchar,IsNull(@Update,''))
		Goto ErrExit
End

If IsNull(@Update,0) = 0
Begin
	Insert @Output
		Select 
			Null,
			@DxHData_Id,
			@DTReason_Id,
			@DTMinutes,
			@Initials,
			@Timestamp_UTC,
			@Initials,
			getdate(),
			Null

	Insert dbo.DTData
			(dxhdata_id, dtreason_id, dtminutes, entered_by, entered_on, last_modified_by, last_modified_on)
		Select 
			dxhdata_id, 
			dtreason_id, 
			dtminutes, 
			entered_by, 
			entered_on, 
			last_modified_by, 
			last_modified_on
		From @Output			

		Set @DTData_Id =  SCOPE_IDENTITY()

		Select 
			@ReturnStatus = 0,
			@ReturnMessage = 'Inserted ' + convert(varchar,@DTData_Id)

End
Else
Begin
	If exists (Select dtdata_id From dbo.DTData with (nolock) Where dtdata_id = IsNull(@Update,-1))
	Begin
		Select @Existing_DTReason_Id = dtreason_id,
			@Existing_DTMinutes = dtminutes
		From dbo.DTData with (nolock) 
		Where dtdata_id = IsNull(@Update,-1)	

		If 
			(
			IsNull(@Existing_DTReason_Id,-1) <> IsNull(@DTReason_Id,-1)	
			Or
			IsNull(@Existing_DTMinutes,-1) <> IsNull(@DTMinutes,-1)	
			)
		Begin
			Update dbo.DTData
			Set dtreason_id = @DTReason_Id,
				dtminutes = @DTMinutes,
				last_modified_by = @Initials,
				last_modified_on = getdate()
			Where dtdata_id = @Update

			Select 
				@ReturnStatus = 0,
				@ReturnMessage = 'Updated ' + convert(varchar,IsNull(@Update,''))
		End	
		Else
		Begin
			Select 
				@ReturnStatus = -1,
				@ReturnMessage = 'Nothing to update ' + convert(varchar,IsNull(@Update,''))

		End

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

Return

END


/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_InterShiftData]    Script Date: 4/12/2019 15:25:17 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO

--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Put_InterShiftData
--
--  Purpose:

--	Given a dxhdata_id and needed intershift info, store the intershift data
--
--	If the @Update field is Null or 0, then it is a new insert
--	If the @Update field is Not Null and Not 0, it is an update 
--		and the value is the intershiftdata_id to update
--
--	Returns a status and a message
--		 0 is pass
--		-1 is fail
--
--	DxHData_Id is more related to an hour but it is easy to get the needed shift info from that		
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
--	InterShiftData
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20190809		C00V00 - Intial code created		
--	20190818		C00V01 - Validated Timestamp and used it as entered_on for inserts		
--	20190822		C00V02 - Timestamp adjusted to UTC to be used as entered_on
--	20191204		C00V03 - Change CommonParameters to CommonParametersTest
--		
-- Example Call:
-- Exec spLocal_EY_DxH_Put_InterShiftData 3, 'shifting gears', '2477', Null, Null, '2019-08-09 15:08:28.220', 0

--
ALTER PROCEDURE [dbo].[spLocal_EY_DxH_Put_InterShiftData]
--Declare
	@DxHData_Id				Int,			-- any hour Id of the shift associated with this data
	@Comment				Varchar(256),	-- the main info for the display
	@Clock_Number			Varchar(100),	-- used to look up First and Last, leave Null if you have first and last
	@First_Name				Varchar(100),	-- Leave Null if you send Clock Number
	@Last_Name				Varchar(100),	-- Leave Null if you send Clock Number
	@Timestamp				Datetime,		-- generally current time in site timezone
	@Update					Int				-- generally null or 0, send the intershift_id for update
AS

BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;

Declare @Output table
	(
	Id							Int Identity,
	intershift_id				Int, 
	asset_id					INT,
	production_day				Datetime,
	shift_code					Varchar(100),
	comment						Varchar(256), 
	first_name					Varchar(100), 
	last_name					Varchar(100), 
	entered_by					Varchar(100), 
	entered_on					Datetime, 
	last_modified_by			Varchar(100), 
	last_modified_on			Datetime,
	dxhdata_id					Int, 
	message						Varchar(100)
	)

Declare
	@First				Varchar(50),
	@Last				Varchar(50),
	@Initials			Varchar(50),	
	@InterShift_Id		Int,
	@Existing_Comment	Varchar(256),
	@ReturnStatus		Int,
	@ReturnMessage		Varchar(1000),
	@Site_Timezone		Varchar(100),
	@Timestamp_UTC		Datetime,
	@asset_id			INT,
	@Site_Id			INT

SET @asset_id = (SELECT asset_id 
                  FROM dbo.DxHData
                 WHERE dxhdata_id = @DxHData_Id);

SELECT @Site_Id = asset_id
FROM [dbo].[Asset] WHERE asset_level = 'Site' AND site_code = (SELECT site_code FROM [dbo].[Asset] WHERE asset_id=@asset_id);


Select @Site_Timezone = site_timezone
From dbo.CommonParametersTest cpt with (nolock)
Where site_id = @Site_Id AND status = 'Active';

Select @Timestamp_UTC = @Timestamp at time zone @Site_Timezone at time zone 'UTC'

If not exists (Select dxhdata_id From dbo.DxHData with (nolock) Where dxhdata_id = IsNull(@DxHData_Id,-1))
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid DxHData_Id ' + convert(varchar,IsNull(@DxHData_Id,''))
	Goto ErrExit
End

If IsNull(@Comment,'') = ''
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Comment ' + convert(varchar,IsNull(@Comment,''))
		Goto ErrExit
End

If exists (Select Badge From dbo.TFDUsers with (nolock) Where Badge = IsNull(@Clock_Number,-1))
Begin
	Select @First = [First Name],
		@Last = [Last Name]
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
	(IsNull(@Update,0) <> 0) 
	And 
	(not exists (Select intershift_id From dbo.InterShiftData with (nolock) Where intershift_id = IsNull(@Update,-1)))
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Update ' + convert(varchar,IsNull(@Update,''))
		Goto ErrExit
End

If IsNull(@Update,0) = 0
Begin
	Insert @Output
		Select 
			Null,
			asset_id,
			production_day,
			shift_code,
			@Comment,
			@First_Name,
			@Last_Name,
			@Initials,
			@Timestamp_UTC,
			@Initials,
			getdate(),
			@DxHData_Id,
			Null
		From dbo.DxHData with (nolock)
		Where dxhdata_id = @DxHData_Id

	Insert dbo.InterShiftData
		Select 
			production_day,
			shift_code,
			comment, 
			first_name, 
			last_name, 
			entered_by, 
			entered_on, 
			last_modified_by, 
			last_modified_on,
			asset_id
		From @Output			

		Set @InterShift_Id =  SCOPE_IDENTITY()

		Select 
			@ReturnStatus = 0,
			@ReturnMessage = 'Inserted ' + convert(varchar,@InterShift_Id)

End
Else
Begin
	If exists (Select intershift_id From dbo.InterShiftData with (nolock) Where intershift_id = IsNull(@Update,-1))
	Begin
		Select @Existing_Comment = comment
		From dbo.InterShiftData with (nolock) 
		Where intershift_id = IsNull(@Update,-1)	

		If IsNull(@Existing_Comment,'') <> IsNull(@Comment,'')	
		Begin
			Update dbo.InterShiftData
			Set comment = @Comment,
				first_name = @First_Name,
				last_name = @Last_Name,
				last_modified_by = @Initials,
				last_modified_on = getdate()
			Where intershift_id = @Update

			Select 
				@ReturnStatus = 0,
				@ReturnMessage = 'Updated ' + convert(varchar,IsNull(@Update,''))
		End	
		Else
		Begin
			Select 
				@ReturnStatus = -1,
				@ReturnMessage = 'Nothing to update ' + convert(varchar,IsNull(@Update,''))

		End

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

Return

END


/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_OperatorSignOff]    Script Date: 4/12/2019 15:25:41 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO



--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Put_OperatorSignoff
--
--  Purpose:

--	Given a dxhdata_id and some way to identify operator, store the initials 
--
--	Returns a status and a message
--		 0 is pass
--		-1 is fail
--		
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
--	DxHData
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20190809		C00V00 - Intial code created		
--		
-- Example Call:
-- Exec spLocal_EY_DxH_Put_OperatorSignOff 3, '3276', Null, Null, '2019-08-09 15:08:28.220'
--
ALTER PROCEDURE [dbo].[spLocal_EY_DxH_Put_OperatorSignOff]
--Declare
	@DxHData_Id				Int,			-- the hour Id
	@Clock_Number			Varchar(100),	-- used to look up First and Last, leave blank if you have first and last
	@First_Name				Varchar(100),	-- 
	@Last_Name				Varchar(100),	--
	@Timestamp				Datetime		-- generally the current time
AS

BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;

Declare @Output table
	(
	Id							Int Identity,
	dxhdata_id					Int, 
	operator_signoff			Varchar(100),	
	operator_signoff_timestamp	Datetime,
	last_modified_by			Varchar(100), 
	last_modified_on			Datetime,
	message						Varchar(100)
	)

Declare
	@First				Varchar(50),
	@Last				Varchar(50),
	@Initials			Varchar(50),	
	@ReturnStatus		Int,
	@ReturnMessage		Varchar(1000)

If not exists (Select dxhdata_id From dbo.DxHData with (nolock) Where dxhdata_id = IsNull(@DxHData_Id,-1))
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid DxHData_Id ' + convert(varchar,IsNull(@DxHData_Id,''))
	Goto ErrExit
End

If exists (Select Badge From dbo.TFDUsers with (nolock) Where Badge = IsNull(@Clock_Number,-1))
Begin
	Select @First = [First Name],
		@Last = [Last Name]
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
		@ReturnMessage = 'Invalid timestamp ' + convert(varchar,IsNull(@Timestamp,''))
		Goto ErrExit
End

Insert @Output
	Select 
		@DxHData_Id,
		@Initials,
		@Timestamp,
		@Initials,
		getdate(),
		Null

Update dbo.DxHData
Set operator_signoff = o.operator_signoff,
	operator_signoff_timestamp = o.operator_signoff_timestamp, 
	last_modified_by = o.last_modified_by, 
	last_modified_on = o.last_modified_on
From dbo.DxHData dxh,
	@Output o			
Where dxh.dxhdata_id = o.dxhdata_id

Select 
	@ReturnStatus = 0,
	@ReturnMessage = 'Operator signed off ' + convert(varchar,@DxHData_Id)


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

Return

END


/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_ProductionData]    Script Date: 4/12/2019 15:26:05 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO
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
--	20191204		C00V01 - Change CommonParameters to CommonParametersTest		
--		
-- Example Call:
-- exec spLocal_EY_DxH_Put_ProductionData 261042, 30, 10, 2, 18, '123456789123', Null, Null, '2019/11/26 12:18', 1, 17015
--
ALTER PROCEDURE [dbo].[spLocal_EY_DxH_Put_ProductionData]
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
	Select @First = [First Name],
		@Last = [Last Name]
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
	@Existing_Other_Scrap = pd.other_scrap,
	@Existing_Adjusted_Actual = pd.adjusted_actual
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
			adjusted_actual = @Existing_Actual + @Adjusted_Actual,
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
		Select "test"
			Select 
				@ReturnStatus = -1,
				@ReturnMessage = 'Invalid Override ' + convert(varchar,IsNull(@Override,''))
				Goto ErrExit
		End
		-- If it makes it to here, then override/replace existing with @Actual 
		Update dbo.ProductionData
		Set actual = @Actual,
			setup_scrap = @Setup_Scrap,
			other_scrap = @Other_Scrap,
			adjusted_actual = @Adjusted_Actual,
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
			Null

	--Compute Ideal and target	
	-- 
	If IsNull(@Routed_Cycle_Time,-1) < 0
	Begin
		Select @Routed_Cycle_Time = convert(float,default_routed_cycle_time)
		From dbo.CommonParametersTest cpt with (nolock)
		Where site_id = @Site_Id AND status = 'Active';
	End

	If IsNull(@Target_Percent_Of_Ideal,-1) < 0
	Begin
		Select @Target_Percent_Of_Ideal = convert(float,default_target_percent_of_ideal)
		From dbo.CommonParametersTest cpt with (nolock)
		Where site_id = @Site_Id AND status = 'Active';
	End

	-- Remaining Quantity is Order Quantity - Produced
	-- Don't look back to the beginning of time, but this needs to cover the longest time an order can run
	Select @Setup_Lookback_Minutes = convert(float,setup_lookback_minutes)
	From dbo.CommonParametersTest cpt with (nolock)
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
	From dbo.CommonParametersTest cpt with (nolock)
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
			adjusted_actual
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

/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_SupervisorSignOff]    Script Date: 4/12/2019 15:26:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO



--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Put_SupervisorSignoff
--
--  Purpose:

--	Given a dxhdata_id and some way to identify Supervisor, store the initials 
--
--	Returns a status and a message
--		 0 is pass
--		-1 is fail
--		
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
--	DxHData
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20190809		C00V00 - Intial code created		
--		
-- Example Call:
-- Exec spLocal_EY_DxH_Put_SupervisorSignOff 3, '2477', Null, Null, '2019-08-09 15:08:28.220'
--
ALTER PROCEDURE [dbo].[spLocal_EY_DxH_Put_SupervisorSignOff]
--Declare
	@DxHData_Id				Int,			-- the hour Id
	@Clock_Number			Varchar(100),	-- used to look up First and Last, leave blank if you have first and last
	@First_Name				Varchar(100),	-- 
	@Last_Name				Varchar(100),	--
	@Timestamp				Datetime		-- generally the current time
AS

BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;

Declare @Output table
	(
	Id								Int Identity,
	dxhdata_id						Int, 
	supervisor_signoff				Varchar(100),	
	supervisor_signoff_timestamp	Datetime,
	last_modified_by				Varchar(100), 
	last_modified_on				Datetime,
	message							Varchar(100)
	)

Declare
	@First				Varchar(50),
	@Last				Varchar(50),
	@Initials			Varchar(50),	
	@ReturnStatus		Int,
	@ReturnMessage		Varchar(1000)

If not exists (Select dxhdata_id From dbo.DxHData with (nolock) Where dxhdata_id = IsNull(@DxHData_Id,-1))
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid DxHData_Id ' + convert(varchar,IsNull(@DxHData_Id,''))
	Goto ErrExit
End

If exists (Select Badge From dbo.TFDUsers with (nolock) Where Badge = IsNull(@Clock_Number,-1))
Begin
	Select @First = [First Name],
		@Last = [Last Name]
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
		@ReturnMessage = 'Invalid timestamp ' + convert(varchar,IsNull(@Timestamp,''))
		Goto ErrExit
End

Insert @Output
	Select 
		@DxHData_Id,
		@Initials,
		@Timestamp,
		@Initials,
		getdate(),
		Null

Update dbo.DxHData
Set supervisor_signoff = o.supervisor_signoff,
	supervisor_signoff_timestamp = o.supervisor_signoff_timestamp, 
	last_modified_by = o.last_modified_by, 
	last_modified_on = o.last_modified_on
From dbo.DxHData dxh,
	@Output o			
Where dxh.dxhdata_id = o.dxhdata_id

Select 
	@ReturnStatus = 0,
	@ReturnMessage = 'Supervisor signed off ' + convert(varchar,@DxHData_Id)


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

Return

END