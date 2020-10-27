CREATE FUNCTION [dbo].[AddIntervalToDate]
        (@interval INT,
		@frequency INT=15,
		@TempDate DATETIME )
RETURNS DATETIME
-- =============================================
-- Copyright © 2018 Ernst & Young LLP
-- All Rights Reserved
-- Author:      Gustavo Perez Espinoza
-- Create date: 10/7/2018
-- Description: Add Intervals of time to a date
-- =============================================
-- =============================================
-- ...
-- Parameters:
--   @interval - it's the interval that the function is going to add to the initial date, possibly values for @interval
--			For Minutes -> 1
--			For Hours   -> 60
--			For Days    -> 1440
--			For Weeks   -> 10080
--			For Months  -> 43200 
--			For Years   -> 525600 
--   @frequency - How many times the function is going to add the interval to the tempDate
--   @TempDate  - The date that the function is going to add the interval
-- Returns:    Date that the function is going to modify with the interval and the frequency
-- =============================================
-- =============================================
-- ...
-- Returns:    Date that the function is going to modify with the interval and the frequency
--   1440,2,"20170101" -> "20170103"
--   10080,2,"20170101" -> "201701015"
--   43200,3,"20170101" -> "20170401"
--   525600,3,"20170101" -> "20200101"
-- =============================================
AS 
BEGIN
		RETURN CASE	
				WHEN @interval= 60
					THEN DATEADD(HOUR, @frequency, @TempDate)
				WHEN @interval= 1440
					THEN DATEADD(DAY, @frequency, @TempDate)
				WHEN @interval= 10080
					THEN DATEADD(WEEK, @frequency, @TempDate)
				WHEN @interval= 43200
					THEN DATEADD(MONTH, @frequency, @TempDate)
				WHEN @interval= 525600
					THEN DATEADD(YEAR, @frequency, @TempDate)
				ELSE 	
					DATEADD(MINUTE, @frequency, @TempDate)
			END;
END
