
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
CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Get_DTReason_new_1]
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
