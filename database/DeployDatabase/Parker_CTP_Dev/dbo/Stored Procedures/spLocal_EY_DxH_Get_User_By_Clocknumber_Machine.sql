


--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_User_By_Clocknumber_Machine
--
--  Purpose:

--	Given an asset and a timestamp, return the existing dxhdata_id, production_day, hour_interval, and shift_code 
--	or create a new one and return that same info.
--
--	This code could be used as part of the start of the new hour process but ... it would need to have an open order 
--	to allow creating a row. So... using RequireAnOrderToCreate
--			Send 1 if this is called as as part of the start of the new hour process
--			Send 0 if you have some data like productiondata, comment, or possibly timelost
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
--	Possibly DxHData
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20190807		C00V00 - Intial code create
--	20210106		C00V01 - Add new logic to get the production day and the shift code using GetShiftProductionDayFromSiteAndDate Function
--		
-- Example Call:
--  EXEC [dbo].[spLocal_EY_DxH_Get_User_By_Clocknumber_Machine] '2291', '0'
--

CREATE   PROCEDURE [dbo].[spLocal_EY_DxH_Get_User_By_Clocknumber_Machine] (@badge as VARCHAR(100), @machine as VARCHAR(100))
  AS  BEGIN 
DECLARE
	@site				INT,
	@name				VARCHAR(100),
	@timezone			VARCHAR(100),
	@CurrentDateTime	DATETIME,
	@DateOfShift		DATETIME,
	@Shift_Name			VARCHAR(100),
	@Shift_Id			INT,
	@language			VARCHAR(100),
	@summary_timeout	FLOAT,
	@inactive_timeout_minutes FLOAT,
	@socket_timeout		FLOAT,
	@max_regression		FLOAT,
	@token_expiration	FLOAT,
	@vertical_shift_id	INT,
	@break_minutes		FLOAT,
	@lunch_minutes		FLOAT;

IF @machine = '0'
BEGIN
	SELECT TOP 1 
		@site = site 
	FROM dbo.TFDUsers 
	WHERE badge = @badge
	
	SELECT TOP 1 
		@name = asset_code 
	FROM dbo.Asset where asset_id = @site
END
ELSE
BEGIN
	SELECT @site = asset_id, 
		@name = site_code
	FROM DBO.Asset 
	WHERE asset_code IN 
		(SELECT site_code FROM DBO.Asset WHERE asset_id IN 
		(SELECT asset_id FROM DBO.AssetDisplaySystem WHERE displaysystem_name like CONCAT(@machine,'%')));
END

SELECT 
	@timezone = ui_timezone,
	@language = language,
	@break_minutes = break_minutes,
	@lunch_minutes = lunch_minutes
FROM dbo.CommonParameters WHERE site_id = @site;

-- New Logic to get production day and shift code
	SELECT
		@DateOfShift = ProductionDay,
		@Shift_Id = ShiftId,
		@Shift_Name = ShiftName,
		@CurrentDateTime = CurrentDateTime
	FROM [dbo].[GetShiftProductionDayFromSiteAndDate](@site, NULL);

SELECT
@summary_timeout = summary_timeout,
@inactive_timeout_minutes = inactive_timeout_minutes,
@socket_timeout = socket_timeout,
@max_regression = max_regression,
@token_expiration = token_expiration
FROM dbo.GlobalParameters;

SELECT
@vertical_shift_id = shift_id
FROM dbo.Shift WHERE asset_id = @site
AND status = 'Inactive' AND shift_name = 'Vertical';


SELECT ID as id, badge, username, first_name, last_name, role, site, @name as site_name, @timezone as timezone, @Shift_Id as shift_id, @Shift_Name as shift_name, 
FORMAT(@DateOfShift,'yyyy-MM-dd HH:mm') AS date_of_shift, FORMAT(@CurrentDateTime,'yyyy-MM-dd HH:mm') AS current_date_time, @language as language, @break_minutes as 
break_minutes, @lunch_minutes as lunch_minutes, @summary_timeout as summary_timeout, @inactive_timeout_minutes as inactive_timeout_minutes, @socket_timeout as socket_timeout, 
@max_regression as max_regression, @token_expiration as token_expiration, @vertical_shift_id as vertical_shift_id
FROM dbo.TFDUsers where badge = @badge AND Site = @site


END
