CREATE FUNCTION [dbo].[GetRangesBetweenDates] 
        (@started_on	Datetime,
		@ended_on	Datetime,		
		@interval INT,
		@frequency INT=15 )
RETURNS TABLE
-- =============================================
-- Copyright © 2018 Ernst & Young LLP
-- All Rights Reserved
-- Author:      Gustavo Perez Espinoza
-- Create date: 10/7/2018
-- Description: Calculates ranges of dates between two date with a specific frequency and specific interval
-- =============================================
-- =============================================
-- ...
-- Parameters:
--   @started_on - Initial date where the function star to calculate all the ranges
--   @ended_on   - Final date where the function end to calculate all the ranges
--   @interval  - it's the interval that the function is going to add to the initial date, possibly values for @interval
--			For Minutes -> 1
--			For Hours   -> 60
--			For Days    -> 1440
--			For Weeks   -> 10080
--			For Months  -> 43200 
--			For Years   -> 525600
--   @frequency  - How many times the function is going to add the interval to the tempDate
-- Returns:    Return all the ranges with the specific interval and the specific frequency bewtween the two dates
-- =============================================
-- =============================================
-- ...
-- Returns:    Return all the ranges with the specific interval and the specific frequency bewtween the two dates
--Paramters
--		@started_on datetime='20170101'
--		@ended_on datetime='20170101 01:00'
--		@interval= 1
--		@frequency int=15
--Output
--		1	2017-01-01 00:00:00.000	2017-01-01 00:15:00.000
--		2	2017-01-01 00:15:00.000	2017-01-01 00:30:00.000
--		3	2017-01-01 00:30:00.000	2017-01-01 00:45:00.000
--		4	2017-01-01 00:45:00.000	2017-01-01 01:00:00.003
-- =============================================
AS 
RETURN

  ( WITH CTE_RECURSIVE_DATES AS(
	
			SELECT 1 AS id_chun,
				   @started_on AS started_on_chunck,
				   CASE WHEN @interval>0 AND @frequency>0 
							THEN  
								CASE	
									WHEN dbo.UpRoundDate(@started_on,@interval,@frequency)< @ended_on 
										THEN dbo.UpRoundDate(@started_on,@interval,@frequency)
									ELSE @ended_on
								END				   
						ELSE @ended_on END AS ended_on_chunck

			UNION ALL

			SELECT id_chun + 1 AS id_chun,
				   CTE.ended_on_chunck AS started_on_chunck,
				   
				   CASE 
						WHEN dbo.AddIntervalToDate(@interval,@frequency,CTE.ended_on_chunck)<=@ended_on 
							THEN dbo.AddIntervalToDate(@interval,@frequency,CTE.ended_on_chunck)
						ELSE @ended_on
					END AS ended_on_chunck
			FROM CTE_RECURSIVE_DATES CTE
			WHERE (dbo.AddIntervalToDate(@interval,@frequency,CTE.ended_on_chunck)<=@ended_on 
					OR DATEADD(MILLISECOND, 2,CTE.ended_on_chunck)<= @ended_on)
					 AND @interval>0 AND @frequency>0
		)SELECT id_chun,
				started_on_chunck,
				ended_on_chunck
		FROM CTE_RECURSIVE_DATES
  ) ;
