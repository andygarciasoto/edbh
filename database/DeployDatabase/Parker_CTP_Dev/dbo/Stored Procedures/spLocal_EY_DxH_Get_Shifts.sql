/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_Shifts]    Script Date: 22/2/2021 20:44:36 ******/
--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_Shifts
--
--  Purpose:
--	Given a site, get the shifts of the site
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
--		Assumes that 3 days plus the current sift and the shifts in the current day 
--		are enough to get all desired InterShiftData
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
--	20190731		C00V00 - Intial code created
--		
-- Example Call:
-- exec spLocal_EY_DxH_Get_Shifts 1
--
CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Get_Shifts] (@Site as int)

 AS  BEGIN 
 DECLARE
 @CurrentDateTime			DATETIME,
 @CurrentProductionDay		DATETIME,
 @YesterdayProductionDay	DATETIME,
 @TomorrowProductionDay		DATETIME,
 @DateOfShift				DATETIME;


SELECT
@CurrentProductionDay = GSP.ProductionDay 
FROM dbo.GetShiftProductionDayFromSiteAndDate(@Site,NULL) GSP;

SET @YesterdayProductionDay = DATEADD(DAY, -1, @CurrentProductionDay);
SET @TomorrowProductionDay = DATEADD(DAY, 1, @CurrentProductionDay);


            SELECT shift_id, 
                   shift_code, 
                   shift_name, 
                   shift_sequence, 
                   DATEPART(hour, start_time) AS hour,
				   [start_time_offset_days],
				   DATEPART(hour, end_time) AS end_hour,
				   [end_time_offset_days],
                   [duration_in_minutes],
				   [duration_in_minutes]/60 as duration_in_hours,
                   --GET INTERVAL SHIFT FOR TODAY
				   FORMAT(DATEADD(HOUR, DATEPART(HOUR, start_time), DATEADD(DAY, start_time_offset_days, @CurrentProductionDay)), 'yyyy-MM-dd HH:mm') AS start_date_time_today,
				   FORMAT(DATEADD(HOUR, DATEPART(HOUR, end_time), DATEADD(DAY, end_time_offset_days, @CurrentProductionDay)), 'yyyy-MM-dd HH:mm') AS end_date_time_today,
				   --GET INTERVAL SHIFT FOR YESTERDAY
				   FORMAT(DATEADD(HOUR, DATEPART(HOUR, start_time), DATEADD(DAY, start_time_offset_days, @YesterdayProductionDay)), 'yyyy-MM-dd HH:mm') AS start_date_time_yesterday,
				   FORMAT(DATEADD(HOUR, DATEPART(HOUR, end_time), DATEADD(DAY, end_time_offset_days, @YesterdayProductionDay)), 'yyyy-MM-dd HH:mm') AS end_date_time_yesterday,
				   --GET INTERVAL SHIFT FOR TOMORROW
				   FORMAT(DATEADD(HOUR, DATEPART(HOUR, start_time), DATEADD(DAY, start_time_offset_days, @TomorrowProductionDay)), 'yyyy-MM-dd HH:mm') AS start_date_time_tomorrow,
				   FORMAT(DATEADD(HOUR, DATEPART(HOUR, end_time), DATEADD(DAY, end_time_offset_days, @TomorrowProductionDay)), 'yyyy-MM-dd HH:mm') AS end_date_time_tomorrow
				   FROM [dbo].[Shift]
				   WHERE STATUS = 'Active' AND asset_id = @site ORDER BY shift_sequence;

END
