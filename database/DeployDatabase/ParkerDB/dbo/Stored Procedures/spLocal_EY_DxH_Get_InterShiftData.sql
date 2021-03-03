
--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_InterShiftData
--
--  Purpose:
--	Given an asset, a Production_Day, and a shift code, get the intershift data for the current shift and 
--		the 2 (note the number of shifts could change) previous shifts and pass it to the dashboard display
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
--		Assumes that 3 days plus the current sift and the shifts in the current day 
--		are enough to get all desired InterShiftData
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
--	20190731		C00V00 - Intial code created		
--	20190822		C00V01 - Adjusted output of datetimes to site_timezone
--  20191203		C00V02 - Change Asset_Code for Asset_Id
--	20191204		C00V03 - Change CommonParameters to CommonParameters
--	20191210		C00V04 - Change Shift_Code to Shift_Id because this information is from the database
--	20200415		C00V05 - Change logic to create new way to get the information
--		
-- Example Call:
-- exec spLocal_EY_DxH_Get_InterShiftData 35,'2020-04-15',3
--
CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Get_InterShiftData]
--Declare
@Asset_Id       INT, 
@Production_Day DATETIME, 
@Shift_Id       INT
AS
    BEGIN
        -- SET NOCOUNT ON added to prevent extra result sets from
        -- interfering with SELECT statements.
        SET NOCOUNT ON;
        DECLARE 
		@Previous_Shifts_To_Include INT= 2;

        WITH CTE1
             AS (SELECT CASE
                            WHEN S.end_time < S.start_time
                                 AND S.is_first_shift_of_day = 0
                            THEN CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, S.end_time), DATEADD(DAY, 1, @Production_Day)), 'yyyy-MM-dd HH'), ':00')
                            ELSE CONCAT(FORMAT(DATEADD(HOUR, DATEPART(HOUR, S.end_time), @Production_Day), 'yyyy-MM-dd HH'), ':00')
                        END AS end_date_time, 
                        S.duration_in_minutes * (@Previous_Shifts_To_Include + 1) AS minutes_to_go_back,
						CP.site_timezone
                 FROM dbo.Shift S JOIN CommonParameters CP ON S.asset_id = CP.site_id 
                 WHERE S.shift_id = @Shift_Id)
             SELECT ISH.intershift_id, 
                    ISH.asset_id, 
                    ISH.production_day, 
                    ISH.shift_code, 
                    ISH.comment, 
                    ISH.entered_by, 
                    CONVERT(DATETIME, ISH.entered_on AT TIME ZONE 'UTC' AT TIME ZONE CTE1.site_timezone) AS entered_on, 
                    ISH.first_name, 
                    ISH.last_name
             FROM dbo.InterShiftData ISH
                  JOIN CTE1 ON ISH.asset_id = @Asset_Id
                               AND (CONVERT(DATETIME, ISH.entered_on AT TIME ZONE 'UTC' AT TIME ZONE CTE1.site_timezone) >= DATEADD(MINUTE, -CTE1.minutes_to_go_back,CTE1.end_date_time))
                               AND (CONVERT(DATETIME, ISH.entered_on AT TIME ZONE 'UTC' AT TIME ZONE CTE1.site_timezone) <= CTE1.end_date_time)
							   ORDER BY ISH.entered_on;
    END;