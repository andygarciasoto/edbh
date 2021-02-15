--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Insert_ProductionData
--
--  Purpose:
--	Given a dxhdata_id and needed production info, store the production data
--
--	Returns a status and a message
--		 0 is pass
--		-1 is fail
--	
--	The first production insert in an hour for each order is where the ideal and target 
--	are calculated. Any data sent for the same order in that hour will just increment the actual.
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
--	ProductionData
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20200406		C00V00 - Intial code created		
--		
-- Example Call:
-- exec spLocal_EY_DxH_Insert_ProductionData 261042, 35, 0, 0, 0, '123456789123', Null, Null, '2019/11/26 12:18', 0
--
CREATE    PROCEDURE [dbo].[spLocal_EY_DxH_Insert_ProductionData]
--Declare
@DxHData_Id          INT, -- the hour Id
@Order_Id            INT, 
@Site_Id             INT, 
@Asset_Id            INT, 
@Timestamp_To_Create DATETIME
AS
    BEGIN
        -- SET NOCOUNT ON added to prevent extra result sets from
        -- interfering with SELECT statements.
        SET NOCOUNT ON;
        DECLARE 
		@Initials			VARCHAR(50),
		@ProductionData_Id	INT,
		@Existing_Actual FLOAT,
		@Existing_Setup_Scrap FLOAT,
		@Existing_Other_Scrap FLOAT,
		@ReturnStatus INT,
		@ReturnMessage VARCHAR(1000),
		@OrderNumber VARCHAR(100),
		@Product_Code VARCHAR(100),
		@UOM_Code VARCHAR(100),
		@Routed_Cycle_Time FLOAT,
		@Target_Percent_Of_Ideal FLOAT,
		@Order_Quantity FLOAT,
		@Produced_Quantity FLOAT,
		@Remaining_Quantity FLOAT,
		@Remaining_BreakMinutes FLOAT,
		@Remaining_Minutes FLOAT,
		@TotalRemaining_Minutes FLOAT,
		@Ideal INT,
		@Target INT,
		@Order_Start_Time DATETIME,
		@Previous_Production_Id INT,
		@Minutes_Less INT;

        IF NOT EXISTS
        (
            SELECT dxhdata_id
            FROM dbo.DxHData WITH(NOLOCK)
            WHERE dxhdata_id = ISNULL(@DxHData_Id, -1)
        )
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Invalid DxHData_Id ' + CONVERT(VARCHAR, ISNULL(@DxHData_Id, ''));
                GOTO ErrExit;
        END;
        SET @Initials = 'spLocal_EY_DxH_Insert_ProductionData';

        -- Find the Order for this asset at this time 
        SELECT @OrderNumber = o.order_number, 
               @Product_Code = o.product_code, 
               @UOM_Code = o.UOM_code, 
               @Order_Quantity = o.order_quantity, 
               @Routed_Cycle_Time = o.routed_cycle_time, 
               @Order_Start_Time = o.start_time
        FROM dbo.OrderData o
        WHERE order_id = @Order_Id;
        SELECT @Target_Percent_Of_Ideal = target_percent_of_ideal
        FROM dbo.Asset
        WHERE asset_id = @Asset_Id;

        --Compute Ideal and target	
        -- 
        IF ISNULL(@Routed_Cycle_Time, -1) < 0
            BEGIN
                SELECT @Routed_Cycle_Time = CONVERT(FLOAT, default_routed_cycle_time)
                FROM dbo.CommonParameters cpt WITH(NOLOCK)
                WHERE site_id = @Site_Id
                      AND STATUS = 'Active';
        END;
        IF ISNULL(@Target_Percent_Of_Ideal, -1) <= 0
            BEGIN
                SELECT @Target_Percent_Of_Ideal = CONVERT(FLOAT, default_target_percent_of_ideal)
                FROM dbo.CommonParameters cpt WITH(NOLOCK)
                WHERE site_id = @Site_Id
                      AND STATUS = 'Active';
        END;

        -- Remaining Quantity is Order Quantity - Produced
        -- Look back to the beginning of time to cover the longest time an order can run

        SELECT @Produced_Quantity = SUM(actual - setup_scrap - other_scrap)
        FROM dbo.ProductionData pd WITH(NOLOCK)
        WHERE pd.order_id = @Order_Id
        GROUP BY pd.order_id;
        SELECT @Remaining_Quantity = ISNULL(@Order_Quantity, 0) - ISNULL(@Produced_Quantity, 0);

        --Remaining Quantity adjusted to not run out until a new Order is scanned
        --Select @Remaining_Quantity = 9999

        IF ISNULL(@Remaining_Quantity, 0) < 0
            BEGIN
                SET @Remaining_Quantity = 0;
        END;

        --Remaining time (minus breaks) is 

        SELECT @Remaining_BreakMinutes = SUM(u.duration_in_minutes)
        FROM dbo.Unavailable u
        WHERE u.asset_id = @Asset_Id
              AND u.STATUS = 'Active'
              AND CONCAT(FORMAT(@Timestamp_To_Create, 'yyyy-MM-dd HH'), ':00:00') <= CONCAT(FORMAT(@Timestamp_To_Create, 'yyyy-MM-dd'), ' ', u.start_time)
              AND DATEADD(HOUR, 1, CONVERT(DATETIME, CONCAT(FORMAT(@Timestamp_To_Create, 'yyyy-MM-dd HH'), ':00:00'))) >= CONCAT(FORMAT(@Timestamp_To_Create, 'yyyy-MM-dd'), ' ', u.end_time)
        GROUP BY asset_id;

        --TAKE ALL BREAK

        SET @Remaining_BreakMinutes = ISNULL(@Remaining_BreakMinutes, 0);
        IF ISNULL(@Remaining_BreakMinutes, -1) > 60
            BEGIN
                SET @Remaining_BreakMinutes = 60;
        END;
        IF ISNULL(@Remaining_BreakMinutes, -1) < 0
            BEGIN
                SET @Remaining_BreakMinutes = 0;
        END;

        --Calculate remaining minutes using in the target formula (use remaining break minutes)

        SET @Remaining_Minutes = (60 - @Remaining_BreakMinutes);
        IF ISNULL(@Remaining_Minutes, -1) < 0
            BEGIN
                SET @Remaining_Minutes = 0;
        END;

        --Calculate total remaining minutes using in the ideal formula (not use remaining break minutes)

        SET @TotalRemaining_Minutes = 60;

        --Ideal
        --If (Remaining Seconds in an hour / Routed Cycle Time) > Remaining Quantity
        --then Ideal = Remaining Quantity 
        --Else Remaining Seconds in an hour / Routed Cycle Time

        IF(CONVERT(INT, (@TotalRemaining_Minutes * 60.0) / @Routed_Cycle_Time)) > @Remaining_Quantity
            BEGIN
                SET @Ideal = @Remaining_Quantity;
        END;
            ELSE
            BEGIN
                SET @Ideal = (@TotalRemaining_Minutes * 60.0) / @Routed_Cycle_Time;
        END;

        --Target
        IF(CONVERT(INT, ((@Remaining_Minutes * 60.0) / @Routed_Cycle_Time) * @Target_Percent_Of_Ideal)) > @Remaining_Quantity
            BEGIN
                SET @Target = @Remaining_Quantity;
        END;
            ELSE
            BEGIN
                SET @Target = ((@Remaining_Minutes * 60.0) / @Routed_Cycle_Time) * @Target_Percent_Of_Ideal;
        END;

        --Insert the new record into ProductionData

        INSERT INTO [dbo].[ProductionData]
        ([dxhdata_id], 
         [product_code], 
         [ideal], 
         [target], 
         [actual], 
         [UOM_code], 
         [order_id], 
         [order_number], 
         [start_time], 
         [end_time], 
         [entered_by], 
         [entered_on], 
         [last_modified_by], 
         [last_modified_on], 
         [setup_scrap], 
         [other_scrap], 
         [name]
        )
        VALUES
        (@DxHData_Id, 
         @Product_Code, 
         @Ideal, 
         @Target, 
         0, 
         @UOM_Code, 
         @Order_Id, 
         @OrderNumber, 
         @Timestamp_To_Create, 
         NULL, 
         @Initials, 
         GETDATE(), 
         @Initials, 
         GETDATE(), 
         0, 
         0, 
         @Initials
        );
        SET @ProductionData_Id = SCOPE_IDENTITY();
        SELECT @ReturnStatus = 0, 
               @ReturnMessage = 'Inserted ' + CONVERT(VARCHAR, @ProductionData_Id);
        ErrExit:
        IF @ReturnStatus IS NULL
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Unknown Error';
        END;
        SELECT @ReturnStatus AS ReturnStatus, 
               @ReturnMessage AS ReturnMessage;
        RETURN;
    END;
