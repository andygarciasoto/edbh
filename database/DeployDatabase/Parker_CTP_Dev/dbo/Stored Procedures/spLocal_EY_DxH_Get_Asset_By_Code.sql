/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_Asset_By_Code]    Script Date: 29/12/2020 11:29:06 ******/
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
	@Asset_Code				VARCHAR(100)				--Asset_Code of the Site
AS

BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;

	SELECT 
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
		is_multiple
	FROM dbo.Asset WITH (nolock)
	WHERE status = 'Active'
		AND asset_code = @Asset_Code
		ORDER BY asset_name
END

