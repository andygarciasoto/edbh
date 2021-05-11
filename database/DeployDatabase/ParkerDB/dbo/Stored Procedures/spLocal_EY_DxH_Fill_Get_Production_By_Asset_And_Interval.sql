/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Fill_Get_Production_By_Asset_And_Interval]    Script Date: 23/2/2021 12:18:16 ******/
--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Fill_Get_Production_By_Asset_And_Interval
--
--  Purpose:
--	Given an asset and a Production_Day, get the data for a full production day and pass it to the dashboard display
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
--	20200403		C00V00 - Intial code created
--	20210225		C00V01 - Update logic to get the missing production hours
--		
-- Example Call:
-- exec dbo.spLocal_EY_DxH_Fill_Get_Production_By_Asset_And_Interval 6, '2020-03-28 14:00:00','2020-03-28 21:00:00'
--
CREATE     PROCEDURE [dbo].[spLocal_EY_DxH_Fill_Get_Production_By_Asset_And_Interval] @Asset_Id   INT, 
                                                                                 @start_time DATETIME, 
                                                                                 @end_time   DATETIME
AS
    BEGIN
        -- SET NOCOUNT ON added to prevent extra result sets from
        -- interfering with SELECT statements.
        SET NOCOUNT ON;
        SELECT
            BD.started_on_chunck,
            BD.ended_on_chunck,
            OD.order_id,
            OD.order_number,
            OD.product_code,
            OD.start_time,
            OD.end_time,
            PD.productiondata_id,
            SUM(PD.actual - PD.setup_scrap - PD.other_scrap) OVER(PARTITION BY OD.product_code) AS production
        FROM [dbo].[GetRangesBetweenDates](@start_time, @end_time, 60, 1) AS BD
                LEFT JOIN OrderData OD ON
                        asset_id = @Asset_Id AND
						(
							(OD.end_time >= BD.started_on_chunck AND OD.end_time < BD.ended_on_chunck) OR
							(OD.start_time >= BD.started_on_chunck AND OD.start_time < BD.ended_on_chunck) OR
							(OD.end_time IS NULL AND OD.start_time < BD.started_on_chunck) OR
							(OD.start_time < BD.started_on_chunck AND OD.end_time > BD.ended_on_chunck)
						)
                LEFT JOIN dbo.ProductionData PD ON
						PD.order_id = OD.order_id AND
						PD.start_time >= BD.started_on_chunck AND
						PD.start_time < BD.ended_on_chunck
		WHERE
                PD.productiondata_id IS NULL
        ORDER BY
                BD.id_chun,
				OD.start_time;
    END;
