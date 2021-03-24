CREATE VIEW dbo.[CommentData_vw]
AS
SELECT        dbo.CommentData.commentdata_id, dbo.CommentData.dxhdata_id, dbo.CommentData.comment, dbo.CommentData.first_name, dbo.CommentData.last_name, dbo.CommentData.entered_by, dbo.CommentData.entered_on, 
                         dbo.CommentData.last_modified_by, dbo.CommentData.last_modified_on, dbo.Asset.asset_id, dbo.Asset.site_code
FROM            dbo.CommentData INNER JOIN
                         dbo.DxHData ON dbo.CommentData.dxhdata_id = dbo.DxHData.dxhdata_id INNER JOIN
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
         Begin Table = "CommentData (dbo)"
            Begin Extent = 
               Top = 6
               Left = 38
               Bottom = 136
               Right = 217
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "DxHData (dbo)"
            Begin Extent = 
               Top = 78
               Left = 302
               Bottom = 208
               Right = 549
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "Asset (dbo)"
            Begin Extent = 
               Top = 191
               Left = 617
               Bottom = 321
               Right = 828
            End
            DisplayFlags = 280
            TopColumn = 2
         End
         Begin Table = "parker_site_access (dbo)"
            Begin Extent = 
               Top = 265
               Left = 971
               Bottom = 361
               Right = 1141
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
      Begin ColumnWidths = 12
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
         Gro', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'CommentData_vw';


GO
EXECUTE sp_addextendedproperty @name = N'MS_DiagramPane2', @value = N'upBy = 1350
         Filter = 1350
         Or = 1350
         Or = 1350
         Or = 1350
      End
   End
End
', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'CommentData_vw';


GO
EXECUTE sp_addextendedproperty @name = N'MS_DiagramPaneCount', @value = 2, @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'VIEW', @level1name = N'CommentData_vw';

