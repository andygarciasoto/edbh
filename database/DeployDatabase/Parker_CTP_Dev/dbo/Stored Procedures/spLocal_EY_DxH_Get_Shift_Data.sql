/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_Shift_Data]    Script Date: 22/2/2021 20:22:31 ******/
--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_Shift_Data
--
--  Purpose:
--	Given an asset, a Production_Day, and a shift code, get the data for a full shift and pass it to the dashboard display
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
--	20190724		C00V00 - Intial code created		
--	20190814		C00V01 - Add some IDs to the output		
--	20190822		C00V02 - Adjusted output of datetimes to site_timezone, reworked left join		
--	20190823		C00V03 - Added routed cycle time to output		
--	20190903		C00V04 - extended predictive values to include any hour in the shift without production		
--	20190905		C00V05 - adjust predictive values to not reduce predictive remaining quantity from hours before Now
--	20190917		C00V06 - relocated BreakLunch_Details section
--	20190918		C00V07 - setup time for orders without production now uses started, ended, or spanned current hour
--  20191203		C00V08 - Change Asset_Code for Asset_Id
--	20191204		C00V09 - Change CommonParameters to CommonParameters
--	20191204		C00V10 - Change Shift_Code to Shift_Id because this information is from the database
--	20200225		C00V11 - Add order information to all production rows and the actual production quantity
--	20201028		C00V12 - Change Target_Percent_Of_Ideal order check for first Order table, second Asset table, and finally check Common Parameters table.
--	20201102		C00V13 - Change Target_Percent_Of_Ideal to use Asset table, and finally check Common Parameters table.
--	20201103		C00V14 - Update logic to check start and end time for each shift including the shift for the vertical dashboard
--	20201212		C00V15 - Add new shift logic in the main join sentence
--	20201221		C00V16 - Add join with Product table to return product name instead of product code
--	20210218		C00V17 - Change variables type from varchar to nvarchar
--	20210222		C00V18 - Change Shift id for starttime and endtime parameters (add fexibiltiy in the logic to search the data)
--	20210318		C00V19 - Include dynamic target to get the current color hour
--		
-- Example Call:
-- exec spLocal_EY_DxH_Get_Shift_Data 35,'2021-02-22','2021-02-22 15:00', '2021-02-22 23:00', 1
--
--52,7586221694946
--23,9655113220215

CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Get_Shift_Data]
--Declare
@Asset_Id        INT,
@Production_date DATETIME,
@Start_DateTime		DATETIME,
@End_DateTime		DATETIME,
@Site            INT
AS
    --exec spLocal_EY_DXH_GET_SHIFT_dATA 0, '20191111', 8
    --exec spLocal_EY_DxH_Get_Shift_Data 1, '20191101', 9

    BEGIN
        -- SET NOCOUNT ON added to prevent extra result sets from
        -- interfering with SELECT statements.
        SET NOCOUNT ON;

        DECLARE
        @current_time DATETIME,
        @Active_Status NVARCHAR(100) = 'Active';

        SELECT
            @current_time = GSP.CurrentDateTime
        FROM dbo.GetShiftProductionDayFromSiteAndDate(@Site,NULL) GSP;

        WITH CTE
             AS (SELECT CONVERT(VARCHAR, BD.started_on_chunck, 20) AS started_on_chunck, 
                        CONVERT(VARCHAR, BD.ended_on_chunck, 20) AS ended_on_chunck, 
                        LOWER(CONCAT(FORMAT(BD.started_on_chunck, 'htt'), ' - ', FORMAT(BD.ended_on_chunck, 'htt'))) AS hour_interval,
						SF.shift_code,
                        DH.dxhdata_id, 
                        DH.operator_signoff, 
                        DH.operator_signoff_timestamp, 
                        DH.supervisor_signoff, 
                        DH.supervisor_signoff_timestamp, 
                        PD.start_time, 
                        PD.productiondata_id, 
                        P.product_name, 
                        CONVERT(INT, PD.ideal) AS ideal,
                        CONVERT(INT, PD.target) AS target,
                        PD.actual,
                        (PD.setup_scrap + PD.other_scrap) AS scrap, 
                        PD.setup_scrap,
                        PD.other_scrap,
                        SUM(CONVERT(INT, PD.ideal)) OVER(PARTITION BY PD.dxhdata_id) AS summary_ideal, 
                        SUM(CONVERT(INT, PD.ideal)) OVER(
                        ORDER BY PD.dxhdata_id) AS cumulative_ideal, 
                        SUM(CONVERT(INT, PD.target)) OVER(PARTITION BY PD.dxhdata_id) AS summary_target,
                        SUM(CONVERT(INT, PD.target)) OVER(
                        ORDER BY BD.started_on_chunck) AS cumulative_target, 
                        SUM(PD.actual) OVER(PARTITION BY PD.dxhdata_id) AS summary_actual, 
                        SUM(PD.actual) OVER(
                        ORDER BY BD.started_on_chunck) AS cumulative_actual, 
                        SUM(PD.setup_scrap + PD.other_scrap) OVER(PARTITION BY PD.dxhdata_id) AS summary_scrap, 
                        SUM(PD.setup_scrap) OVER(PARTITION BY PD.dxhdata_id) AS summary_setup_scrap, 
                        SUM(PD.setup_scrap) OVER(
                        ORDER BY PD.dxhdata_id) AS cumulative_setup_scrap, 
                        SUM(PD.other_scrap) OVER(PARTITION BY PD.dxhdata_id) AS summary_other_scrap, 
                        SUM(PD.other_scrap) OVER(
                        ORDER BY PD.dxhdata_id) AS cumulative_other_scrap, 
                        CASE
                            WHEN COUNT(*) OVER(PARTITION BY BD.started_on_chunck) > 1
                            THEN 'multiple'
                            ELSE(CASE
                                     WHEN PD.productiondata_id IS NULL
                                          OR DH.dxhdata_id IS NULL
                                     THEN(CASE
                                              WHEN
                 (
                     SELECT COUNT(productiondata_id)
                     FROM productiondata
                     WHERE start_time > BD.started_on_chunck
                           AND OD.order_number = order_number
                 ) >= 1
                                              THEN OD.product_code
                                              ELSE ''
                                          END)
                                     ELSE PD.product_code
                                 END)
                        END AS summary_product_code, 
                        OD.order_id, 
                        OD.order_number, 
                        OD.order_quantity, 
                        OD.routed_cycle_time, 
                        CP.default_target_percent_of_ideal, 
                        OD.setup_start_time, 
                        OD.setup_end_time, 
                        OD.product_code AS product_code_order, 
						S.active_operators as active_operators,
                        SUM(CASE
                                WHEN OD.order_id IS NULL
                                THEN 0
                                WHEN OD.setup_start_time < BD.started_on_chunck
                                THEN DATEDIFF(MINUTE, BD.started_on_chunck, OD.setup_end_time)
                                WHEN OD.setup_end_time >= BD.ended_on_chunck
                                THEN DATEDIFF(MINUTE, OD.setup_start_time, BD.ended_on_chunck)
                                ELSE DATEDIFF(MINUTE, OD.setup_start_time, OD.setup_end_time)
                            END) OVER(PARTITION BY PD.dxhdata_id) AS summary_setup_minutes, 
                        CP.default_routed_cycle_time, 
                        AST.target_percent_of_ideal, 
                        U.summary_breakandlunch_minutes, 
                        CD.commentdata_id, 
                        CD.comment, 
                        CD.first_name, 
                        CD.last_name, 
                        CD.total_comments, 
                        DTD.summary_minutes AS timelost_summary,
                        CASE
                            WHEN OD.start_time <= BD.started_on_chunck
                            THEN CONVERT(INT, (3600 / ISNULL(OD.routed_cycle_time, CP.default_routed_cycle_time)))
                            ELSE NULL
                        END AS new_ideal,
                        CASE
                            WHEN OD.start_time <= BD.started_on_chunck
                            THEN CONVERT(INT, ((((60 - ISNULL(U.summary_breakandlunch_minutes, 0)) * 60) / ISNULL(OD.routed_cycle_time, CP.default_routed_cycle_time)) * ISNULL(AST.target_percent_of_ideal, CP.default_target_percent_of_ideal)))
                            ELSE NULL
                        END AS new_target, 
                        PD1.summary_actual_quantity, 
                        ROW_NUMBER() OVER(PARTITION BY OD.order_id
                        ORDER BY BD.started_on_chunck) AS Row#
                 FROM [dbo].[GetRangesBetweenDates](@Start_DateTime, @End_DateTime, 60, 1) AS BD
					  --VALIDATE SELECTED DATES AGAINST THE SHIFT TABLE
					  INNER JOIN dbo.Shift SF ON BD.started_on_chunck >= DATEADD(HOUR, DATEPART(HOUR, SF.start_time), DATEADD(DAY, SF.start_time_offset_days, @Production_date))
													AND BD.started_on_chunck <	DATEADD(HOUR, DATEPART(HOUR, SF.end_time), DATEADD(DAY, SF.end_time_offset_days, @Production_date))
													AND SF.asset_id = @Site
													AND SF.status = @Active_Status
                      --SEARCH ALL DXHDATA FOR EACH INTERVAL HOUR
                      LEFT JOIN dbo.DxHData DH ON DH.asset_id = @Asset_Id
                                                  AND production_day = @Production_date
                                                  AND CONCAT(FORMAT(BD.started_on_chunck, 'htt'), ' - ', FORMAT(BD.ended_on_chunck, 'htt')) = UPPER(DH.hour_interval)
                      --SEARCH ALL PRODUCTION FOR THE SELECTED DXHDATA
                      LEFT JOIN dbo.ProductionData PD ON PD.dxhdata_id = DH.dxhdata_id
                      --SELECT CURRENT ORDER OF THE SHIFT
                      LEFT JOIN dbo.OrderData OD ON(OD.asset_id = @Asset_Id
                                                    AND OD.is_current_order = 1
                                                    --AND PD.productiondata_id IS NULL
                                                    AND OD.start_time <= BD.started_on_chunck
													AND @current_time <= BD.ended_on_chunck)
                      --SELECT COMMON PARAMETERS OF THE SITE
                      LEFT JOIN dbo.CommonParameters CP ON CP.site_id = @Site
                                                           AND CP.STATUS = 'Active'
                      --GET ALL INFORMATION OF THE CURRENT ASSET
                      LEFT JOIN dbo.Asset AST ON AST.asset_id = @Asset_Id
                      --GET INFORMATION OF THE PRODUCT
                      LEFT JOIN dbo.Product P ON PD.product_code = P.product_code
					  --GET ACTIVE OPERATORS WITH MULTIPLE ASSETS
					  OUTER APPLY
				(
					SELECT COUNT (DISTINCT S.badge) as active_operators
					FROM dbo.Scan S
					WHERE S.asset_id = @Asset_Id
							AND S.status = 'Active'
							AND S.start_time < BD.ended_on_chunck
							AND (S.end_time IS NULL OR S.end_time > BD.started_on_chunck)
				) S
					   --GET ALL BREAKS/SETUP TIME OF THE CURRENT HOUR
                      OUTER APPLY
                 (
                     SELECT SUM(U.duration_in_minutes) AS summary_breakandlunch_minutes
                     FROM dbo.Unavailable U
                     WHERE U.asset_id = @Asset_Id
                           AND U.STATUS = 'Active'
                           AND BD.started_on_chunck <= CONCAT(FORMAT(BD.started_on_chunck, 'yyyy-MM-dd'), ' ', U.start_time)
                           AND BD.ended_on_chunck >= CONCAT(FORMAT(BD.ended_on_chunck, 'yyyy-MM-dd'), ' ', U.end_time)
                     GROUP BY u.asset_id
                 ) U
                      --GET THE TOTAL PRODUCTION DATA OF THE CURRENT ORDER ACCORDING TO THE PRODUCTION DATA
                      OUTER APPLY
                 (
                     SELECT SUM(CASE
                                    WHEN FORMAT(PD1.start_time, 'yyyy-MM-dd HH') = FORMAT(@current_time, 'yyyy-MM-dd HH')
                                         AND CONVERT(INT, PD1.target) > (CONVERT(INT, PD1.actual) - PD1.setup_scrap - PD1.other_scrap)
                                    THEN CONVERT(INT, PD1.target)
                                    ELSE CONVERT(INT, PD1.actual) - PD1.setup_scrap - PD1.other_scrap
                                END) AS summary_actual_quantity
                     FROM dbo.ProductionData PD1
                     WHERE PD1.order_id = OD.order_id
                     GROUP BY PD1.order_id
                 ) PD1
                      --GET THE QUANTITY OF INSERTED COMMENTS FOR THE ROWS AND THE LAST COMMENT
                      OUTER APPLY
                 (
                     SELECT TOP 1 C.commentdata_id, 
                                  C.comment, 
                                  C.first_name, 
                                  C.last_name, 
                                  COUNT(*) OVER(PARTITION BY C.dxhdata_id) AS total_comments
                     FROM dbo.CommentData C
                     WHERE C.dxhdata_id = DH.dxhdata_id
                     ORDER BY last_modified_on DESC
                 ) CD
                      --GET THE DT REASON MINUTES OF EACH ROW
                      OUTER APPLY
                 (
                     SELECT TOP 1 SUM(DT.dtminutes) OVER(PARTITION BY DT.dxhdata_id) AS summary_minutes
                     FROM dbo.DTData DT
                     WHERE DT.dxhdata_id = DH.dxhdata_id
                 ) DTD),
             CTE2
             AS (SELECT CTE.*,
						actual - scrap AS adjusted_actual,
						summary_actual - summary_scrap AS summary_adjusted_actual,
						(cumulative_actual - cumulative_setup_scrap - cumulative_other_scrap) AS cumulative_adjusted_actual,
						(DATEPART(minute, @current_time) * ISNULL(CTE.target,0) / 60) AS dynamic_target,
						(DATEPART(minute, @current_time) * ISNULL(CTE.summary_target,0) / 60) AS dynamic_summary_target,
                        SUM(CASE
                                WHEN ISNULL(CTE.order_id, 0) > 0
                                     AND CTE.Row# = 1
                                THEN CTE.new_target + CTE.summary_actual_quantity
                                ELSE CTE.new_target
                            END) OVER(
                        ORDER BY CTE.started_on_chunck) AS summary_actual_target
                 FROM CTE),
             CTE3
             AS (SELECT CTE2.*,
                        CASE
                            WHEN CTE2.order_quantity - (CTE2.summary_actual_target - CTE2.new_target) < CTE2.new_target
                                 AND CTE2.order_quantity - (CTE2.summary_actual_target - CTE2.new_target) > 0
                            THEN 2
                            WHEN CTE2.order_quantity > CTE2.summary_actual_target
                            THEN 1
                            ELSE 0
                        END AS result_final
                 FROM CTE2)
             SELECT started_on_chunck,
                    ended_on_chunck,
                    hour_interval,
					shift_code,
                    dxhdata_id,
                    operator_signoff,
                    operator_signoff_timestamp,
                    supervisor_signoff,
                    supervisor_signoff_timestamp,
                    start_time,
                    productiondata_id,
                    product_name AS product_code,
                    ideal,
                    target,
                    actual,
                    adjusted_actual,
                    scrap,
                    summary_scrap,
                    setup_scrap,
                    other_scrap,
                    CASE
                        WHEN productiondata_id IS NOT NULL
                        THEN summary_product_code
                        WHEN productiondata_id IS NULL
                             AND order_id IS NOT NULL
                             AND result_final = 2
                        THEN product_code_order
                        WHEN productiondata_id IS NULL
                             AND order_id IS NOT NULL
                             AND result_final = 1
                        THEN product_code_order
                        ELSE summary_product_code
                    END AS summary_product_code,
                    CASE
                        WHEN productiondata_id IS NOT NULL
                        THEN summary_ideal
                        WHEN productiondata_id IS NULL
                             AND order_id IS NOT NULL
                             AND result_final = 2
                        THEN order_quantity - (summary_actual_target - new_target)
                        WHEN productiondata_id IS NULL
                             AND order_id IS NOT NULL
                             AND result_final = 1
                        THEN new_ideal
                        ELSE NULL
                    END AS summary_ideal,
                    cumulative_ideal,
                    CASE
                        WHEN productiondata_id IS NOT NULL
                        THEN summary_target
                        WHEN productiondata_id IS NULL
                             AND order_id IS NOT NULL
                             AND result_final = 2
                        THEN order_quantity - (summary_actual_target - new_target)
                        WHEN productiondata_id IS NULL
                             AND order_id IS NOT NULL
                             AND result_final = 1
                        THEN new_target
                        ELSE NULL
                    END AS summary_target,
                    cumulative_target,
                    summary_actual,
                    summary_adjusted_actual,
                    cumulative_actual,
                    cumulative_adjusted_actual,
                    summary_setup_scrap,
                    cumulative_setup_scrap,
                    summary_other_scrap,
                    cumulative_other_scrap,
                    summary_product_code,
                    order_id,
                    order_number,
                    order_quantity,
                    routed_cycle_time,
                    target_percent_of_ideal,
                    setup_start_time,
                    setup_end_time,
                    product_code_order,
                    CASE
                        WHEN summary_setup_minutes < 0
                        THEN 0
                        WHEN summary_setup_minutes > 60
                        THEN 60
                        ELSE summary_setup_minutes
                    END AS summary_setup_minutes,
                    default_routed_cycle_time,
                    default_target_percent_of_ideal,
                    summary_breakandlunch_minutes,
                    commentdata_id,
                    comment,
                    first_name,
                    last_name,
                    total_comments,
                    timelost_summary,
                    summary_actual_quantity,
					active_operators,
					CASE
						WHEN @current_time >= started_on_chunck AND @current_time < ended_on_chunck AND CTE3.adjusted_actual < dynamic_target THEN 'red'
						WHEN @current_time >= started_on_chunck AND @current_time < ended_on_chunck AND CTE3.adjusted_actual >= dynamic_target THEN 'green'
                        WHEN (CTE3.ideal = 0 AND CTE3.target = 0) OR
                            (CTE3.adjusted_actual = 0 AND CTE3.target = 0) OR
                            (CTE3.adjusted_actual < CTE3.target)
                        THEN 'red'
                        ELSE 'green'
                    END AS background_color,
					dynamic_target,
                    CASE
						WHEN @current_time >= started_on_chunck AND @current_time < ended_on_chunck AND CTE3.summary_adjusted_actual < dynamic_summary_target THEN 'red'
						WHEN @current_time >= started_on_chunck AND @current_time < ended_on_chunck AND CTE3.summary_adjusted_actual >= dynamic_summary_target THEN 'green'
                        WHEN (CTE3.summary_ideal = 0 AND CTE3.summary_target = 0) OR
                            (CTE3.summary_adjusted_actual = 0 AND CTE3.summary_target = 0) OR
                            (CTE3.summary_adjusted_actual < CTE3.summary_target)
                        THEN 'red'
                        ELSE 'green'
                    END AS summary_background_color,
					dynamic_summary_target
             FROM CTE3
             ORDER BY started_on_chunck ASC, 
                      start_time DESC;
    END;
