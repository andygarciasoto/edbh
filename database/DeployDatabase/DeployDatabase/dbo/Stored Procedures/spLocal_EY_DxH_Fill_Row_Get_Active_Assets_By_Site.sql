
--
-- Copyright © 2020 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Fill_Row_Get_Active_Assets_By_Site
--
--  Purpose:
--	Given an orders of the last hour to fill production table
--
--	To Do:
--
--  Output Parameters:
---
--  Input Parameters:
--- None
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
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20200416		C00V00 - Intial code created		
--		
-- Example Call:
-- exec dbo.spLocal_EY_DxH_Fill_Row_Get_Active_Assets_By_Site '2020-04-17 07:00', '2020-04-17 11:00:00.000', 1
--

CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Fill_Row_Get_Active_Assets_By_Site] @start_shift     DATETIME, 
                                                                           @site_round_time DATETIME, 
                                                                           @site_id         INT
AS
    BEGIN
        -- SET NOCOUNT ON added to prevent extra result sets from
        -- interfering with SELECT statements.
        SET NOCOUNT ON;

        DECLARE @site_code NVARCHAR(100);

        SELECT @site_code = asset_code
        FROM dbo.Asset
        WHERE asset_id = @site_id;

        WITH CTE1
             AS (SELECT DISTINCT 
                        asset_id
                 FROM dbo.OrderData OD
                 WHERE(OD.end_time >= @start_shift
                       AND OD.end_time < @site_round_time)
                      OR (OD.end_time IS NULL))
             SELECT A.asset_id, 
                    A.asset_code, 
                    A.asset_name
             FROM CTE1
                  JOIN dbo.Asset A ON A.asset_id = CTE1.asset_id
                                      AND site_code = @site_code;
    END;