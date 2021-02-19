-- exec [dbo].[spLocal_EY_DxH_Get_Sites_By_User] N'텍스트'

 CREATE   PROCEDURE [dbo].[spLocal_EY_DxH_Get_Sites_By_User] (@badge as NVARCHAR(100))

 AS  BEGIN 

SELECT 
--Asset columns
[asset_id], [asset_code], [asset_name], [asset_description], [asset_level], [site_code], [parent_asset_code], [value_stream], [automation_level], 
[include_in_escalation], [grouping1], [grouping2], [grouping3], [grouping4], [grouping5], [status], [entered_by], [entered_on], [last_modified_by], 
[last_modified_on],
--User columns
[Badge], [Username], [First_Name], [Last_Name], [Role], [role_id], [Site], [ID] as id
FROM [dbo].[Asset] JOIN [dbo].[TFDUsers] ON [Asset].[asset_id] = [TFDUsers].[Site] WHERE [TFDUsers].[Badge] = @badge


END
