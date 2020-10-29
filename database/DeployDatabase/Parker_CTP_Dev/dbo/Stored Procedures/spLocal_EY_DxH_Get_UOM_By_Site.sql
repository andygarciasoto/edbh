
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
--	20200217		C00V00 - Intial code created		
--		
-- Example Call:
-- exec spLocal_EY_DxH_Get_UOM_By_Site 1 
--
CREATE   PROCEDURE [dbo].[spLocal_EY_DxH_Get_UOM_By_Site]
--Declare

@Site_Id INT
AS
    BEGIN
        -- SET NOCOUNT ON added to prevent extra result sets from
        -- interfering with SELECT statements.
        SET NOCOUNT ON;
        SELECT U.UOM_id AS UOM_id, 
               U.UOM_code, 
               U.UOM_name, 
               U.UOM_description,
			   A.site_code,
			   U.status,
			   U.entered_by,
			   U.entered_on,
			   U.last_modified_by,
			   U.last_modified_on, 
               U.site_id, 
               U.decimals, 
               NULL
        FROM dbo.UOM U WITH(NOLOCK)
		JOIN dbo.Asset A ON U.site_id = A.asset_id
        WHERE U.status = 'Active'
              AND U.site_id = @Site_Id;
    END;
