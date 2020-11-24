
--
-- Copyright © 2020 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Fill_Row_Get_Active_Assets
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
--	20200405		C00V00 - Intial code created		
--		
-- Example Call:
-- exec dbo.spLocal_EY_DxH_Fill_Row_Get_Active_Assets
--

CREATE   PROCEDURE [dbo].[spLocal_EY_DxH_Fill_Row_Get_Active_Assets]
AS
    BEGIN
        -- SET NOCOUNT ON added to prevent extra result sets from
        -- interfering with SELECT statements.
        SET NOCOUNT ON;
        WITH CTE1
             AS (SELECT CP.site_id, 
                        CP.site_name,
						SYSDATETIME() AT TIME ZONE 'UTC' AT TIME ZONE CP.site_timezone AS current_site_time,
						CONVERT(DATETIME, FORMAT(SYSDATETIME() AT TIME ZONE 'UTC' AT TIME ZONE CP.site_timezone, 'yyyy-MM-dd HH')+':00') AS site_round_time,
						CONVERT(DATETIME, FORMAT(SYSDATETIME() AT TIME ZONE 'UTC' AT TIME ZONE CP.site_timezone, 'yyyy-MM-dd')) AS start_day_current
                 FROM dbo.CommonParameters CP
                 WHERE CP.STATUS = 'Active'),
             CTE2
             AS (SELECT CTE1.site_id, 
                        CTE1.site_name, 
                        CTE1.current_site_time, 
                        CTE1.site_round_time,
                        CASE
                            WHEN end_time < start_time
                                 AND is_first_shift_of_day = 1
                            THEN CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, start_time), DATEADD(DAY, -1, CTE1.start_day_current)), 'yyyy-MM-dd HH'), ':00')
                            ELSE CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, start_time), CTE1.start_day_current), 'yyyy-MM-dd HH'), ':00')
                        END AS start_date_time_today,
                        CASE
                            WHEN end_time < start_time
                                 AND is_first_shift_of_day = 0
                            THEN CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, end_time), DATEADD(DAY, 1, CTE1.start_day_current)), 'yyyy-MM-dd HH'), ':00')
                            ELSE CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, end_time), CTE1.start_day_current), 'yyyy-MM-dd HH'), ':00')
                        END AS end_date_time_today,
                        --GET INTERVAL SHIFT FOR YESTERDAY
                        CASE
                            WHEN end_time < start_time
                                 AND is_first_shift_of_day = 1
                            THEN CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, start_time), DATEADD(DAY, -1, DATEADD(DAY, -1, CTE1.start_day_current))), 'yyyy-MM-dd HH'), ':00')
                            ELSE CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, start_time), DATEADD(DAY, -1, CTE1.start_day_current)), 'yyyy-MM-dd HH'), ':00')
                        END AS start_date_time_yesterday,
                        CASE
                            WHEN end_time < start_time
                                 AND is_first_shift_of_day = 0
                            THEN CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, end_time), DATEADD(DAY, 1, DATEADD(DAY, -1, CTE1.start_day_current))), 'yyyy-MM-dd HH'), ':00')
                            ELSE CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, end_time), DATEADD(DAY, -1, CTE1.start_day_current)), 'yyyy-MM-dd HH'), ':00')
                        END AS end_date_time_yesterday,
                        --GET INTERVAL SHIFT FOR TOMORROW
                        CASE
                            WHEN end_time < start_time
                                 AND is_first_shift_of_day = 1
                            THEN CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, start_time), DATEADD(DAY, -1, DATEADD(DAY, 1, CTE1.start_day_current))), 'yyyy-MM-dd HH'), ':00')
                            ELSE CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, start_time), DATEADD(DAY, 1, CTE1.start_day_current)), 'yyyy-MM-dd HH'), ':00')
                        END AS start_date_time_tomorrow,
                        CASE
                            WHEN end_time < start_time
                                 AND is_first_shift_of_day = 0
                            THEN CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, end_time), DATEADD(DAY, 1, DATEADD(DAY, 1, CTE1.start_day_current))), 'yyyy-MM-dd HH'), ':00')
                            ELSE CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, end_time), DATEADD(DAY, 1, CTE1.start_day_current)), 'yyyy-MM-dd HH'), ':00')
                        END AS end_date_time_tomorrow
                 FROM CTE1
                      INNER JOIN dbo.Shift S ON S.asset_id = CTE1.site_id
                                                AND S.STATUS = 'Active'),
             CTE3
             AS (SELECT CTE2.site_id, 
                        CTE2.site_name, 
                        CTE2.current_site_time, 
                        CTE2.site_round_time,
                        CASE
                            WHEN CTE2.site_round_time > CTE2.start_date_time_today
                                 AND CTE2.site_round_time <= CTE2.end_date_time_today
                            THEN CTE2.start_date_time_today
                            WHEN CTE2.site_round_time > CTE2.start_date_time_yesterday
                                 AND CTE2.site_round_time <= CTE2.end_date_time_yesterday
                            THEN CTE2.start_date_time_yesterday
                            ELSE CTE2.start_date_time_tomorrow
                        END AS start_shift,
                        CASE
                            WHEN CTE2.site_round_time > CTE2.start_date_time_today
                                 AND CTE2.site_round_time <= CTE2.end_date_time_today
                            THEN CTE2.end_date_time_today
                            WHEN CTE2.site_round_time > CTE2.start_date_time_yesterday
                                 AND CTE2.site_round_time <= CTE2.end_date_time_yesterday
                            THEN CTE2.end_date_time_yesterday
                            ELSE CTE2.end_date_time_tomorrow
                        END AS end_shift
                 FROM CTE2
                 WHERE(CTE2.site_round_time > CTE2.start_date_time_today
                       AND CTE2.site_round_time <= CTE2.end_date_time_today)
                      OR (CTE2.site_round_time > CTE2.start_date_time_yesterday
                          AND CTE2.site_round_time <= CTE2.end_date_time_yesterday)
                      OR (CTE2.site_round_time > CTE2.start_date_time_tomorrow
                          AND CTE2.site_round_time <= CTE2.end_date_time_tomorrow))
             SELECT DISTINCT 
                    CTE3.site_id, 
                    CTE3.site_name, 
                    CTE3.current_site_time, 
                    CTE3.site_round_time, 
                    CONVERT(DATETIME, CTE3.start_shift) AS start_shift, 
                    CONVERT(DATETIME, CTE3.end_shift) AS end_shift, 
                    A.asset_id, 
                    A.asset_code, 
                    A.asset_name
             FROM CTE3
                  JOIN dbo.Asset A ON A.site_code = CTE3.site_name
                                      AND A.STATUS = 'Active'
                                      AND A.asset_level = 'Cell'
                  JOIN dbo.OrderData OD ON OD.asset_id = A.asset_id
                                           AND (
										   --ORDER THATS ENDS IN THE INTERVAL OF HOURS
										   (OD.end_time >= CTE3.start_shift AND OD.end_time < CTE3.site_round_time)
                                           OR
										   --ACTIVE ORDER
										   (OD.end_time IS NULL)
										   )
             ORDER BY CTE3.site_id, 
                      A.asset_id;
    END;
