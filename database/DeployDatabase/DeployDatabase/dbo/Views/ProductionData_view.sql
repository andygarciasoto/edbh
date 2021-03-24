CREATE VIEW [dbo].[ProductionData_view]
AS
SELECT        dbo.DxHData.production_day, dbo.DxHData.hour_interval, SUM(dbo.ProductionData.ideal) AS [Total Ideal], SUM(dbo.ProductionData.target) AS [Total target], SUM(dbo.ProductionData.actual) AS [Total Actual], 
                         dbo.Asset.asset_name, dbo.Asset.site_code, dbo.Asset.asset_id, dbo.Asset.asset_code, COUNT(dbo.ProductionData.order_id) AS OrderCount, dbo.ProductionData.order_number
FROM            dbo.DxHData INNER JOIN
                         dbo.ProductionData ON dbo.DxHData.dxhdata_id = dbo.ProductionData.dxhdata_id INNER JOIN
                         dbo.Asset ON dbo.DxHData.asset_id = dbo.Asset.asset_id
GROUP BY dbo.DxHData.production_day, dbo.DxHData.hour_interval, dbo.Asset.asset_name, dbo.Asset.site_code, dbo.Asset.asset_id, dbo.Asset.asset_code, dbo.ProductionData.order_number
