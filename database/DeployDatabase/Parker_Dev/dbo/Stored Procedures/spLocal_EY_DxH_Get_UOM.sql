
--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_UOM
--
--  Purpose:
--	Provide the info for displaying UOM
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
--	20190827		C00V00 - Intial code created		
--	20200217		C00V01 - Remove json result format
--		
-- Example Call:
-- exec spLocal_EY_DxH_Get_UOM 
--
CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Get_UOM]
--Declare
AS
    BEGIN
        -- SET NOCOUNT ON added to prevent extra result sets from
        -- interfering with SELECT statements.
        SET NOCOUNT ON;
        SELECT UOM_id, 
               UOM_code, 
               UOM_name, 
               UOM_description, 
               site_id
        FROM dbo.UOM o
        ORDER BY o.UOM_code;
    END;