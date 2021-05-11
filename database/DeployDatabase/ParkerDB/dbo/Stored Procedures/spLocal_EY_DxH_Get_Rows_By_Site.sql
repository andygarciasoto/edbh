/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_Rows_By_Site]    Script Date: 26/01/2021 11:31:05 ******/
--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_Rows_By_Site
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
-- exec spLocal_EY_DxH_Get_Rows_By_Site 1
--
CREATE   PROCEDURE [dbo].[spLocal_EY_DxH_Get_Rows_By_Site]
@site_id	INT
AS
    BEGIN
	

SELECT COUNT(*) AS Assets, TFD.Users, S.Shifts, CP.CommonParameters, DT.DTReasons,
T.Tags, W.Workcells, AD.AssetDisplaySystems, U.Unavailable, UOM.UOM
FROM dbo.Asset A
	INNER JOIN dbo.Asset A2 ON A.site_code = A2.asset_code
	OUTER APPLY
	(
		SELECT COUNT(*) AS Users
		FROM dbo.TFDUsers TFD
		WHERE TFD.Site = @site_id
	) TFD
	OUTER APPLY
	(
		SELECT COUNT(*) AS Shifts
		FROM dbo.Shift S
		WHERE S.asset_id = @site_id
	) S
	OUTER APPLY
	(
		SELECT COUNT(*) AS CommonParameters
		FROM dbo.CommonParameters CP
		WHERE CP.site_id = @site_id
	) CP
	OUTER APPLY
	(
		SELECT COUNT(*) AS DTReasons
		FROM dbo.DTReason DT
		WHERE DT.site_id = @site_id
	) DT
	OUTER APPLY
	(
		SELECT COUNT(*) AS Tags
		FROM dbo.Tag T
		WHERE T.site_id = @site_id
	) T
	OUTER APPLY
	(
		SELECT COUNT(*) AS Workcells
		FROM dbo.Workcell W
		WHERE W.site_id = @site_id
	) W
	OUTER APPLY
	(
		SELECT COUNT(*) AS AssetDisplaySystems
		FROM dbo.AssetDisplaySystem AD
		WHERE AD.site_id = @site_id
	) AD
	OUTER APPLY
	(
		SELECT COUNT(*) AS Unavailable
		FROM dbo.Unavailable U
		WHERE U.site_id = @site_id
	) U
	OUTER APPLY
	(
		SELECT COUNT(*) AS UOM
		FROM dbo.UOM UOM
		WHERE UOM.site_id = @site_id
	) UOM
WHERE A2.asset_id = @site_id
GROUP BY TFD.Users, S.Shifts, CP.CommonParameters, DT.DTReasons, T.Tags,
W.Workcells, AD.AssetDisplaySystems, U.Unavailable, UOM.UOM
RETURN;
END;
