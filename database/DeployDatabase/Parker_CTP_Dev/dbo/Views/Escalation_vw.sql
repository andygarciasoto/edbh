/****** Object:  View [dbo].[Escalation_vw]    Script Date: 22/4/2021 12:36:26 ******/

CREATE VIEW [dbo].[Escalation_vw]
AS
SELECT        TFD.Badge, TFD.Username, TFD.First_Name, TFD.Last_Name, A.asset_code as 'Site', R.name as 'Role', E.escalation_name, E.escalation_group, E.escalation_level, 
			  E.escalation_hours, TFD.last_modified_by as 'User edited by', E.last_modified_by as 'Escalation edited by', TFD.last_modified_on as 'User last modified on',
			  E.last_modified_on as 'Escalation last modified on' 
FROM            dbo.TFDUsers TFD INNER JOIN
                dbo.Asset A ON TFD.Site = A.asset_id INNER JOIN
				dbo.Role R ON TFD.role_id = R.role_id INNER JOIN
				dbo.Escalation E ON TFD.escalation_id = E.escalation_id INNER JOIN
                dbo.parker_site_access ON A.site_code = dbo.parker_site_access.site_code AND dbo.parker_site_access.ad_account = USER
GO



