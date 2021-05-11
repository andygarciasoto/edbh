



CREATE   VIEW [dbo].[MultipleLaborPeople_vw]
AS
SELECT			A.asset_code, A.asset_name, A.asset_description, A.parent_asset_code, A.site_code, A.is_multiple, S.badge, TFD.Username, TFD.First_Name, TFD.Last_Name, 
				S.start_time, S.end_time, S.reason
FROM            dbo.Scan S INNER JOIN
				dbo.Asset A ON S.asset_id = A.asset_id AND A.asset_level = 'Cell' AND is_multiple = 1 INNER JOIN
				dbo.TFDUsers TFD ON S.badge = TFD.Badge INNER JOIN
                dbo.parker_site_access ON A.site_code = dbo.parker_site_access.site_code AND dbo.parker_site_access.ad_account = USER
