


--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_User_Information
--
--  Purpose:

--	Given a badge and other optional data, return the existing information of the user from TFDUser, CommonParameters, Shift and GlobalParameters tables
--
--	This code could be used to get the all the information of the user.
--
--	To Do:
--
--  Output Parameters:
---
--  Input Parameters:
--- None
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
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20210122		C00V00 - Intial code create
--		
-- Example Call:
--  EXEC [dbo].[spLocal_EY_DxH_Get_User_Information] 'Administratoreaton', '0', 0, 1 --Search by badge and site
--  EXEC [dbo].[spLocal_EY_DxH_Get_User_Information] '47132', '0', 40, 0 --Search by badge and asset_id
--  EXEC [dbo].[spLocal_EY_DxH_Get_User_Information] '47132', 'CR2080435W1', 0, 0 --Search by badge and station
--  EXEC [dbo].[spLocal_EY_DxH_Get_User_Information] '47132', '0', 0, 0 --Search by badge
--

CREATE   PROCEDURE [dbo].[spLocal_EY_DxH_Get_User_Information] (
	@badge AS NVARCHAR(100),
	@machine AS VARCHAR(100),
	@asset_id AS INT,
	@site_id AS INT
)
AS
BEGIN

	DECLARE
		@site				INT,
		@site_code			VARCHAR(100),
		@asset_level		VARCHAR(100) = 'Site',
		@vert_sf_name		VARCHAR(100) = 'Vertical',
		@vert_sf_status		VARCHAR(100) = 'Inactive';

	IF ISNULL(@site_id,0) != 0
	BEGIN
		SELECT 
			@site = asset_id,
			@site_code = asset_code
		FROM dbo.Asset
		WHERE asset_id = @site_id;
	END
	ELSE IF ISNULL(@asset_id,0) != 0
	BEGIN
		SELECT 
			@site = asset_id,
			@site_code = asset_code
		FROM dbo.Asset
		WHERE asset_level = @asset_level AND asset_code = (SELECT site_code FROM dbo.Asset WHERE asset_id = @asset_id);
	END
	ELSE IF ISNULL(@machine, '0') != '0'
	BEGIN
		SELECT
			@site = asset_id, 
			@site_code = site_code
		FROM dbo.Asset 
		WHERE asset_code IN 
			(SELECT site_code FROM DBO.Asset WHERE asset_id IN 
				(SELECT asset_id FROM DBO.AssetDisplaySystem WHERE displaysystem_name like CONCAT(@machine,'%'))
			);
	END
	ELSE
	BEGIN
		SELECT TOP 1 
			@site = site 
		FROM dbo.TFDUsers 
		WHERE badge = @badge;
		SELECT
			@site_code = asset_code
		FROM dbo.Asset where asset_id = @site;
	END

	SELECT
		TFDU.ID AS id,
		TFDU.Badge AS badge,
		TFDU.Username AS username,
		TFDU.First_Name AS first_name,
		TFDU.Last_Name AS last_name,
		R.name AS role,
		TFDU.role_id as role_id,
		E.escalation_name as escalation_name,
		E.escalation_level as escalation_level,
		E.escalation_hours as escalation_hours,
		E.escalation_group as escalation_group,
		TFDU.Site AS site,
		@site_code AS site_code,
		CP.site_name,
		T.ui_timezone AS timezone,
		CP.language,
		CP.break_minutes,
		CP.lunch_minutes,
		CP.site_prefix,
		FORMAT(GSPFunction.ProductionDay,'yyyy-MM-dd HH:mm') AS date_of_shift,
		GSPFunction.ShiftId AS shift_id,
		GSPFunction.ShiftName AS shift_name,
		FORMAT(GSPFunction.CurrentDateTime,'yyyy-MM-dd HH:mm') AS current_date_time,
		GP.summary_timeout,
		GP.inactive_timeout_minutes,
		GP.socket_timeout,
		GP.max_regression,
		GP.token_expiration,	
		SF.shift_id AS vertical_shift_id
		FROM [dbo].[GetShiftProductionDayFromSiteAndDate](@site, NULL) AS GSPFunction
		INNER JOIN dbo.TFDUsers AS TFDU
			ON TFDU.Site = @site AND TFDU.Badge = @badge
		INNER JOIN dbo.Role AS R
			ON TFDU.role_id = R.role_id
		INNER JOIN dbo.CommonParameters AS CP
			ON CP.site_id = @site
		INNER JOIN dbo.Timezone AS T
			ON T.timezone_id = CP.timezone_id
		LEFT JOIN dbo.Shift AS SF
			ON SF.asset_id = @site AND SF.status = @vert_sf_status AND SF.shift_name = @vert_sf_name
		LEFT JOIN dbo.GlobalParameters AS GP
			ON 1 = 1
		LEFT JOIN dbo.Escalation AS E
			ON TFDU.escalation_id = E.escalation_id;

END
