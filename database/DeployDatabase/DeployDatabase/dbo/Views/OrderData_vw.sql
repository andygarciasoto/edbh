CREATE VIEW dbo.OrderData_vw
AS
SELECT        dbo.OrderData.order_id, dbo.OrderData.order_number, dbo.OrderData.product_code, dbo.OrderData.order_quantity, dbo.OrderData.UOM_code, dbo.OrderData.routed_cycle_time, dbo.OrderData.minutes_allowed_per_setup, 
                         dbo.OrderData.ideal, dbo.OrderData.target_percent_of_ideal, dbo.OrderData.production_status, dbo.OrderData.setup_start_time, dbo.OrderData.setup_end_time, dbo.OrderData.production_start_time, 
                         dbo.OrderData.production_end_time, dbo.OrderData.start_time, dbo.OrderData.end_time, dbo.OrderData.is_current_order, dbo.OrderData.entered_by, dbo.OrderData.entered_on, dbo.OrderData.last_modified_by, 
                         dbo.OrderData.last_modified_on, dbo.OrderData.asset_id, dbo.Asset.site_code
FROM            dbo.OrderData INNER JOIN
                         dbo.Asset ON dbo.OrderData.asset_id = dbo.Asset.asset_id AND dbo.OrderData.asset_id = dbo.Asset.asset_id INNER JOIN
                         dbo.parker_site_access ON dbo.Asset.site_code = dbo.parker_site_access.site_code AND dbo.parker_site_access.ad_account = USER

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
         Top = 0
         Left = 0
      End
      Begin Tables = 
         Begin Table = "OrderData (dbo)"
            Begin Extent = 
               Top = 6
               Left = 38
               Bottom = 136
               Right = 272
            End
            DisplayFlags = 280
            TopColumn = 18
         End
         Begin Table = "Asset (dbo)"
            Begin Extent = 
               Top = 104
               Left = 398
               Bottom = 234
               Right = 609
            End
            DisplayFlags = 280
            TopColumn = 4
         End
         Begin Table = "parker_site_access (dbo)"
            Begin Extent = 
               Top = 215
               Left = 723
               Bottom = 311
               Right = 893
            End
            DisplayFlags = 280
            TopColumn = 0
         End
      End
   End
   Begin SQLPane = 
   End
   Begin DataPane = 
      Begin ParameterDefaults = ""
      End
      Begin ColumnWidths = 9
         Width = 284
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
      End
   End
   Begin CriteriaPane = 
      Begin ColumnWidths = 11
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
', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'OrderData_vw';


GO
EXECUTE sp_addextendedproperty @name = N'MS_DiagramPaneCount', @value = 1, @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'OrderData_vw';

