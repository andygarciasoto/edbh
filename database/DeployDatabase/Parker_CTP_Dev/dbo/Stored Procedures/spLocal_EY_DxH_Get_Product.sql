

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
CREATE    PROCEDURE [dbo].[spLocal_EY_DxH_Get_Product]
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
