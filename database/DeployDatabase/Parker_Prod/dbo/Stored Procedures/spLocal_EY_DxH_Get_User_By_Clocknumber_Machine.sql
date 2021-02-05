
--exec [dbo].[spLocal_EY_DxH_Get_User_By_Clocknumber_Machine] '2291', '0'

CREATE   PROCEDURE [dbo].[spLocal_EY_DxH_Get_User_By_Clocknumber_Machine] (@badge as VARCHAR(100), @machine as VARCHAR(100))

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
	@vertical_shift_id	INT,
	@first_shift_start_time DATETIME,
	@last_shift_end_time DATETIME,
	@last_shift_sequence INT,
	@CurrentProductionDay		DATETIME,
	@YesterdayProductionDay	DATETIME,
	@TomorrowProductionDay		DATETIME;

IF @machine = '0'
BEGIN
	SELECT TOP 1 
		@site = site 
	FROM dbo.TFDUsers 
	WHERE badge = @badge
	
	SELECT TOP 1 
		@name = asset_code 
	FROM dbo.Asset where asset_id = @site
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
FROM dbo.CommonParameters WHERE site_id = @site;

SELECT @CurrentDateTime = SYSDATETIME() at time zone 'UTC' at time zone @timezone2;
SELECT @StartDayCurrent = FORMAT(@CurrentDateTime, 'yyyy-MM-dd');

SELECT
@first_shift_start_time = DATEADD(HOUR, DATEPART(HOUR, start_time), DATEADD(DAY, start_time_offset_days, @StartDayCurrent))
FROM dbo.Shift
WHERE STATUS = 'Active' AND asset_id = @site AND is_first_shift_of_day = 1;

SELECT
@last_shift_sequence = MAX(shift_sequence)
FROM dbo.Shift
WHERE STATUS = 'Active' AND asset_id = @site
GROUP BY asset_id;

SELECT
@last_shift_end_time = DATEADD(HOUR, DATEPART(HOUR, end_time), DATEADD(DAY, end_time_offset_days, @StartDayCurrent))
FROM dbo.Shift
WHERE STATUS = 'Active' AND asset_id = @site AND shift_sequence = @last_shift_sequence;

IF(@StartDayCurrent < @first_shift_start_time)
BEGIN
	SET @StartDayCurrent = DATEADD(DAY, -1, @StartDayCurrent);
END
ELSE IF (@StartDayCurrent > @last_shift_sequence)
BEGIN
	SET @StartDayCurrent = DATEADD(DAY, 1, @StartDayCurrent);
END

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

SET @CurrentProductionDay = FORMAT(@StartDayCurrent, 'yyyy-MM-dd');
SET @YesterdayProductionDay = FORMAT(DATEADD(DAY, -1, @StartDayCurrent), 'yyyy-MM-dd');
SET @TomorrowProductionDay = FORMAT(DATEADD(DAY, 1, @StartDayCurrent), 'yyyy-MM-dd');

WITH CTE AS
	(SELECT
		shift_id, shift_name, is_first_shift_of_day,
		--GET INTERVAL SHIFT FOR TODAY
		FORMAT(DATEADD(HOUR, DATEPART(HOUR, start_time), DATEADD(DAY, start_time_offset_days, @CurrentProductionDay)), 'yyyy-MM-dd HH:mm') AS start_date_time_today,
		FORMAT(DATEADD(HOUR, DATEPART(HOUR, end_time), DATEADD(DAY, end_time_offset_days, @CurrentProductionDay)), 'yyyy-MM-dd HH:mm') AS end_date_time_today,
		--GET INTERVAL SHIFT FOR YESTERDAY
		FORMAT(DATEADD(HOUR, DATEPART(HOUR, start_time), DATEADD(DAY, start_time_offset_days, @YesterdayProductionDay)), 'yyyy-MM-dd HH:mm') AS start_date_time_yesterday,
		FORMAT(DATEADD(HOUR, DATEPART(HOUR, end_time), DATEADD(DAY, end_time_offset_days, @YesterdayProductionDay)), 'yyyy-MM-dd HH:mm') AS end_date_time_yesterday,
		--GET INTERVAL SHIFT FOR TOMORROW
		FORMAT(DATEADD(HOUR, DATEPART(HOUR, start_time), DATEADD(DAY, start_time_offset_days, @TomorrowProductionDay)), 'yyyy-MM-dd HH:mm') AS start_date_time_tomorrow,
		FORMAT(DATEADD(HOUR, DATEPART(HOUR, end_time), DATEADD(DAY, end_time_offset_days, @TomorrowProductionDay)), 'yyyy-MM-dd HH:mm') AS end_date_time_tomorrow
	FROM dbo.Shift WHERE asset_id = @Site AND STATUS = 'Active')
	SELECT 
		@Shift_Id = [shift_id],
		@Shift_Name = [shift_name],
		@DateOfShift =
			CASE
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
FROM dbo.TFDUsers where badge = @badge AND Site = @site


END



