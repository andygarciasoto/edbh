
--
-- Copyright © 2020 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_DTData_By_DxHData_Id
--
--  Purpose:

--	Given an dxhdata_id, provide the info for displaying CommentData
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
--	20200114		C00V00 - Intial code created
--		
-- Example Call:
-- exec spLocal_EY_DxH_Get_CommentData_By_DxHData_Id 324042
--
CREATE    PROCEDURE [dbo].[spLocal_EY_DxH_Get_CommentData_By_DxHData_Id]
--Declare
	@DxHData_id			INT,
	@Site_Id			INT
AS

BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;
	DECLARE
		@timezone	NVARCHAR(100);

	SELECT
		@timezone = CP.site_timezone
	FROM dbo.CommonParameters CP
	WHERE CP.site_id = @Site_Id;

	SELECT
			CD.commentdata_id,
			CD.dxhdata_id,
			CD.comment,
			CD.first_name,
			CD.last_name,
			CONVERT(NVARCHAR(19), CD.last_modified_on AT TIME ZONE 'UTC' AT TIME ZONE @timezone, 20) AS last_modified_on
		FROM dbo.CommentData CD WHERE CD.dxhdata_id = @DxHData_id;

END
