
--
-- Copyright © 2020 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_DTData_By_DxHData_Id
--
--  Purpose:

--	Given an dxhdata_id, provide the info for displaying DTData
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
--	20200114		C00V00 - Intial code created
--		
-- Example Call:
-- exec spLocal_EY_DxH_Get_DTData_By_DxHData_Id 324476
--
CREATE   PROCEDURE [dbo].[spLocal_EY_DxH_Get_DTData_By_DxHData_Id]
--Declare
	@DxHData_id			INT
AS

BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;

SELECT
		DT.dtdata_id,
		DT.dxhdata_id,
		DT.dtreason_id,
		DT.dtminutes,
		DTR.dtreason_code,
		DTR.dtreason_name
	FROM dbo.DTData DT INNER JOIN DTReason DTR ON 
	DT.dtreason_id = DTR.dtreason_id AND DT.dxhdata_id = @DxHData_id;

END

