
--exec dbo.spLocal_EY_DxH_Get_Shifts 1

 CREATE   PROCEDURE [dbo].[spLocal_EY_DxH_Get_Shifts] (@Site as int)

 AS  BEGIN 
 DECLARE
 @CurrentDateTime			DATETIME,
 @CurrentProductionDay		DATETIME,
 @YesterdayProductionDay	DATETIME,
 @TomorrowProductionDay		DATETIME,
 @DateOfShift				DATETIME;

SELECT @CurrentDateTime = SYSDATETIME() at time zone 'UTC' at time zone site_timezone
FROM dbo.CommonParameters where site_id = @Site;
SET @CurrentProductionDay = FORMAT(@CurrentDateTime, 'yyyy-MM-dd');
SET @YesterdayProductionDay = FORMAT(DATEADD(DAY, -1, @CurrentDateTime), 'yyyy-MM-dd');
SET @TomorrowProductionDay = FORMAT(DATEADD(DAY, 1, @CurrentDateTime), 'yyyy-MM-dd');


            SELECT shift_id, 
                   shift_code, 
                   shift_name, 
                   shift_sequence, 
                   DATEPART(hour, start_time) AS hour,
				   [start_time_offset_days],
				   DATEPART(hour, end_time) AS end_hour,
				   [end_time_offset_days],
                   [duration_in_minutes],
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
