
--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_ProductionDay_Data
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
--	20200328		C00V00 - Intial code created
--		
-- Example Call:
-- exec dbo.spLocal_EY_DxH_Get_ProductionData_By_Interval_And_OrderId 2945, '2020-03-28 14:00:00','2020-03-28 21:00:00', 6
--
CREATE    PROCEDURE [dbo].[spLocal_EY_DxH_Get_ProductionData_By_Interval_And_OrderId] @Order_Id   INT, 
                                                                                   @start_time DATETIME, 
                                                                                   @end_time   DATETIME, 
                                                                                   @Asset_Id   INT
AS
    BEGIN
        -- SET NOCOUNT ON added to prevent extra result sets from
        -- interfering with SELECT statements.
        SET NOCOUNT ON;

		SET @start_time = CONVERT(DATETIME, FORMAT(@start_time, 'yyyy-MM-dd HH')+':00');

        SELECT BD.started_on_chunck, 
               BD.ended_on_chunck, 
               PD.productiondata_id, 
               DHD.dxhdata_id
        FROM [dbo].[GetRangesBetweenDates](@start_time, @end_time, 60, 1) AS BD
             LEFT JOIN dbo.ProductionData PD ON PD.order_id = @Order_Id
                                                AND PD.start_time BETWEEN BD.started_on_chunck AND BD.ended_on_chunck
             LEFT JOIN dbo.DxHData DHD ON DHD.asset_id = @Asset_Id
                                          AND CONCAT(FORMAT(BD.started_on_chunck, 'htt'), ' - ', FORMAT(BD.ended_on_chunck, 'htt')) = UPPER(DHD.hour_interval)
                                          AND DATEADD(HOUR, DATEPART(HOUR, BD.started_on_chunck), production_day) BETWEEN BD.started_on_chunck AND BD.ended_on_chunck
        ORDER BY started_on_chunck;
    END;

        /****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_ProductionData_By_Interval_And_OrderId]    Script Date: 4/12/2019 15:19:33 ******/

        SET ANSI_NULLS ON;
