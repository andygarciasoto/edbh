/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Fill_Row_Get_Active_Assets_By_Site]    Script Date: 25/2/2021 16:56:25 ******/
--
-- Copyright © 2020 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Fill_Row_Get_Active_Assets_By_Site
--
--  Purpose:
--	Given an orders of the last hour to fill production table
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
--	20200416		C00V00 - Intial code created.
--	20210225		C00V01 - Update logic to define an active station Exists(Order,Asset,Production,Intershift).
--		
-- Example Call:
-- exec dbo.spLocal_EY_DxH_Fill_Row_Get_Active_Assets_By_Site '2021-02-25 15:00:00', '2021-02-25 17:00:00', 1
--

CREATE   PROCEDURE [dbo].[spLocal_EY_DxH_Fill_Row_Get_Active_Assets_By_Site] @start_shift     DATETIME, 
                                                                           @site_round_time DATETIME, 
                                                                           @site_id         INT
AS
    BEGIN
        -- SET NOCOUNT ON added to prevent extra result sets from
        -- interfering with SELECT statements.
        SET NOCOUNT ON;

        DECLARE
			@asset_level NVARCHAR(100) = 'Cell',
			@asset_status NVARCHAR(100) = 'Active',
			@start_shift_utc DATETIME,
			@end_shift_utc DATETIME;

		SELECT
			@start_shift_utc =  @start_shift AT TIME ZONE T.sql_timezone AT TIME ZONE 'UTC',
			@end_shift_utc =  @site_round_time AT TIME ZONE T.sql_timezone AT TIME ZONE 'UTC'
		FROM dbo.CommonParameters CP INNER JOIN dbo.Timezone T
		ON CP.timezone_id = T.timezone_id 
		AND CP.site_id = @site_id;

        SELECT
			DISTINCT
			A.asset_id,
			A.asset_code,
			A.asset_name
		FROM OrderData OD
			INNER JOIN dbo.Asset A ON
				A.asset_id = OD.asset_id AND
				A.asset_level = @asset_level AND
				A.status = @asset_status
			INNER JOIN dbo.Asset A2 ON
				A2.asset_code = A.site_code AND
				A2.asset_id = @site_id
			LEFT JOIN dbo.ProductionData PD ON
				PD.order_id = OD.order_id AND
				PD.start_time >= @start_shift AND
				PD.start_time < @site_round_time
			LEFT JOIN dbo.InterShiftData ISD ON A.asset_id = ISD.asset_id AND ISD.entered_on >= @start_shift_utc AND  ISD.entered_on < @end_shift_utc
		WHERE
			PD.productiondata_id IS NOT NULL OR ISD.intershift_id IS NOT NULL;
    END;
