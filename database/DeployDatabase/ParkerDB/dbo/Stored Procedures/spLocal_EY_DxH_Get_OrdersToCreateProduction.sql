
--
-- Copyright © 2020 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_Shift_Data
--
--  Purpose:
--  Given an orders of the last hour to fill production table
--
--  To Do:
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
--- None
---
--  Variables:
---
---
--  Tables Modified:
---
-- Modification Change History:
--------------------------------------------------------------------------------
--  20200325        C00V00 - Intial code created        
--      
-- Example Call:
-- exec dbo.spLocal_EY_DxH_Get_OrdersToCreateProduction
--

CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Get_OrdersToCreateProduction]
AS

    BEGIN
        -- SET NOCOUNT ON added to prevent extra result sets from
        -- interfering with SELECT statements.
        SET NOCOUNT ON;

WITH CTE1
     AS (SELECT CP.site_id,
                CP.site_timezone,
                CP.default_routed_cycle_time, 
                CP.default_target_percent_of_ideal,
                A.asset_code AS site_code,
                SYSDATETIME() at time zone 'UTC' at time zone CP.site_timezone AS actual_time,
                CONVERT(DATETIME, CONCAT(FORMAT(SYSDATETIME() at time zone 'UTC' at time zone CP.site_timezone,'yyyy-MM-dd HH'),':00')) AS actual_hour,
                DATEADD(HOUR, -1, CONVERT(DATETIME, CONCAT(FORMAT(SYSDATETIME() at time zone 'UTC' at time zone CP.site_timezone,'yyyy-MM-dd HH'),':00'))) AS before_hour
         FROM dbo.CommonParameters AS CP
              INNER JOIN dbo.Asset A ON A.asset_id = CP.site_id),
     CTE2
     AS (SELECT CTE1.site_id, 
                CTE1.site_code,
                CTE1.site_timezone,
                CTE1.default_routed_cycle_time,
                CTE1.default_target_percent_of_ideal,
                CTE1.actual_time, 
                CTE1.actual_hour, 
                CTE1.before_hour, 
                S.shift_id, 
                S.shift_code,
                CASE
                    WHEN S.end_time < S.start_time
                         AND S.is_first_shift_of_day = 1
                    THEN CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, S.start_time), DATEADD(DAY, -1, FORMAT(CTE1.before_hour, 'yyyy-MM-dd'))), 'yyyy-MM-dd HH'), ':00')
                    ELSE CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, S.start_time), FORMAT(CTE1.before_hour, 'yyyy-MM-dd')), 'yyyy-MM-dd HH'), ':00')
                END AS start_shift,
                CASE
                    WHEN S.end_time < S.start_time
                         AND S.is_first_shift_of_day = 0
                    THEN CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, S.end_time), DATEADD(DAY, 1, FORMAT(CTE1.before_hour, 'yyyy-MM-dd'))), 'yyyy-MM-dd HH'), ':00')
                    ELSE CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, S.end_time), FORMAT(CTE1.before_hour, 'yyyy-MM-dd')), 'yyyy-MM-dd HH'), ':00')
                END AS end_shift
         FROM CTE1
              INNER JOIN dbo.Shift S ON S.asset_id = CTE1.site_id
                                        AND CTE1.actual_hour BETWEEN CASE
                                                                         WHEN S.end_time < S.start_time
                                                                              AND S.is_first_shift_of_day = 1
                                                                         THEN CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, S.start_time), DATEADD(DAY, -1, FORMAT(CTE1.before_hour, 'yyyy-MM-dd'))), 'yyyy-MM-dd HH'), ':00')
                                                                         ELSE CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, S.start_time), FORMAT(CTE1.before_hour, 'yyyy-MM-dd')), 'yyyy-MM-dd HH'), ':00')
                                                                     END AND CASE
                                                                                 WHEN S.end_time < S.start_time
                                                                                      AND S.is_first_shift_of_day = 0
                                                                                 THEN CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, S.end_time), DATEADD(DAY, 1, FORMAT(CTE1.before_hour, 'yyyy-MM-dd'))), 'yyyy-MM-dd HH'), ':00')
                                                                                 ELSE CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, S.end_time), FORMAT(CTE1.before_hour, 'yyyy-MM-dd')), 'yyyy-MM-dd HH'), ':00')
                                                                             END)
     SELECT CTE2.site_id, 
            CTE2.actual_time,
            CTE2.actual_hour,
            CTE2.before_hour,
            CONVERT(DATETIME, CTE2.start_shift) AS start_shift,
            A.asset_id,
            A.asset_code,
            OD.product_code,
            OD.order_id,
            --OD.order_number,
            OD.start_time,
            OD.end_time,
            --OD.UOM_code,
            PD.productiondata_id,
            --PD.actual,
            DHD.dxhdata_id,
            TTPRD.shift_production,
            CONVERT(BIT, CASE
            WHEN OD.start_time < CTE2.before_hour AND ISNULL(TTPRD.shift_production,0) > 0 THEN 1
            ELSE 0
            END) AS check_previous_rows
     FROM CTE2
          INNER JOIN dbo.Asset A ON A.site_code = CTE2.site_code AND A.STATUS = 'Active' AND A.asset_level = 'Cell'
          INNER JOIN dbo.OrderData OD ON A.asset_id = OD.asset_id AND (OD.end_time BETWEEN CTE2.before_hour AND CTE2.actual_hour OR OD.end_time IS NULL)
          LEFT JOIN dbo.ProductionData PD ON PD.order_id = OD.order_id AND PD.start_time BETWEEN CTE2.before_hour AND CTE2.actual_hour
          LEFT JOIN dbo.DxHData DHD ON A.asset_id = DHD.asset_id
                                           AND CONCAT(FORMAT(CTE2.before_hour, 'htt'), ' - ', FORMAT(CTE2.actual_hour, 'htt')) = UPPER(DHD.hour_interval)
                                           AND DATEADD(HOUR,DATEPART(HOUR, CTE2.before_hour),production_day) BETWEEN CTE2.before_hour AND CTE2.actual_hour
          --GET THE PRODUCTION OF EACH ORDER FOR THE CURRENT SHIFT
          OUTER APPLY
          (
          SELECT SUM(actual-other_scrap-setup_scrap) AS shift_production 
          FROM dbo.ProductionData WHERE order_id = OD.order_id AND start_time >= CTE2.start_shift AND start_time < CTE2.actual_hour
          ) TTPRD
     ORDER BY CTE2.site_id, 
              A.asset_id;

    END;
