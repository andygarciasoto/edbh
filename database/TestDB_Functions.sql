/****** Object:  UserDefinedFunction [dbo].[GetRangesBetweenDates]    Script Date: 20/2/2020 11:34:54 ******/
DROP FUNCTION [dbo].[GetRangesBetweenDates]
GO
/****** Object:  UserDefinedFunction [dbo].[UpRoundDate]    Script Date: 20/2/2020 11:34:54 ******/
DROP FUNCTION [dbo].[UpRoundDate]
GO
/****** Object:  UserDefinedFunction [dbo].[fn_diagramobjects]    Script Date: 20/2/2020 11:34:54 ******/
DROP FUNCTION [dbo].[fn_diagramobjects]
GO
/****** Object:  UserDefinedFunction [dbo].[AddIntervalToDate]    Script Date: 20/2/2020 11:34:54 ******/
DROP FUNCTION [dbo].[AddIntervalToDate]
GO
/****** Object:  UserDefinedFunction [dbo].[AddIntervalToDate]    Script Date: 20/2/2020 11:34:54 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
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
GO
/****** Object:  UserDefinedFunction [dbo].[fn_diagramobjects]    Script Date: 20/2/2020 11:34:54 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

	CREATE FUNCTION [dbo].[fn_diagramobjects]() 
	RETURNS int
	WITH EXECUTE AS N'dbo'
	AS
	BEGIN
		declare @id_upgraddiagrams		int
		declare @id_sysdiagrams			int
		declare @id_helpdiagrams		int
		declare @id_helpdiagramdefinition	int
		declare @id_creatediagram	int
		declare @id_renamediagram	int
		declare @id_alterdiagram 	int 
		declare @id_dropdiagram		int
		declare @InstalledObjects	int

		select @InstalledObjects = 0

		select 	@id_upgraddiagrams = object_id(N'dbo.sp_upgraddiagrams'),
			@id_sysdiagrams = object_id(N'dbo.sysdiagrams'),
			@id_helpdiagrams = object_id(N'dbo.sp_helpdiagrams'),
			@id_helpdiagramdefinition = object_id(N'dbo.sp_helpdiagramdefinition'),
			@id_creatediagram = object_id(N'dbo.sp_creatediagram'),
			@id_renamediagram = object_id(N'dbo.sp_renamediagram'),
			@id_alterdiagram = object_id(N'dbo.sp_alterdiagram'), 
			@id_dropdiagram = object_id(N'dbo.sp_dropdiagram')

		if @id_upgraddiagrams is not null
			select @InstalledObjects = @InstalledObjects + 1
		if @id_sysdiagrams is not null
			select @InstalledObjects = @InstalledObjects + 2
		if @id_helpdiagrams is not null
			select @InstalledObjects = @InstalledObjects + 4
		if @id_helpdiagramdefinition is not null
			select @InstalledObjects = @InstalledObjects + 8
		if @id_creatediagram is not null
			select @InstalledObjects = @InstalledObjects + 16
		if @id_renamediagram is not null
			select @InstalledObjects = @InstalledObjects + 32
		if @id_alterdiagram  is not null
			select @InstalledObjects = @InstalledObjects + 64
		if @id_dropdiagram is not null
			select @InstalledObjects = @InstalledObjects + 128
		
		return @InstalledObjects 
	END
	
GO
/****** Object:  UserDefinedFunction [dbo].[UpRoundDate]    Script Date: 20/2/2020 11:34:54 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
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
GO
/****** Object:  UserDefinedFunction [dbo].[GetRangesBetweenDates]    Script Date: 20/2/2020 11:34:54 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
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
GO
