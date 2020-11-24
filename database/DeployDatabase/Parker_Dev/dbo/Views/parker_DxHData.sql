﻿CREATE VIEW dbo.parker_DxHData
AS
SELECT        dbo.DxHData.dxhdata_id, dbo.DxHData.asset_code, dbo.DxHData.production_day, dbo.DxHData.hour_interval, dbo.DxHData.shift_code, dbo.DxHData.summary_product_code, dbo.DxHData.summary_ideal, 
                         dbo.DxHData.summary_target, dbo.DxHData.summary_actual, dbo.DxHData.summary_UOM_code, dbo.DxHData.summary_order_number, dbo.DxHData.summary_dtminutes, dbo.DxHData.summary_dtreason_code, 
                         dbo.DxHData.summary_comments, dbo.DxHData.summary_action_taken, dbo.DxHData.operator_signoff, dbo.DxHData.operator_signoff_timestamp, dbo.DxHData.supervisor_signoff, 
                         dbo.DxHData.supervisor_signoff_timestamp, dbo.DxHData.entered_by, dbo.DxHData.entered_on, dbo.DxHData.last_modified_by, dbo.DxHData.last_modified_on, dbo.DxHData.start_time, dbo.DxHData.end_time, 
                         dbo.DxHData.asset_id, dbo.Asset.site_code
FROM            dbo.DxHData INNER JOIN
                         dbo.Asset ON dbo.DxHData.asset_id = dbo.Asset.asset_id INNER JOIN
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
         Begin Table = "DxHData (dbo)"
            Begin Extent = 
               Top = 6
               Left = 38
               Bottom = 136
               Right = 285
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "Asset (dbo)"
            Begin Extent = 
               Top = 6
               Left = 323
               Bottom = 136
               Right = 534
            End
            DisplayFlags = 280
            TopColumn = 4
         End
         Begin Table = "parker_site_access (dbo)"
            Begin Extent = 
               Top = 5
               Left = 585
               Bottom = 101
               Right = 755
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
      Begin ColumnWidths = 29
         Width = 284
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
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
 ', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'parker_DxHData';


GO
EXECUTE sp_addextendedproperty @name = N'MS_DiagramPane2', @value = N'        Append = 1400
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
', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'parker_DxHData';


GO
EXECUTE sp_addextendedproperty @name = N'MS_DiagramPaneCount', @value = 2, @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'parker_DxHData';

