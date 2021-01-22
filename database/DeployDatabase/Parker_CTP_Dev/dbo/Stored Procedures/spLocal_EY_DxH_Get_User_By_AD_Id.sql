
--exec [dbo].[spLocal_EY_DxH_Get_User_By_Clocknumber_Machine] '2291', '0'

CREATE   PROCEDURE [dbo].[spLocal_EY_DxH_Get_User_By_AD_Id] (@AD_Id as VARCHAR(100))

  AS  BEGIN 
DECLARE
@site				INT,
@name				VARCHAR(100),
@timezone			VARCHAR(100),
@CurrentDateTime	DATETIME,
@StartDayCurrent	DATETIME,
@DateOfShift		DATETIME,
@timezone2			VARCHAR(100),
@Shift_Name			VARCHAR(100),
@Shift_Id			INT,
@language			VARCHAR(100),
@summary_timeout	FLOAT,
@inactive_timeout_minutes FLOAT,
@socket_timeout		FLOAT,
@max_regression		FLOAT,
@token_expiration	FLOAT,
@vertical_shift_id	INT;


SELECT TOP 1 
@site = site 
FROM dbo.TFDUsers 
WHERE badge = @AD_Id

SELECT TOP 1 
@name = asset_code 
FROM dbo.Asset where asset_id = @site;

SELECT 
@timezone = ui_timezone,
@timezone2 = site_timezone,
@language = language
FROM dbo.CommonParameters where site_id = @site;

SELECT @CurrentDateTime = SYSDATETIME() at time zone 'UTC' at time zone @timezone2;
SELECT @StartDayCurrent = FORMAT(@CurrentDateTime, 'yyyy-MM-dd');

SELECT
@summary_timeout = summary_timeout,
@inactive_timeout_minutes = inactive_timeout_minutes,
@socket_timeout = socket_timeout,
@max_regression = max_regression,
@token_expiration = token_expiration
FROM dbo.GlobalParameters;

SELECT
@vertical_shift_id = shift_id
FROM dbo.Shift WHERE asset_id = @site
AND status = 'Inactive' AND shift_name = 'Vertical';

WITH CTE AS
(SELECT shift_id, shift_name, is_first_shift_of_day,
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
FROM dbo.Shift WHERE asset_id = @Site AND STATUS = 'Active')
SELECT 
@Shift_Id = [shift_id],
@Shift_Name = [shift_name],
@DateOfShift = CASE
WHEN @CurrentDateTime BETWEEN start_date_time_yesterday AND end_date_time_yesterday THEN  DATEADD(DAY, -1, @StartDayCurrent)
WHEN @CurrentDateTime BETWEEN start_date_time_tomorrow AND end_date_time_tomorrow THEN DATEADD(DAY, 1, @StartDayCurrent)
ELSE @StartDayCurrent
END
FROM CTE WHERE 
@CurrentDateTime BETWEEN start_date_time_today AND end_date_time_today OR 
@CurrentDateTime BETWEEN start_date_time_yesterday AND end_date_time_yesterday OR
@CurrentDateTime BETWEEN start_date_time_tomorrow AND end_date_time_tomorrow;

SELECT ID as id, badge, username, first_name, last_name, role, site, @name as site_name, @timezone as timezone, @Shift_Id as shift_id, @Shift_Name as shift_name, 
FORMAT(@DateOfShift,'yyyy-MM-dd HH:mm') AS date_of_shift, FORMAT(@CurrentDateTime,'yyyy-MM-dd HH:mm') AS current_date_time, @language as language, @summary_timeout as summary_timeout,
@inactive_timeout_minutes as inactive_timeout_minutes, @socket_timeout as socket_timeout, @max_regression as max_regression, @token_expiration as token_expiration,
@vertical_shift_id as vertical_shift_id
FROM dbo.TFDUsers where badge = @AD_Id AND Site = @site


END
