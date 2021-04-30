/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_Labor_Hours]    Script Date: 28/01/2021 13:43:05 ******/
--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_Asset
--
--  Purpose:
--	Provide Asset info for displays
--
--	To Do:
--
--  Output Parameters:
---
--  Input Parameters:
---
---	
--  Trigger:
---
--  Data Read Other Inputs:  
--- 
---	
--  Data Written Results:
---
--  Assumptions:
--- 
--  Dependencies: 
---	None
---
--  Variables:
---
---
--  Tables Modified:
--	
---
-- Modification Change History:
--------------------------------------------------------------------------------	
-- Example Call:
-- exec spLocal_EY_DxH_Get_Labor_Hours '2021-01-28 10:35:00','2021-01-28 13:19:00', 230
--
CREATE     PROCEDURE [dbo].[spLocal_EY_DxH_Get_Labor_Hours]
@start_time       DATETIME, 
@end_time		  DATETIME, 
@asset_id         INT				
AS
    BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
        SELECT
			   A.site_code as site_code,
			   A.asset_code as asset_code,
			   A.asset_name as asset_name,
			   @start_time as from_datetime,
			   @end_time as to_datetime,
			   CAST(SUM(DATEDIFF(hour, @start_time, @end_time)) AS DECIMAL(10,2)) as total_hours,
			   COUNT(DISTINCT S.badge) as active_operators,
			   SUM(DATEDIFF(hour, S.start_time, S.end_time)) as total_labor_in_hours,
			   SUM(DATEDIFF(minute, S.start_time, S.end_time)) as total_labor_in_minutes,
			   SUM(DATEDIFF(second, S.start_time, S.end_time)) as total_labor_in_seconds			   
        FROM dbo.Scan S WITH(NOLOCK)
		INNER JOIN dbo.Asset A ON @asset_id = A.asset_id
        WHERE S.start_time < @end_time 
		AND
		(S.end_time is NULL OR S.end_time > @start_time)
		AND
		S.status = 'Active'
		GROUP BY site_code, asset_code, asset_name
        RETURN;
    END;
