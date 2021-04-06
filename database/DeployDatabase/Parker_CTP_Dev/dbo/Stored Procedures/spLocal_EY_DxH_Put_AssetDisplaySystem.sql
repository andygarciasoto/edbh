/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_AssetDisplaySystem]    Script Date: 6/4/2021 09:43:28 ******/

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
-- exec spLocal_EY_DxH_Put_AssetDisplaySystem 40, 'CR2080435W4', 1
--

CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Put_AssetDisplaySystem]
--Declare
	@assetdisplaysystem_id INT,
	@Asset_Id			   INT, -- must exist in Asset table and be active
	@DisplaySystem_Name	   NVARCHAR(100),	-- the name of the computer system or other identifier
	@site_id			   INT,
	@status				   NVARCHAR(100)
AS

BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;

	IF EXISTS (SELECT assetdisplaysystem_id FROM dbo.AssetDisplaySystem
	WHERE
	site_id = @site_id AND assetdisplaysystem_id = @assetdisplaysystem_id
	AND asset_id = @Asset_Id)
		BEGIN
			UPDATE dbo.AssetDisplaySystem
			SET 
			displaysystem_name = @DisplaySystem_Name,
			status = @status,
			last_modified_by = 'Administration Tool',
			last_modified_on = GETDATE()
			WHERE
			site_id = @site_id AND assetdisplaysystem_id = @assetdisplaysystem_id
			AND asset_id = @Asset_Id
		END
	ELSE
		BEGIN
			INSERT INTO dbo.AssetDisplaySystem
           (displaysystem_name
           ,status
           ,entered_by
           ,entered_on
           ,last_modified_by
           ,last_modified_on
		   ,asset_id
		   ,site_id)
		VALUES
           (@DisplaySystem_Name
		   ,@status
           ,'Administration Tool'
           ,GETDATE()
           ,'Administration Tool'
           ,GETDATE()
		   ,@asset_id
		   ,@site_id)
		END
	END
	
		