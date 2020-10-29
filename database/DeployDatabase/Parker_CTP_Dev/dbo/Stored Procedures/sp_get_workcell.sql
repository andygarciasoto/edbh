
--exec sp_get_workcell 'CR2080435W1', 1

CREATE   PROCEDURE [dbo].[sp_get_workcell] (@station as VARCHAR(100),
@site_id as INT)

AS  BEGIN 
DECLARE
    @workcell_id int,
    @workcell_name VARCHAR(100),
    @workcell_description VARCHAR(100),
	@site VARCHAR(100)

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
AND asset_level = 'Cell'
AND status = 'Active'
END

ELSE
BEGIN

SELECT asset_code, asset_name, asset_id, 'No Station' as displaysystem_name, 'No Workcell' as workcell_name, 'No Workcell' as workcell_description
FROM dbo.Asset
WHERE site_code = @site
AND asset_level = 'Cell'
AND status = 'Active'
END
END
