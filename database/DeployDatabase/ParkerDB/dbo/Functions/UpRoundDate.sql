CREATE FUNCTION [dbo].[UpRoundDate] 
(		
		@temp_date	Datetime,	
		@interval	INT,
		@frequency	INT
 )
RETURNS DATETIME
-- =============================================
-- Copyright © 2018 Ernst & Young LLP
-- All Rights Reserved
-- Author:      Gustavo Perez Espinoza
-- Create date: 10/7/2018
-- Description: Calculates the up round date having as reference the interval and the frequency
-- =============================================
-- =============================================
-- ...
-- Parameters:
--   @temp_date - Date that is going to round 
--   @interval  - it's the interval that the function is going to add to the initial date, possibly  values for @Interval
--			For Minutes -> 1
--			For Hours   -> 60
--			For Days    -> 1440
--			For Weeks   -> 10080
--			For Months  -> 43200 
--			For Years   -> 525600
--   @frequency  - How many times the function is going to add the interval to the tempDate
-- Returns:    Return the next round date having as reference the interval and the frequency
-- =============================================
-- =============================================
-- ...
-- Returns:    Return the next round date having as reference the interval and the frequency
--Paramters
--		@@temp_date  DATETIME='20180901 03:23:34'
--		@frequency INT= 30,
--		@interval INT= 1;
--Output
--		2018-09-01 03:30:00.000
-- =============================================
AS 
BEGIN
	RETURN CASE	
				WHEN @interval= 60
					THEN DATEADD(HOUR, (DATEDIFF(HOUR,0, @temp_date)/@frequency+1)*@frequency, 0)
				WHEN @interval= 1440
					THEN DATEADD(DAY, (DATEDIFF(DAY,0, @temp_date)/@frequency+1)*@frequency, 0)
				WHEN @interval= 10080
					THEN DATEADD(WEEK, (DATEDIFF(WEEK,0, @temp_date)/@frequency+1)*@frequency, 0)
				WHEN @interval= 43200
					THEN DATEADD(MONTH, (DATEDIFF(MONTH,0, @temp_date)/@frequency+1)*@frequency, 0)
				WHEN @interval= 525600
					THEN DATEADD(YEAR, (DATEDIFF(YEAR,0, @temp_date)/@frequency+1)*@frequency, 0)
				ELSE 	
					DATEADD(MINUTE, (DATEDIFF(MINUTE,0, @temp_date)/@frequency+1)*@frequency, 0)
			END;
END
