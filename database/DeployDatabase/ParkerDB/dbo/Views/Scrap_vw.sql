/****** Object:  View [dbo].[Scrap_vw]    Script Date: 22/4/2021 12:36:26 ******/

CREATE VIEW [dbo].[Scrap_vw]
AS
SELECT			PD.productiondata_id, PD.dxhdata_id, PD.product_code, PD.ideal, PD.target, PD.actual, DT.quantity as 'scrap', PD.order_id, PD.order_number, 
				PD.start_time, PD.name as 'operator', DR.dtreason_code, DR.dtreason_name, DR.dtreason_description, DR.dtreason_category, DR.level, DR.reason1, DR.reason2, 
				DR.type, DT.dtminutes, DT.name, DT.responsible, A.site_code

FROM            dbo.DTData DT INNER JOIN
                dbo.ProductionData PD ON PD.productiondata_id = DT.productiondata_id JOIN
				dbo.DTReason DR ON DT.dtreason_id = DR.dtreason_id AND DR.type = 'scrap' INNER JOIN
				dbo.Asset A ON DR.asset_id = A.asset_id INNER JOIN
                dbo.parker_site_access ON A.site_code = dbo.parker_site_access.site_code AND dbo.parker_site_access.ad_account = USER
