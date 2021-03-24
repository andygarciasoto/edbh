/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_Asset]    Script Date: 29/12/2020 11:31:05 ******/
--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_Asset
--
--  Purpose:
--	Provide Asset info for displays
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
--	20190903		C00V00 - Intial code created		
--  20191203		C00V01 - Change Asset_Code for Asset_Id
--  20200225		C00V02 - Remove JSON format of response
--		
-- Example Call:
-- exec spLocal_EY_DxH_Get_Asset 'All','All', 1
--
CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Get_Asset]
--Declare
@Level            VARCHAR(100), --All, Site, Area, or Cell. Most of the time send Cell 
@Automation_Level VARCHAR(100), --All, Automated, Partially_Manual_Scan_Order, Manual
@Site             INT				--Asset_id of the Site
AS
    BEGIN
        -- SET NOCOUNT ON added to prevent extra result sets from
        -- interfering with SELECT statements.
        SET NOCOUNT ON;
        DECLARE @site_code VARCHAR(100);
        SET @site_code =
        (
            SELECT site_code
            FROM dbo.Asset
            WHERE asset_id = @Site
        );
        IF ISNULL(@Level, 'All') = 'All'
            BEGIN
                SET @Level = NULL;
        END;
        IF ISNULL(@Automation_Level, 'All') = 'All'
            BEGIN
                SET @Automation_Level = NULL;
        END;
        SELECT A.asset_id, 
               A.asset_code, 
               A.asset_name, 
               A.asset_description, 
               A.asset_level, 
               A.site_code, 
               A.parent_asset_code, 
               A.value_stream, 
               A.automation_level, 
			   A.is_multiple,
               A.grouping1 as 'workcell_id',
			   W.workcell_name
        FROM dbo.Asset A WITH(NOLOCK)
		LEFT JOIN dbo.Workcell W ON A.grouping1 = W.workcell_id
        WHERE STATUS = 'Active'
              AND site_code = @site_code
              AND ISNULL(asset_level, '') = ISNULL(@Level, ISNULL(asset_level, ''))
              AND ISNULL(automation_level, '') = ISNULL(@Automation_Level, ISNULL(automation_level, ''))
        ORDER BY asset_name, asset_level, parent_asset_code;

        RETURN;
    END;
