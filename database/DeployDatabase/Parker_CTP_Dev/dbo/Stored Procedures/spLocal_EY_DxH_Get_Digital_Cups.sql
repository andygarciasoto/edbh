/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_Digital_Cups]    Script Date: 26/01/2021 11:31:05 ******/
--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_Asset
--
--  Purpose:
--  Provide Asset info for displays
--
--  To Do:
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
--- None
---
--  Variables:
---
---
--  Tables Modified:
--  
---
-- Modification Change History:
--------------------------------------------------------------------------------    
-- Example Call:
-- exec spLocal_EY_DxH_Get_Digital_Cups '2021-02-19 07:00:00','2021-02-19 12:21:00', 1, 2, '2021-02-19 00:00'
--
CREATE   PROCEDURE [dbo].[spLocal_EY_DxH_Get_Digital_Cups]
@start_time       DATETIME, 
@end_time         DATETIME, 
@asset_id         INT,
@aggregation      INT,
@production_day   DATETIME
AS
    BEGIN
    SET NOCOUNT ON;
    WITH CTE1 AS(
        SELECT
            DISTINCT
            CONVERT(VARCHAR, D.started_on_chunck, 20) AS start_time,
            CONVERT(VARCHAR, D.ended_on_chunck, 20) AS end_time,
            D.started_on_chunck,
            LOWER(CONCAT(FORMAT(D.started_on_chunck, 'htt'), ' - ', FORMAT(D.ended_on_chunck, 'htt'))) AS hour_interval,
            T.asset_id,
            A.asset_code,
            A.asset_name,
            A.value_stream,
            W.workcell_name,
            DXH.dxhdata_id,
            DXH.production_day,
            DXH.operator_signoff,
            DXH.supervisor_signoff,
            ISNULL(SUM(PD.ideal) OVER(PARTITION BY PD.dxhdata_id),0) AS summary_ideal,
            ISNULL(SUM(PD.target) OVER(PARTITION BY PD.dxhdata_id),0) AS summary_target,
            ISNULL(SUM(PD.actual) OVER(PARTITION BY PD.dxhdata_id),0) AS summary_actual,
            ISNULL(SUM(PD.setup_scrap + PD.other_scrap) OVER(PARTITION BY PD.dxhdata_id),0) AS summary_scrap
        FROM [dbo].[GetRangesBetweenDates] (@start_time, @end_time, 60, 1) D
        LEFT JOIN [dbo].[AssetsResolverFromId] (@asset_id, @aggregation) T ON @asset_id = T.requested_asset_id
        INNER JOIN dbo.Asset A ON T.asset_id = A.asset_id
            AND A.asset_level = 'Cell'
            AND A.status = 'Active'
        LEFT JOIN dbo.DxHData DXH ON DXH.asset_id = A.asset_Id
            AND DXH.production_day = @production_day
            AND CONCAT(FORMAT(D.started_on_chunck, 'htt'), ' - ', FORMAT(D.ended_on_chunck, 'htt')) = UPPER(DXH.hour_interval)
        LEFT JOIN dbo.ProductionData PD ON PD.dxhdata_id = DXH.dxhdata_id
        LEFT JOIN dbo.Workcell W ON A.grouping1 = W.workcell_id
    )
    SELECT
        CTE1.start_time,
        CTE1.end_time,
        CTE1.hour_interval,
        CTE1.asset_id,
        CTE1.asset_code,
        CTE1.asset_name,
        CTE1.value_stream,
        CTE1.workcell_name,
        CTE1.dxhdata_id,
        CTE1.production_day,
        CTE1.operator_signoff,
        CTE1.supervisor_signoff,
        CTE1.summary_ideal,
        CTE1.summary_target,
        CTE1.summary_actual,
        CTE1.summary_scrap,
        CTE1.summary_actual - CTE1.summary_scrap AS summary_adjusted_actual,
        CASE
            WHEN (CTE1.summary_ideal = 0 AND CTE1.summary_target = 0) OR 
            ((CTE1.summary_actual - CTE1.summary_scrap) = 0 AND CTE1.summary_target = 0) OR
            (CTE1.summary_actual < CTE1.summary_target)
                THEN 'red'
                ELSE 'green'
        END AS background_color
    FROM CTE1
    ORDER BY CTE1.asset_code, CTE1.started_on_chunck ASC;
    RETURN;
    END;