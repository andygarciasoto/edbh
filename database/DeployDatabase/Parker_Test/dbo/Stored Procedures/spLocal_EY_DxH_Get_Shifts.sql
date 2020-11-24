
--exec dbo.spLocal_EY_DxH_Get_Shifts 119

 CREATE   PROCEDURE [dbo].[spLocal_EY_DxH_Get_Shifts] (@Site as int)

 AS  BEGIN 
 DECLARE
 @CurrentDateTime	DATETIME,
 @StartDayCurrent	DATETIME,
 @DateOfShift		DATETIME;

SELECT @CurrentDateTime = SYSDATETIME() at time zone 'UTC' at time zone site_timezone
FROM dbo.CommonParameters where site_id = @Site;
SET @StartDayCurrent = FORMAT(@CurrentDateTime, 'yyyy-MM-dd');


            SELECT shift_id, 
                   shift_code, 
                   shift_name, 
                   shift_sequence, 
                   DATEPART(hour, start_time) AS hour, 
                   [duration_in_minutes],
                   --GET INTERVAL SHIFT FOR TODAY
				   CASE
						WHEN end_time < start_time AND is_first_shift_of_day = 1
						THEN CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, start_time), DATEADD(DAY, -1, @StartDayCurrent)), 'yyyy-MM-dd HH'), ':00')
						ELSE CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, start_time), @StartDayCurrent), 'yyyy-MM-dd HH'), ':00')
				   END AS start_date_time_today,
				   CASE
						WHEN end_time < start_time AND is_first_shift_of_day = 0
						THEN CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, end_time), DATEADD(DAY, 1, @StartDayCurrent)), 'yyyy-MM-dd HH'), ':00')
						ELSE CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, end_time), @StartDayCurrent), 'yyyy-MM-dd HH'), ':00')
				   END AS end_date_time_today,
				   --GET INTERVAL SHIFT FOR YESTERDAY
				   CASE
						WHEN end_time < start_time AND is_first_shift_of_day = 1
						THEN CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, start_time), DATEADD(DAY, -1, DATEADD(DAY, -1, @StartDayCurrent))), 'yyyy-MM-dd HH'), ':00')
						ELSE CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, start_time), DATEADD(DAY, -1, @StartDayCurrent)), 'yyyy-MM-dd HH'), ':00')
				   END AS start_date_time_yesterday,
				   CASE
						WHEN end_time < start_time AND is_first_shift_of_day = 0
						THEN CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, end_time), DATEADD(DAY, 1, DATEADD(DAY, -1, @StartDayCurrent))), 'yyyy-MM-dd HH'), ':00')
						ELSE CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, end_time), DATEADD(DAY, -1, @StartDayCurrent)), 'yyyy-MM-dd HH'), ':00')
				   END AS end_date_time_yesterday,
				   --GET INTERVAL SHIFT FOR TOMORROW
				   CASE
						WHEN end_time < start_time AND is_first_shift_of_day = 1
						THEN CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, start_time), DATEADD(DAY, -1, DATEADD(DAY, 1, @StartDayCurrent))), 'yyyy-MM-dd HH'), ':00')
						ELSE CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, start_time), DATEADD(DAY, 1, @StartDayCurrent)), 'yyyy-MM-dd HH'), ':00')
				   END AS start_date_time_tomorrow,
				   CASE
						WHEN end_time < start_time AND is_first_shift_of_day = 0
						THEN CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, end_time), DATEADD(DAY, 1, DATEADD(DAY, 1, @StartDayCurrent))), 'yyyy-MM-dd HH'), ':00')
						ELSE CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, end_time), DATEADD(DAY, 1, @StartDayCurrent)), 'yyyy-MM-dd HH'), ':00')
				   END AS end_date_time_tomorrow
				   FROM [dbo].[Shift]
				   WHERE STATUS = 'Active' AND asset_id = @site ORDER BY shift_sequence;

END
