


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
CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Create_OrderData]
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
				FROM dbo.CommonParameters
				WHERE site_name = @site_code
				AND status = 'Active')

Select @Site_Timezone = site_timezone
From dbo.CommonParameters cp with (nolock)
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
	From dbo.CommonParameters cp with (nolock)
	Where cp.site_id = @site_id
		And status = 'Active'
End

If IsNull(@Minutes_Allowed_Per_Setup,0) <= 0
Begin
	Select @Minutes_Allowed_Per_Setup = convert(float, default_setup_minutes)
	From dbo.CommonParameters cp with (nolock)
	Where cp.site_id = @site_id
		And status = 'Active'
End

If IsNull(@Target_Percent_Of_Ideal,0) <= 0
Begin
	Select @Target_Percent_Of_Ideal = convert(float, default_target_percent_of_ideal)
	From dbo.CommonParameters cp with (nolock)
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
