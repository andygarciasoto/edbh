/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_Sites_By_User]    Script Date: 26/01/2021 11:31:05 ******/
--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_Sites_By_User
--
--  Purpose:
--	Provide Asset info for displays
--
--	To Do:
--
--  Output Parameters:
---
--  Input Parameters:
---
---	
--  Trigger:
---
--  Data Read Other Inputs:  
--- 
---	
--  Data Written Results:
---
--  Assumptions:
--- 
--  Dependencies: 
---	None
---
--  Variables:
---
---
--  Tables Modified:
--	
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20190724		C00V00 - Intial code created		
--
-- Example Call:
-- exec [dbo].[spLocal_EY_DxH_Get_Sites_By_User] N'텍스트'

 CREATE   PROCEDURE [dbo].[spLocal_EY_DxH_Get_Sites_By_User] (@badge as NVARCHAR(100))

 AS  BEGIN 

SELECT 
--Asset columns
A.[asset_id], A.[asset_code], A.[asset_name], A.[asset_description], A.[asset_level], A.[site_code], A.[parent_asset_code], A.[value_stream], A.[automation_level], 
A.[include_in_escalation], A.[grouping1], A.[grouping2], A.[grouping3], A.[grouping4], A.[grouping5], A.[status], A.[entered_by], A.[entered_on], A.[last_modified_by], 
A.[last_modified_on],
--User columns
TFD.[Badge], TFD.[Username], TFD.[First_Name], TFD.[Last_Name], TFD.[Role], TFD.[role_id], TFD.[Site], TFD.[ID] as id
FROM [dbo].[Asset] AS A JOIN [dbo].[TFDUsers] AS TFD ON A.[asset_id] = TFD.[Site] WHERE TFD.[Badge] = @badge


END
