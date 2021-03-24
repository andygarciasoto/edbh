
--exec [dbo].[spLocal_EY_DxH_Get_Workcell] 'CR2080435W1', 1

CREATE   PROCEDURE [dbo].[spLocal_EY_DxH_Get_Workcell] (@station as NVARCHAR(100),
@site_id as INT)

AS  BEGIN 
DECLARE
    @workcell_id int,
    @workcell_name NVARCHAR(100),
    @workcell_description NVARCHAR(100),
	@site NVARCHAR(100),
	@status NVARCHAR(100) = 'Active',
	@asset_level NVARCHAR(100) = 'Cell';

SELECT @site = site_code
FROM dbo.Asset
WHERE asset_id = @site_id

SELECT @workcell_id = A.grouping1 
FROM dbo.Asset A 
INNER JOIN dbo.AssetDisplaySystem AD 
ON AD.asset_id = A.asset_id 
WHERE AD.displaysystem_name = @station

SELECT @workcell_name = workcell_name,
@workcell_description = workcell_description 
FROM dbo.Workcell 
WHERE workcell_id = @workcell_id

IF EXISTS (SELECT asset_code, asset_name, asset_id, @station as displaysystem_name, 
		   @workcell_name as workcell_name, @workcell_description as workcell_description
           FROM dbo.Asset
           WHERE grouping1 = @workcell_id)
BEGIN
SELECT asset_code, asset_name, asset_id, @station as displaysystem_name, @workcell_name as workcell_name, @workcell_description as workcell_description
FROM dbo.Asset
WHERE grouping1 = @workcell_id
AND asset_level = @asset_level
AND status = @status
ORDER BY asset_name;
END

ELSE
BEGIN

	SELECT 
		A.asset_code,
		A.asset_name,
		A.asset_id,
		CASE WHEN AD.assetdisplaysystem_id IS NULL
			THEN 'No Station'
			ELSE AD.displaysystem_name
		END AS displaysystem_name,
		CASE WHEN W.workcell_id IS NULL
			THEN 'No Workcell'
			ELSE W.workcell_name
		END AS workcell_name,
		CASE WHEN W.workcell_id IS NULL
			THEN 'No Workcell'
			ELSE W.workcell_description
		END AS workcell_description,
		W.workcell_id
	FROM dbo.Asset A
		LEFT JOIN dbo.AssetDisplaySystem AD ON A.asset_id = AD.asset_id
		LEFT JOIN dbo.Workcell W ON A.grouping1 = W.workcell_id
	WHERE A.site_code = @site
		AND A.asset_level = @asset_level
		AND A.status = @status
	ORDER BY asset_name;

END
END
