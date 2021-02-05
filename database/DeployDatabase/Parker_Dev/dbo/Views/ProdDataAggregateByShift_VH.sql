CREATE VIEW dbo.ProdDataAggregateByShift_VH
AS
SELECT        dbo.DxHData.production_day, SUM(dbo.ProductionData.target) AS TargetPieces, SUM(dbo.ProductionData.actual) AS ActualPieces, dbo.DxHData.shift_code, CASE WHEN SUM(dbo.ProductionData.actual) 
                         < SUM(dbo.ProductionData.target) THEN 'Behind' ELSE 'Ahead' END AS Status, dbo.Asset.asset_code, dbo.Asset.site_code
FROM            dbo.DxHData INNER JOIN
                         dbo.ProductionData ON dbo.DxHData.dxhdata_id = dbo.ProductionData.dxhdata_id INNER JOIN
                         dbo.Asset ON dbo.DxHData.asset_id = dbo.Asset.asset_id
GROUP BY dbo.DxHData.asset_code, dbo.DxHData.production_day, dbo.DxHData.shift_code, dbo.DxHData.hour_interval, dbo.DxHData.asset_id, dbo.Asset.asset_code, dbo.Asset.site_code
HAVING        (dbo.Asset.site_code IN ('Veniano_Hose', 'Veniano_HA'))

GO
EXECUTE sp_addextendedproperty @name = N'MS_DiagramPane1', @value = N'[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00]
Begin DesignProperties = 
   Begin PaneConfigurations = 
      Begin PaneConfiguration = 0
         NumPanes = 4
         Configuration = "(H (1[40] 4[20] 2[20] 3) )"
      End
      Begin PaneConfiguration = 1
         NumPanes = 3
         Configuration = "(H (1 [50] 4 [25] 3))"
      End
      Begin PaneConfiguration = 2
         NumPanes = 3
         Configuration = "(H (1 [50] 2 [25] 3))"
      End
      Begin PaneConfiguration = 3
         NumPanes = 3
         Configuration = "(H (4 [30] 2 [40] 3))"
      End
      Begin PaneConfiguration = 4
         NumPanes = 2
         Configuration = "(H (1 [56] 3))"
      End
      Begin PaneConfiguration = 5
         NumPanes = 2
         Configuration = "(H (2 [66] 3))"
      End
      Begin PaneConfiguration = 6
         NumPanes = 2
         Configuration = "(H (4 [50] 3))"
      End
      Begin PaneConfiguration = 7
         NumPanes = 1
         Configuration = "(V (3))"
      End
      Begin PaneConfiguration = 8
         NumPanes = 3
         Configuration = "(H (1[56] 4[18] 2) )"
      End
      Begin PaneConfiguration = 9
         NumPanes = 2
         Configuration = "(H (1 [75] 4))"
      End
      Begin PaneConfiguration = 10
         NumPanes = 2
         Configuration = "(H (1[66] 2) )"
      End
      Begin PaneConfiguration = 11
         NumPanes = 2
         Configuration = "(H (4 [60] 2))"
      End
      Begin PaneConfiguration = 12
         NumPanes = 1
         Configuration = "(H (1) )"
      End
      Begin PaneConfiguration = 13
         NumPanes = 1
         Configuration = "(V (4))"
      End
      Begin PaneConfiguration = 14
         NumPanes = 1
         Configuration = "(V (2))"
      End
      ActivePaneConfig = 0
   End
   Begin DiagramPane = 
      Begin Origin = 
         Top = -192
         Left = 0
      End
      Begin Tables = 
         Begin Table = "DxHData (dbo)"
            Begin Extent = 
               Top = 6
               Left = 38
               Bottom = 136
               Right = 301
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "ProductionData (dbo)"
            Begin Extent = 
               Top = 138
               Left = 38
               Bottom = 268
               Right = 240
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "Asset (dbo)"
            Begin Extent = 
               Top = 270
               Left = 38
               Bottom = 400
               Right = 255
            End
            DisplayFlags = 280
            TopColumn = 4
         End
      End
   End
   Begin SQLPane = 
   End
   Begin DataPane = 
      Begin ParameterDefaults = ""
      End
   End
   Begin CriteriaPane = 
      Begin ColumnWidths = 12
         Column = 1440
         Alias = 900
         Table = 1170
         Output = 720
         Append = 1400
         NewValue = 1170
         SortType = 1350
         SortOrder = 1410
         GroupBy = 1350
         Filter = 1350
         Or = 1350
         Or = 1350
         Or = 1350
      End
   End
End
', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'ProdDataAggregateByShift_VH';


GO
EXECUTE sp_addextendedproperty @name = N'MS_DiagramPaneCount', @value = 1, @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'ProdDataAggregateByShift_VH';

