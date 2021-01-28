/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_Scan_By_Asset]    Script Date: 26/01/2021 11:31:05 ******/
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
-- exec spLocal_EY_DxH_Get_Scan_By_Asset '2021-01-27 10:00:00','2021-01-27 11:00:00', 230
--
CREATE   PROCEDURE [dbo].[spLocal_EY_DxH_Get_Scan_By_Asset]
@start_time       DATETIME, 
@end_time		  DATETIME, 
@asset_id         INT				
AS
    BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
        SELECT scan_id,
			   badge,
               name, 
               asset_id, 
               CONVERT(VARCHAR, start_time, 20) as start_time, 
               CONVERT(VARCHAR, end_time, 20) as end_time, 
               CONVERT(VARCHAR, possible_end_time, 20) as possible_end_time,
			   DATEDIFF(minute, possible_end_time, end_time) as minutes,
               is_current_scan, 
               reason, 
               status
        FROM dbo.Scan WITH(NOLOCK)
        WHERE start_time < @end_time 
		AND
		(end_time is NULL OR end_time > @start_time)
		ORDER BY badge, entered_on;
        RETURN;
    END;