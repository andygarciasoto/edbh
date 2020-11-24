
-- exec [dbo].[spLocal_EY_DxH_Get_Users_By_Badge] 'Manhattan1'

 CREATE   PROCEDURE [dbo].[spLocal_EY_DxH_Get_Users_By_Badge] (@badge as NVARCHAR(100))

 AS  BEGIN 
 DECLARE
 @json_out							nVarchar(max)


IF EXISTS (SELECT * FROM [dbo].[Asset] JOIN [dbo].[TFDUsers] ON [Asset].[asset_id] = [TFDUsers].[Site] WHERE [TFDUsers].[Badge] = @badge)
BEGIN
SET @json_out = (SELECT 
--Asset columns
[asset_id], [asset_code], [asset_name], [asset_description], [asset_level], [site_code], [parent_asset_code], [value_stream], [automation_level], 
[include_in_escalation], [grouping1], [grouping2], [grouping3], [grouping4], [grouping5], [status], [entered_by], [entered_on], [last_modified_by], 
[last_modified_on],
--User columns
[Badge], [Username], [First_Name], [Last_Name], [Role], [Site], [ID] as id
FROM [dbo].[Asset] JOIN [dbo].[TFDUsers] ON [Asset].[asset_id] = [TFDUsers].[Site] WHERE [TFDUsers].[Badge] = @badge for JSON AUTO, INCLUDE_NULL_VALUES)
END

SELECT @json_out as 'GetUsersByBadge'
END