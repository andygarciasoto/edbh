
--exec [dbo].[spLocal_EY_DxH_Get_User_By_Clocknumber_Asset] '2291', '168H-0006'

 CREATE     PROCEDURE [dbo].[spLocal_EY_DxH_Get_User_By_Clocknumber_Asset] (@badge as VARCHAR(100), @asset_code as VARCHAR(100))

  AS  BEGIN 
 DECLARE
 @site				INT,
 @name				VARCHAR(100),
 @timezone			VARCHAR(100),
 @timezone2			VARCHAR(100),
 @Shift_Name		VARCHAR(100),
 @Shift_Id			INT,
 @language			VARCHAR(100),
 @timeout			FLOAT,
 @summary_timeout	INT,
 @CurrentDateTime	DATETIME,
 @StartDayCurrent	DATETIME,
 @DateOfShift		DATETIME;

IF EXISTS (SELECT site FROM dbo.TFDUsers WHERE 
badge = @badge and Site = (SELECT asset_id FROM [dbo].[Asset] WHERE asset_level = 'Site' and site_code = (SELECT site_code FROM dbo.Asset where asset_code = @asset_code)))
BEGIN
SELECT @site = asset_id, @name = site_code
FROM [dbo].[Asset] WHERE asset_level = 'Site' and site_code = (SELECT site_code FROM dbo.Asset where asset_code = @asset_code);
END

SELECT 
@timezone = ui_timezone,
@timezone2 = site_timezone,
@language = language,
@timeout = inactive_timeout_minutes,
@summary_timeout = summary_timeout
FROM dbo.CommonParameters where site_id = @site;

SELECT @CurrentDateTime = SYSDATETIME() at time zone 'UTC' at time zone @timezone2;
SET @StartDayCurrent = FORMAT(@CurrentDateTime, 'yyyy-MM-dd');

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

SELECT ID as id, badge, username, first_name, last_name, role, site, @name as site_name,
 @timezone as timezone, @Shift_Id as shift_id, @Shift_Name as shift_name, FORMAT(@DateOfShift,'yyyy-MM-dd HH:mm') AS date_of_shift, 
 FORMAT(@CurrentDateTime,'yyyy-MM-dd HH:mm') AS current_date_time, @language as language, @timeout as inactive_timeout_minutes, @summary_timeout as summary_timeout
 FROM dbo.TFDUsers where badge = @badge AND Site = @site;

END
