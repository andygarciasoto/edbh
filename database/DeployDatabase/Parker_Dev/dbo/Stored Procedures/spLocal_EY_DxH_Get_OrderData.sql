


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
CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Get_OrderData]
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
