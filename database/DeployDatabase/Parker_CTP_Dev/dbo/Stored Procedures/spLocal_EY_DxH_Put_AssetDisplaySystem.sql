

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
CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Put_AssetDisplaySystem]
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
