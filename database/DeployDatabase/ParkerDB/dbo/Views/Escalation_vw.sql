
/****** Object:  View [dbo].[Escalation_vw]    Script Date: 22/4/2021 12:36:26 ******/

CREATE VIEW [dbo].[Escalation_vw]
AS
SELECT			EE.asset_id, A.asset_code, A.site_code, DXH.production_day, DXH.hour_interval,
				EE.escalation_time, EE.sign_time, DATEDIFF(MINUTE, EE.escalation_time, EE.sign_time) as 'minutes_signed_after_escalation', 
				EE.badge, TFD.First_Name, TFD.Last_Name, R.name, E.escalation_name, E.escalation_level, E.escalation_hours
FROM            dbo.EscalationEvents EE INNER JOIN
                dbo.Asset A ON EE.asset_id = A.asset_id INNER JOIN
				dbo.DxHData DXH ON EE.dxhdata_id = DXH.dxhdata_id INNER JOIN
				dbo.Escalation E ON EE.escalation_id = E.escalation_id LEFT JOIN
				dbo.TFDUsers TFD ON EE.badge = TFD.badge LEFT JOIN
				dbo.Role R ON TFD.role_id = R.role_id INNER JOIN
                dbo.parker_site_access ON A.site_code = dbo.parker_site_access.site_code AND dbo.parker_site_access.ad_account = USER
