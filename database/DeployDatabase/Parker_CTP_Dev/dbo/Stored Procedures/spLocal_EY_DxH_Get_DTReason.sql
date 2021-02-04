/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_DTReason]    Script Date: 28/12/2020 11:45:50 ******/

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
--  20200203		C00V03 - Change result result to normal table result
--  20201218		C00V04 - Add new level column
--		
-- Example Call:
-- exec spLocal_EY_DxH_Get_DTReason 225, 'Scrap'
--
CREATE   PROCEDURE [dbo].[spLocal_EY_DxH_Get_DTReason]
--Declare
	@Asset_Id			INT,
	@type				VARCHAR(100)
AS

--Select @Asset_Id = 25

BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SELECT 
		dt.dtreason_id,
		dt.dtreason_code,
		dt.dtreason_name,
		dt.dtreason_category,
		dt.type,
		dt.level,
		a.site_code
	FROM dbo.DTReason dt with (nolock)
	INNER JOIN dbo.Asset a ON a.asset_id = @Asset_id
		WHERE dt.asset_id = @Asset_Id
			AND dt.status = 'Active' 
			AND dt.type = @type
	Order By 
		dt.dtreason_category,
		CASE WHEN a.site_code in ('Eaton', 'Veniano_HA', 'Veniano_Hose', 'Nussdorf') THEN len(dt.dtreason_code) END,	--trying to sort alpha numeric values as numbers
		dt.dtreason_code;

END
