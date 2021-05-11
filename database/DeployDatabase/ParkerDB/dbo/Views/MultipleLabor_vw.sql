


CREATE   VIEW [dbo].[MultipleLabor_vw]
AS

WITH CTE1 AS (

SELECT  
				DISTINCT (S.Badge), DATEADD(HOUR, DATEDIFF(HOUR, 0, S.start_time), 0) as start_time,
				SUM(CASE WHEN S.start_time > DATEADD(HOUR, DATEDIFF(HOUR, 0, S.start_time), 0) AND S.start_time < DATEADD(HOUR, 1, DATEADD(HOUR, DATEDIFF(HOUR, 0, S.start_time), 0)) THEN 1 ELSE 0 END) as people,
				S.asset_id
FROM			dbo.Scan S
WHERE			S.reason = 'Check-In'
GROUP BY		DATEADD(HOUR, DATEDIFF(HOUR, 0, S.start_time), 0), S.asset_id, S.Badge)

SELECT			DxH.dxhdata_id, DATEADD(HOUR, DATEDIFF(HOUR, 0, PD.start_time), 0) as start_time,
				DATEADD(HOUR, 1, DATEADD(HOUR, DATEDIFF(HOUR, 0, PD.start_time), 0)) as end_time, DxH.production_day, 
				DxH.hour_interval, PD.product_code, PD.ideal, PD.target, PD.actual, PD.actual/CTE1.people as units_per_labor_hour, 
				PD.order_id, PD.order_number, DxH.asset_id, A.asset_code, A.asset_name, A.site_code, CTE1.people
FROM            dbo.DxHData DxH INNER JOIN 
				dbo.ProductionData PD ON DxH.dxhdata_id = PD.dxhdata_id INNER JOIN 
				dbo.Asset A ON DxH.asset_id = A.asset_id INNER JOIN
				CTE1 ON CTE1.start_time = DATEADD(HOUR, DATEDIFF(HOUR, 0, PD.start_time), 0) AND CTE1.asset_id = DxH.asset_id AND CTE1.people > 0 INNER JOIN
                dbo.parker_site_access ON A.site_code = dbo.parker_site_access.site_code AND dbo.parker_site_access.ad_account = USER
