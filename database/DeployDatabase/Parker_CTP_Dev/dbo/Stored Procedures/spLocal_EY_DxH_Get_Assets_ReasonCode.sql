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
@site_id        	        INT,
@dtreason_code              NVARCHAR(100), -- code of the Reason record to search,
@dtreason_name              NVARCHAR(100), -- name of the Reason record to search,
@dtreason_description       NVARCHAR(100), -- description of the Reason record to search,
@dtreason_category          NVARCHAR(100), -- category of the Reason record to search,
@reason1                    NVARCHAR(100), -- reason1 of the Reason record to search,
@reason2                    NVARCHAR(100), -- reason2 of the Reason record to search,
@status                     NVARCHAR(100), -- status of the Reason record to search,
@type                       NVARCHAR(100), -- type of the Reason record to search,
@level                      NVARCHAR(100)  -- level of the Reason record to search,
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
            A.[grouping1] AS workcell_id,
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
        WHERE DT.site_id = @site_id AND DT.dtreason_code = @dtreason_code AND DT.dtreason_name = @dtreason_name AND ISNULL(DT.dtreason_description,'') = @dtreason_description AND
            DT.dtreason_category = @dtreason_category AND ISNULL(DT.reason1,'') = @reason1 AND ISNULL(DT.reason2,'') = @reason2 AND DT.status = @status AND DT.type = @type AND 
            ISNULL(DT.level,'') = @level;
    END;
