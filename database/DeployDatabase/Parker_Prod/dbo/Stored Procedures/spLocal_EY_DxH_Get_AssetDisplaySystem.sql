


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
CREATE   PROCEDURE [dbo].[spLocal_EY_DxH_Get_AssetDisplaySystem]
--Declare
	@DisplaySystem_Name	Varchar(100)	-- the name of the computer system or other identifier
AS

BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;


	Select
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
		And ads.displaysystem_name = @DisplaySystem_Name
		ORDER BY a.asset_name

--Select * From @Output

Return

END
