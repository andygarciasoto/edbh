/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_Assets_ReasonCode]    Script Date: 29/12/2020 11:31:05 ******/
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
--- List of All Asset asociate to a specific Reason code
---
--  Input Parameters:
--- @dtreason_code
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
--	20210419		C00V00 - Intial code created
--		
-- Example Call:
-- exec spLocal_EY_DxH_Get_Assets_ReasonCode N'EY - TestBreak'
--
CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Get_Assets_ReasonCode]
--Declare
@dtreason_code	NVARCHAR(100) -- code of the Reason record to search
AS
    BEGIN
        -- SET NOCOUNT ON added to prevent extra result sets from
        -- interfering with SELECT statements.
        SET NOCOUNT ON;
        SELECT DISTINCT
            A.[asset_id],
            A.[asset_code],
            A.[asset_name],
            A.[asset_description],
            A.[asset_level],
            A.[site_code],
            A.[parent_asset_code],
            A.[value_stream],
            A.[automation_level],
            A.[include_in_escalation],
            W.workcell_name AS [grouping1],
            A.[grouping2],
            A.[grouping3],
            A.[grouping4],
            A.[grouping5],
            DT.[status],
            A.[target_percent_of_ideal],
            A.[is_multiple],
            A.[is_dynamic]
        FROM [dbo].[DTReason] AS DT
            INNER JOIN [dbo].[Asset] AS A ON DT.asset_id = A.asset_id
            LEFT JOIN [dbo].[Workcell] AS W ON A.grouping1 = W.workcell_id 
        WHERE DT.dtreason_code = @dtreason_code;
    END;
