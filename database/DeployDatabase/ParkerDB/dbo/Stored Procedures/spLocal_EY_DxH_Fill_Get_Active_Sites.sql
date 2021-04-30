/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Fill_Get_Active_Sites]    Script Date: 25/2/2021 19:48:44 ******/
--
-- Copyright © 2020 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Fill_Get_Active_Sites
--
--  Purpose:
--	Get the active sites and the current shift to fill production table
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
--	20210217		C00V01 - Update logic to use new shift structure and GetShiftProductionDayFromSiteAndDate function
--		
-- Example Call:
-- exec dbo.spLocal_EY_DxH_Fill_Get_Active_Sites
--

CREATE   PROCEDURE [dbo].[spLocal_EY_DxH_Fill_Get_Active_Sites]
AS
    BEGIN
        -- SET NOCOUNT ON added to prevent extra result sets from
        -- interfering with SELECT statements.
        SET NOCOUNT ON;
        DECLARE
		@asset_level	NVARCHAR(100) = 'Site',
		@status			NVARCHAR(100) = 'Active';

		WITH CTE1 AS (
			SELECT
				A.asset_id AS site_id,
				A.asset_name AS site_name,
				FUN_GSP.CurrentDateTime AS current_site_time,
				CONVERT(DATETIME, FORMAT(FUN_GSP.CurrentDateTime, 'yyyy-MM-dd HH')+':00') AS site_round_time,
				DATEADD(HOUR, DATEPART(HOUR, S.start_time), DATEADD(DAY, S.start_time_offset_days, FUN_GSP.ProductionDay)) AS start_date_time_today,
				DATEADD(HOUR, DATEPART(HOUR, S.end_time), DATEADD(DAY, S.end_time_offset_days, FUN_GSP.ProductionDay)) AS end_date_time_today,
				FUN_GSP_1.CurrentDateTime AS current_site_time_1,
				CONVERT(DATETIME, FORMAT(FUN_GSP_1.CurrentDateTime, 'yyyy-MM-dd HH')+':00') AS site_round_time_1,
				DATEADD(HOUR, DATEPART(HOUR, S1.start_time), DATEADD(DAY, S1.start_time_offset_days, FUN_GSP_1.ProductionDay)) AS start_date_time_today_1,
				DATEADD(HOUR, DATEPART(HOUR, S1.end_time), DATEADD(DAY, S1.end_time_offset_days, FUN_GSP_1.ProductionDay)) AS end_date_time_today_1
			FROM dbo.Asset A 
			CROSS APPLY dbo.[GetShiftProductionDayFromSiteAndDate](A.asset_id, NULL) FUN_GSP
			INNER JOIN dbo.Shift S
				ON S.shift_id = FUN_GSP.ShiftId
			CROSS APPLY dbo.[GetShiftProductionDayFromSiteAndDate]
					(
						A.asset_id,
						CASE
							WHEN FUN_GSP.CurrentDateTime >= DATEADD(HOUR, DATEPART(HOUR, S.start_time), DATEADD(DAY, S.start_time_offset_days, FUN_GSP.ProductionDay))
								AND FUN_GSP.CurrentDateTime < DATEADD(HOUR, DATEPART(HOUR, S.start_time) + 1, DATEADD(DAY, S.start_time_offset_days, FUN_GSP.ProductionDay))
							THEN DATEADD(HOUR, DATEPART(HOUR, S.start_time) - 1, DATEADD(DAY, S.start_time_offset_days, FUN_GSP.ProductionDay))
							ELSE NULL
						END
					) FUN_GSP_1
			INNER JOIN dbo.Shift S1
				ON S1.shift_id = FUN_GSP_1.ShiftId
			WHERE
				A.asset_level = @asset_level AND A.status = @status
		)
		SELECT
			CTE1.site_id,
			CTE1.site_name,
			CTE1.current_site_time,
			CTE1.site_round_time,
			CASE WHEN CTE1.current_site_time = CTE1.current_site_time_1
				THEN CTE1.start_date_time_today
				ELSE CTE1.start_date_time_today_1
			END AS start_date_time_today,
			CASE WHEN CTE1.current_site_time = CTE1.current_site_time_1
				THEN CTE1.end_date_time_today
				ELSE CTE1.end_date_time_today_1
			END AS end_date_time_today
		FROM CTE1;
    END;
