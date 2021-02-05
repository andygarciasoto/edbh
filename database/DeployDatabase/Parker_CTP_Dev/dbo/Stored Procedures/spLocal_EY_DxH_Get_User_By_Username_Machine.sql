
--exec [dbo].[spLocal_EY_DxH_Get_User_By_Username_Machine] 'Ryan', '0'

CREATE      PROCEDURE [dbo].[spLocal_EY_DxH_Get_User_By_Username_Machine] (@username as VARCHAR(100), @machine as VARCHAR(100))

  AS  BEGIN 
 DECLARE
 @site				INT,
 @name				VARCHAR(100),
 @timezone			VARCHAR(100),
 @timezone2			VARCHAR(100),
 @Shift_Name		VARCHAR(100),
 @Shift_Id			INT,
 @language			VARCHAR(100),
 @summary_timeout	FLOAT,
 @inactive_timeout_minutes FLOAT,
 @socket_timeout		FLOAT,
 @max_regression		FLOAT,
 @token_expiration	FLOAT,
 @CurrentDateTime	DATETIME,
 @StartDayCurrent	DATETIME,
 @DateOfShift		DATETIME;

IF @machine = '0'
BEGIN

SELECT TOP 1 
@site = site 
FROM dbo.TFDUsers 
WHERE username = @username;

SELECT TOP 1 @name = asset_code 
FROM dbo.Asset 
WHERE asset_id = @site;
END
ELSE
BEGIN
SELECT @site = asset_id, 
@name = site_code
FROM DBO.Asset 
WHERE asset_code IN 
(SELECT site_code FROM DBO.Asset WHERE asset_id IN 
(SELECT asset_id FROM DBO.AssetDisplaySystem WHERE displaysystem_name like CONCAT(@machine,'%')));
END

SELECT 
@timezone = ui_timezone,
@timezone2 = site_timezone,
@language = language
FROM dbo.CommonParameters where site_id = @site;

SELECT @CurrentDateTime = SYSDATETIME() at time zone 'UTC' at time zone @timezone2;
SET @StartDayCurrent = FORMAT(@CurrentDateTime, 'yyyy-MM-dd');

SELECT
@summary_timeout = summary_timeout,
@inactive_timeout_minutes = inactive_timeout_minutes,
@socket_timeout = socket_timeout,
@max_regression = max_regression,
@token_expiration = token_expiration
FROM dbo.GlobalParameters;

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

SELECT ID as id, badge, username, first_name, last_name, role, role_id, site, @name as site_name,
 @timezone as timezone, @Shift_Id as shift_id, @Shift_Name as shift_name, FORMAT(@DateOfShift,'yyyy-MM-dd HH:mm') AS date_of_shift, 
FORMAT(@CurrentDateTime,'yyyy-MM-dd HH:mm') AS current_date_time, @language as language, @summary_timeout as summary_timeout,
@inactive_timeout_minutes as inactive_timeout_minutes, @socket_timeout as socket_timeout, @max_regression as max_regression, @token_expiration as token_expiration 
FROM dbo.TFDUsers where username = @username AND Site = @site;


END
