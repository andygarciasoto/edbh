/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_Components_By_Role]    Script Date: 1/2/2021 08:30:51 ******/

/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_Components_By_Role]    Script Date: 26/01/2021 11:31:05 ******/
--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_Components_By_Role
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
-- Example Call:
-- exec spLocal_EY_DxH_Get_Components_By_Role 1
--
CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Get_Components_By_Role]
@role_id	INT			
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
        SELECT R.name as role,
		R.default_view,
		C.name as component_name,
		RC.can_read,
		RC.can_write
        FROM dbo.RoleComponent RC WITH(NOLOCK)
		INNER JOIN Role R ON RC.role_id = R.role_id AND R.status = 'Active'
		INNER JOIN Component C ON RC.component_id = C.component_id AND C.status = 'Active'
        WHERE RC.role_id = @role_id
		ORDER BY R.name;
        RETURN;
    END;
