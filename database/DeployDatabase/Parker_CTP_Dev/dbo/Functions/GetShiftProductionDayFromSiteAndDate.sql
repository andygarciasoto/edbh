CREATE   FUNCTION [dbo].[GetShiftProductionDayFromSiteAndDate]
(                   @site_id           INT,
                    @date   DATETIME
)
RETURNS @tablename TABLE (ProductionDay DATETIME, CurrentDateTime DATETIME, ShiftId INT, ShiftName VARCHAR(100), ShiftCode VARCHAR(100))
-- =============================================
-- Copyright © 2021 Ernst & Young LLP
-- All Rights Reserved
-- Author:	EY
-- Create date: 17/7/2021
-- Description: Gets the hierarchy of an specific asset
-- =============================================
-- =============================================
-- ...
-- Parameters:
--   @site_id				- This parameter specific which Site the function is going to use
--   @date					- This parameter specific which Date the function is going to use. If the value is null the function will use the site datetime

-- Returns:    Return all hierarchy of one asset in specific
-- =============================================
-- =============================================
AS
BEGIN

	DECLARE
	@timezone					AS VARCHAR(100),
	@ProductionDay				AS DATETIME,
	@CurrentDateTime			AS DATETIME,
	@first_shift_start_time		AS DATETIME,
	@last_shift_end_time		AS DATETIME,
	@last_shift_sequence		AS INT,
	@YesterdayProductionDay		AS DATETIME,
	@TomorrowProductionDay		AS DATETIME,
	@Shift_Name					AS VARCHAR(100),
	@Shift_Code					AS VARCHAR(100),
	@Shift_Id					AS INT;

	SELECT 
		@timezone = site_timezone
	FROM dbo.CommonParameters WHERE site_id = @site_id;

	SELECT @CurrentDateTime =
		CASE
			WHEN @date IS NULL THEN SYSDATETIME() at time zone 'UTC' at time zone @timezone
			ELSE @date
		END;

	SELECT @ProductionDay = FORMAT(@CurrentDateTime, 'yyyy-MM-dd');

	SELECT @first_shift_start_time = DATEADD(HOUR, DATEPART(HOUR, start_time), DATEADD(DAY, start_time_offset_days, @ProductionDay))
	FROM dbo.Shift
	WHERE STATUS = 'Active' AND asset_id = @site_id AND is_first_shift_of_day = 1;

	SELECT
	@last_shift_sequence = MAX(shift_sequence)
	FROM dbo.Shift
	WHERE STATUS = 'Active' AND asset_id = @site_id
	GROUP BY asset_id;
	
	SELECT
	@last_shift_end_time = DATEADD(HOUR, DATEPART(HOUR, end_time), DATEADD(DAY, end_time_offset_days, @ProductionDay))
	FROM dbo.Shift
	WHERE STATUS = 'Active' AND asset_id = @site_id AND shift_sequence = @last_shift_sequence;
	
	IF(@CurrentDateTime < @first_shift_start_time)
	BEGIN
		SET @ProductionDay = DATEADD(DAY, -1, @ProductionDay);
	END
	ELSE IF (@CurrentDateTime > @last_shift_end_time)
	BEGIN
		SET @ProductionDay = DATEADD(DAY, 1, @ProductionDay);
	END

	SET @YesterdayProductionDay = FORMAT(DATEADD(DAY, -1, @ProductionDay), 'yyyy-MM-dd');
	SET @TomorrowProductionDay = FORMAT(DATEADD(DAY, 1, @ProductionDay), 'yyyy-MM-dd');

	WITH CTE AS
	(SELECT
		shift_id, shift_name, shift_code, is_first_shift_of_day,
		--GET INTERVAL SHIFT FOR TODAY
		FORMAT(DATEADD(HOUR, DATEPART(HOUR, start_time), DATEADD(DAY, start_time_offset_days, @ProductionDay)), 'yyyy-MM-dd HH:mm') AS start_date_time_today,
		FORMAT(DATEADD(HOUR, DATEPART(HOUR, end_time), DATEADD(DAY, end_time_offset_days, @ProductionDay)), 'yyyy-MM-dd HH:mm') AS end_date_time_today,
		--GET INTERVAL SHIFT FOR YESTERDAY
		FORMAT(DATEADD(HOUR, DATEPART(HOUR, start_time), DATEADD(DAY, start_time_offset_days, @YesterdayProductionDay)), 'yyyy-MM-dd HH:mm') AS start_date_time_yesterday,
		FORMAT(DATEADD(HOUR, DATEPART(HOUR, end_time), DATEADD(DAY, end_time_offset_days, @YesterdayProductionDay)), 'yyyy-MM-dd HH:mm') AS end_date_time_yesterday,
		--GET INTERVAL SHIFT FOR TOMORROW
		FORMAT(DATEADD(HOUR, DATEPART(HOUR, start_time), DATEADD(DAY, start_time_offset_days, @TomorrowProductionDay)), 'yyyy-MM-dd HH:mm') AS start_date_time_tomorrow,
		FORMAT(DATEADD(HOUR, DATEPART(HOUR, end_time), DATEADD(DAY, end_time_offset_days, @TomorrowProductionDay)), 'yyyy-MM-dd HH:mm') AS end_date_time_tomorrow
	FROM dbo.Shift WHERE asset_id = @site_id AND STATUS = 'Active')
	SELECT 
		@Shift_Id = [shift_id],
		@Shift_Name = [shift_name],
		@Shift_Code = [shift_code]
		FROM CTE WHERE 
			@CurrentDateTime BETWEEN start_date_time_today AND end_date_time_today OR 
			@CurrentDateTime BETWEEN start_date_time_yesterday AND end_date_time_yesterday OR
			@CurrentDateTime BETWEEN start_date_time_tomorrow AND end_date_time_tomorrow;

	INSERT @tablename SELECT @ProductionDay, @CurrentDateTime, @Shift_Id, @Shift_Name, @Shift_Code;

RETURN 

END