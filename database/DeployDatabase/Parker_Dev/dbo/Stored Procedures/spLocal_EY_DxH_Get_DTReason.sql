
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
-- exec spLocal_EY_DxH_Get_DTReason 40
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
		dtreason_id,
		dtreason_code,
		dtreason_name,
		dtreason_category
	FROM dbo.DTReason with (nolock)
		WHERE asset_id = @Asset_Id
			AND status = 'Active' 
	Order By 
		dtreason_category,
		len(dtreason_code),	--trying to sort alpha numeric values as numbers
		dtreason_code;

END
