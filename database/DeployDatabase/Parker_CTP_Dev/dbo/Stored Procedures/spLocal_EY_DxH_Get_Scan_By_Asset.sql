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
	DECLARE @site_id INT;

	SELECT @site_id = asset_id
	FROM dbo.Asset WHERE asset_code = (SELECT site_code FROM dbo.Asset WHERE asset_id = @asset_id);

	SET NOCOUNT ON;
        SELECT S.scan_id,
			   S.badge,
			   TFD.First_Name AS first_name,
			   TFD.Last_Name AS last_name,
               S.name, 
               S.asset_id, 
               CONVERT(VARCHAR, S.start_time, 20) as start_time, 
               CONVERT(VARCHAR, S.end_time, 20) as end_time, 
               CONVERT(VARCHAR, S.possible_end_time, 20) as possible_end_time,
			   DATEDIFF(minute, S.possible_end_time, end_time) as minutes,
               S.is_current_scan, 
               S.reason, 
               S.status,
			   CASE WHEN S.end_time IS NULL THEN NULL ELSE S.last_modified_by END as closed_by,
			   CASE WHEN S.end_time IS NULL THEN NULL ELSE CONCAT(TFD1.First_Name,' ',TFD1.Last_Name) END as closed_by_name
        FROM dbo.Scan S WITH(NOLOCK)
		INNER JOIN dbo.TFDUsers TFD ON S.badge = TFD.Badge AND TFD.Site = @site_id
		LEFT JOIN dbo.TFDUsers TFD1 ON S.last_modified_by = TFD1.Badge AND TFD1.Site = @site_id
        WHERE
			S.start_time < @end_time AND
			(S.end_time is NULL OR S.end_time > @start_time) AND
			S.asset_id = @asset_id
		ORDER BY S.entered_on, S.badge;
        RETURN;
    END;
