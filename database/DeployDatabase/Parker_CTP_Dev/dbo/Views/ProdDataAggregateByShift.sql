CREATE VIEW dbo.ProdDataAggregateByShift
AS
SELECT        dbo.DxHData.production_day, SUM(dbo.ProductionData.target) AS TargetPieces, SUM(dbo.ProductionData.actual) AS ActualPieces, dbo.DxHData.shift_code, CASE WHEN SUM(dbo.ProductionData.actual) 
                         < SUM(dbo.ProductionData.target) THEN 'Behind' ELSE 'Ahead' END AS Status
FROM            dbo.DxHData INNER JOIN
                         dbo.ProductionData ON dbo.DxHData.dxhdata_id = dbo.ProductionData.dxhdata_id
GROUP BY dbo.DxHData.production_day, dbo.DxHData.shift_code