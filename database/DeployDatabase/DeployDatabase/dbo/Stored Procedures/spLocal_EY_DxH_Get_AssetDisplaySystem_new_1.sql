


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
CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Get_AssetDisplaySystem_new_1]
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
		And ads.displaysystem_name like CONCAT(IsNull(@DisplaySystem_Name,''),'%')

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
