
/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_Digital_Cups]    Script Date: 27/1/2021 11:20:43 ******/

/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_Digital_Cups]    Script Date: 26/01/2021 11:31:05 ******/
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
-- exec spLocal_EY_DxH_Get_Digital_Cups '2021-01-27 10:00:00','2021-01-27 23:00:00', 225, 2, '2021-01-27 00:00:00.000'
--
CREATE   PROCEDURE [dbo].[spLocal_EY_DxH_Get_Digital_Cups]
@start_time       DATETIME, 
@end_time		  DATETIME, 
@asset_id         INT,
@aggregation	  INT,
@production_day   DATETIME
AS
    BEGIN
	SET NOCOUNT ON;
	SELECT
	CONVERT(VARCHAR, D.started_on_chunck, 20) AS start_time, 
	CONVERT(VARCHAR, D.ended_on_chunck, 20) AS end_time, 
	LOWER(CONCAT(FORMAT(D.started_on_chunck, 'htt'), ' - ', FORMAT(D.ended_on_chunck, 'htt'))) AS hour_interval,
	T.asset_id, 
	A.asset_code,
	DXH.dxhdata_id,
	DXH.production_day,
	DXH.operator_signoff,
	DXH.supervisor_signoff,
	SUM(PD.actual) OVER(PARTITION BY PD.dxhdata_id) AS actual, 
	SUM(PD.target) OVER(PARTITION BY PD.dxhdata_id) AS target
	FROM [dbo].[GetRangesBetweenDates] (@start_time, @end_time, 60, 1) D
	LEFT JOIN [dbo].[AssetsResolverFromId] (@asset_id, @aggregation) T ON @asset_id = T.requested_asset_id
	INNER JOIN dbo.Asset A ON T.asset_id = A.asset_id
		AND A.asset_level = 'Cell'
		AND A.status = 'Active'
	LEFT JOIN dbo.DxHData DXH ON DXH.asset_id = A.asset_Id
		AND DXH.production_day = @production_day
		AND CONCAT(FORMAT(D.started_on_chunck, 'htt'), ' - ', FORMAT(D.ended_on_chunck, 'htt')) = UPPER(DXH.hour_interval)
	LEFT JOIN dbo.ProductionData PD ON PD.dxhdata_id = DXH.dxhdata_id
	ORDER BY A.asset_code, D.started_on_chunck ASC
    RETURN;
    END;






