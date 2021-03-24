
--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_OrderData
--
--  Purpose:
--	Given an asset_code, and either the order_number or "current" flag, provide the info for displaying OrderData
--
--	To Do:
--
--  Output Parameters:
---
--  Input Parameters:
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
--	
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20190827		C00V00 - Intial code created
--  20191203		C00V01 - Change Asset_Code for Asset_Id
--	20210218		C00V02 - Change variables type from varchar to nvarchar
--		
-- Example Call:
-- exec spLocal_EY_DxH_Get_OrderData 65, '14I084', Null
--
CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Get_OrderData]
--Declare
@Asset_Id         INT, 
@Order_Number     NVARCHAR(100), --leave Null if you send Is Current Order = 1
@Is_Current_Order BIT				--leave Null or 0 if you send the order number
AS

    --Select @Asset_Id = 1,
    --	@Order_Number = '12345',
    --	@Is_Current_Order = 0

    BEGIN
        -- SET NOCOUNT ON added to prevent extra result sets from
        -- interfering with SELECT statements.
        SET NOCOUNT ON;

        -- If no order number, get it via is current order 
        IF(ISNULL(@Order_Number, '') = ''
           AND ISNULL(@Is_Current_Order, 0) = 1
           AND EXISTS
        (
            SELECT order_id
            FROM dbo.OrderData WITH(NOLOCK)
            WHERE is_current_order = 1
                  AND asset_id = ISNULL(@Asset_Id, '')
                  AND is_current_order = 1
        ))
            BEGIN
                SELECT TOP 1 @Order_Number = order_number
                FROM dbo.OrderData WITH(NOLOCK)
                WHERE is_current_order = 1
                      AND asset_id = ISNULL(@Asset_Id, '')
                      AND is_current_order = 1;
        END;
        SELECT order_id, 
               order_number, 
               asset_id, 
               product_code, 
               order_quantity, 
               UOM_Code, 
               routed_cycle_time, 
               minutes_allowed_per_setup,
               --	ideal,
               target_percent_of_ideal, 
               production_status, 
               setup_start_time, 
               setup_end_time, 
               production_start_time, 
               production_end_time, 
               start_time, 
               end_time, 
               is_current_order
        FROM dbo.OrderData WITH(NOLOCK)
        WHERE asset_id = @Asset_Id
              AND order_number = @Order_Number;
    END;

        /****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_Product]    Script Date: 4/12/2019 15:17:53 ******/

        SET ANSI_NULLS ON;
