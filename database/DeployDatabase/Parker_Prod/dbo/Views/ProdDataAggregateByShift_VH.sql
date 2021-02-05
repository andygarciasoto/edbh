CREATE VIEW [dbo].[ProdDataAggregateByShift_VH]
AS
SELECT        dbo.DxHData.production_day, SUM(dbo.ProductionData.target) AS TargetPieces, SUM(dbo.ProductionData.actual) AS ActualPieces, dbo.DxHData.shift_code, CASE WHEN SUM(dbo.ProductionData.actual) 
                         < SUM(dbo.ProductionData.target) THEN 'Behind' ELSE 'Ahead' END AS Status, dbo.Asset.asset_code, dbo.Asset.site_code
FROM            dbo.DxHData INNER JOIN
                         dbo.ProductionData ON dbo.DxHData.dxhdata_id = dbo.ProductionData.dxhdata_id INNER JOIN
                         dbo.Asset ON dbo.DxHData.asset_id = dbo.Asset.asset_id
GROUP BY dbo.DxHData.asset_code, dbo.DxHData.production_day, dbo.DxHData.shift_code, dbo.DxHData.hour_interval, dbo.DxHData.asset_id, dbo.Asset.asset_code, dbo.Asset.site_code
HAVING        (dbo.Asset.site_code IN ('Veniano_Hose', 'Veniano_HA'))
