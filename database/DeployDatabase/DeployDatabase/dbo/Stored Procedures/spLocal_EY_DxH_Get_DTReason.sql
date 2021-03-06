
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
--		
-- Example Call:
-- exec spLocal_EY_DxH_Get_DTReason 453
--
CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Get_DTReason]
--Declare
	@Asset_Id			INT
AS

--Select @Asset_Id = 25

BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SELECT 
		dt.dtreason_id as 'dtreason_id',
		dt.dtreason_code as 'dtreason_code',
		dt.dtreason_name as 'dtreason_name',
		dt.dtreason_category as 'dtreason_category',
		a.site_code as 'site_code'
	FROM dbo.DTReason dt with (nolock)
	INNER JOIN dbo.Asset a ON a.asset_id = @Asset_id
		WHERE dt.asset_id = @Asset_Id
			AND dt.status = 'Active' 
	Order By 
		dt.dtreason_category,
		CASE WHEN a.site_code in ('Eaton', 'Veniano_HA', 'Veniano_Hose') THEN len(dt.dtreason_code) END,	--trying to sort alpha numeric values as numbers
		dt.dtreason_code;

END
