--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Put_ProductionData
--
--  Purpose:
--	Given a dxhdata_id and needed production info, store the production data
--
--	If the @Override field is Null or 0, then it is a new insert or an increment
--	If the @Override field is Not Null and Not 0, it is an Override. The existing value of Actual 
--		will be replaced. The value of @Override is the productiondata_id to be updated
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
--	20190809		C00V00 - Intial code created		
--	20191204		C00V01 - Change CommonParameters to CommonParameters
--	20201028		C00V02 - Change Target_Percent_Of_Ideal order check for first Order table, second Asset table, and finally check Common Parameters table.
--	20201102		C00V03 - Change Target_Percent_Of_Ideal to use Asset table, and finally check Common Parameters table.
--		
-- Example Call:
-- exec spLocal_EY_DxH_Put_ProductionData 261042, 35, 0, 0, 0, '123456789123', Null, Null, '2019/11/26 12:18', 0
--
CREATE    PROCEDURE [dbo].[spLocal_EY_DxH_Put_ProductionData]
--Declare
@DxHData_Id      INT, -- the hour Id
@Actual          FLOAT, -- to be inserted, increment exisiting Actual, or replace if Override
@Setup_Scrap     FLOAT, -- to be inserted, increment exisiting Actual, or replace if Override
@Other_Scrap     FLOAT, -- to be inserted, increment exisiting Actual, or replace if Override
@Clock_Number    NVARCHAR(100), -- used to look up First and Last, leave blank if you have first and last
@First_Name      NVARCHAR(100), -- 
@Last_Name       NVARCHAR(100), -- 
@Timestamp       DATETIME, -- generally current time but note it is used to find break and lunch time
@Override        INT				-- generally Null or 0, send the productiondata_id for update/replacing Actual
AS
    BEGIN
        -- SET NOCOUNT ON added to prevent extra result sets from
        -- interfering with SELECT statements.
        SET NOCOUNT ON;
        DECLARE @First NVARCHAR(50),
		@Last NVARCHAR(50),
		@Initials NVARCHAR(50),
		@ProductionData_Id INT,
		@Existing_Actual FLOAT,
		@Existing_Setup_Scrap FLOAT,
		@Existing_Other_Scrap FLOAT,
		@ReturnStatus INT,
		@ReturnMessage NVARCHAR(1000),
		@Asset_Id INT,
		@Site_Id INT,
		@OrderNumber NVARCHAR(100),
		@Order_Id INT,
		@Product_Code NVARCHAR(100),
		@UOM_Code NVARCHAR(100),
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
		@Order_Start_Time		DATETIME,
		@Previous_Production_Id	INT,
		@Minutes_Less			INT,
        @ActualInt              INT = @Actual;

        IF NOT EXISTS
        (
            SELECT dxhdata_id
            FROM dbo.DxHData WITH(NOLOCK)
            WHERE dxhdata_id = ISNULL(@DxHData_Id, -1)
        )
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Invalid DxHData_Id ' + CONVERT(NVARCHAR, ISNULL(@DxHData_Id, ''));
                GOTO ErrExit;
        END;
        IF ISNULL(@Actual, -1) < 0
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Invalid Actual ' + CONVERT(NVARCHAR, ISNULL(@Actual, -1));
                GOTO ErrExit;
        END;
        IF ISNULL(@Setup_Scrap, -1) < 0
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Invalid Setup Scrap ' + CONVERT(NVARCHAR, ISNULL(@Setup_Scrap, -1));
                GOTO ErrExit;
        END;
        IF ISNULL(@Other_Scrap, -1) < 0
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Invalid Other Scrap' + CONVERT(NVARCHAR, ISNULL(@Other_Scrap, -1));
                GOTO ErrExit;
        END;
        IF EXISTS
        (
            SELECT Badge
            FROM dbo.TFDUsers WITH(NOLOCK)
            WHERE Badge = ISNULL(@Clock_Number, -1)
        )
            BEGIN
                SELECT @First = First_Name, 
                       @Last = Last_Name
                FROM dbo.TFDUsers WITH(NOLOCK)
                WHERE Badge = @Clock_Number;
                IF ISNULL(@First_Name, '') = ''
                    BEGIN
                        SET @First_Name = @First;
                END;
                IF ISNULL(@Last_Name, '') = ''
                    BEGIN
                        SET @Last_Name = @Last;
                END;
        END;
        IF ISNULL(@First_Name, '') = ''
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Invalid First Name ' + CONVERT(NVARCHAR, ISNULL(@First_Name, ''));
                GOTO ErrExit;
        END;
        IF ISNULL(@Last_Name, '') = ''
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Invalid Last Name ' + CONVERT(NVARCHAR, ISNULL(@Last_Name, ''));
                GOTO ErrExit;
        END;
        SELECT @Initials = CONVERT(NVARCHAR, LEFT(@First_Name, 1)) + CONVERT(NVARCHAR, LEFT(@last_Name, 1));
        IF ISDATE(@Timestamp) <> 1
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Invalid Timestamp ' + CONVERT(NVARCHAR, ISNULL(@Timestamp, ''));
                GOTO ErrExit;
        END;
        IF(ISNULL(@Override, 0) <> 0)
          AND (NOT EXISTS
        (
            SELECT productiondata_id
            FROM dbo.ProductionData WITH(NOLOCK)
            WHERE productiondata_id = ISNULL(@Override, -1)
        ))
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Invalid Override ' + CONVERT(NVARCHAR, ISNULL(@Override, ''));
                GOTO ErrExit;
        END;

        -- Find the Order for this asset at this time 
        SELECT TOP 1 @Asset_Id = dxh.asset_id, 
                     @Order_Id = o.order_id, 
                     @OrderNumber = o.order_number, 
                     @Product_Code = o.product_code, 
                     @UOM_Code = o.UOM_code, 
                     @Order_Quantity = o.order_quantity, 
                     @Routed_Cycle_Time = o.routed_cycle_time,
					 @Order_Start_Time = o.start_time
        FROM dbo.OrderData o WITH(NOLOCK), 
             dbo.DxHData dxh WITH(NOLOCK)
        WHERE dxh.dxhdata_id = @DxHData_Id
              AND o.asset_id = dxh.asset_id
              AND o.is_current_order = 1
        ORDER BY o.start_time DESC;

        -- If there is no is_current_order = 1, try using Timestamp
        IF ISNULL(@OrderNumber, '') = ''
            BEGIN
                SELECT TOP 1 @Asset_Id = dxh.asset_id, 
                             @Order_Id = o.order_id, 
                             @OrderNumber = o.order_number, 
                             @Product_Code = o.product_code, 
                             @UOM_Code = o.UOM_code, 
                             @Order_Quantity = o.order_quantity, 
                             @Routed_Cycle_Time = o.routed_cycle_time,
							 @Order_Start_Time = o.start_time
                FROM dbo.OrderData o WITH(NOLOCK), 
                     dbo.DxHData dxh WITH(NOLOCK)
                WHERE dxh.dxhdata_id = @DxHData_Id
                      AND o.asset_id = dxh.asset_id
                      AND o.start_time < @Timestamp
                      AND (o.end_time > @Timestamp
                           OR o.end_time IS NULL)
                ORDER BY o.start_time DESC;
        END;
        IF ISNULL(@OrderNumber, '') = ''
            BEGIN
                SELECT @ReturnStatus = -1, 
                       @ReturnMessage = 'Current Order not found for asset ' + CONVERT(NVARCHAR, ISNULL(@Asset_Id, ''));
                GOTO ErrExit;
        END;

        
		SELECT @Target_Percent_Of_Ideal = target_percent_of_ideal
		FROM dbo.Asset
		WHERE asset_id = @Asset_Id;

        SELECT @Site_Id = asset_id
        FROM [dbo].[Asset]
        WHERE asset_level = 'Site'
              AND site_code =
        (
            SELECT site_code
            FROM [dbo].[Asset]
            WHERE asset_id = @Asset_Id
        );

        -- Now to decide if it is an insert or some kind of update
        -- If there is a productiondata row for this hour and order, then it is an update (increment or override)
        -- If not, it is an insert

        SELECT @ProductionData_Id = pd.productiondata_id, 
               @Existing_Actual = pd.actual, 
               @Existing_Setup_Scrap = pd.setup_scrap, 
               @Existing_Other_Scrap = pd.other_scrap
        FROM dbo.ProductionData pd WITH(NOLOCK)
        WHERE pd.dxhdata_id = @DxHData_Id
              AND pd.order_id = @Order_Id;
        IF ISNULL(@ProductionData_Id, 0) > 0 
        --Since it already exixts, this is an update, either an increment existing or replace if an override
            BEGIN

                --Increment 
                IF ISNULL(@Override, 0) = 0
                    BEGIN
                        UPDATE dbo.ProductionData
                          SET 
                              actual = @Existing_Actual + @ActualInt, 
                              setup_scrap = @Existing_Setup_Scrap + @Setup_Scrap, 
                              other_scrap = @Existing_Other_Scrap + @Other_Scrap,
                              last_modified_by = @Initials, 
                              last_modified_on = GETDATE()
                        FROM dbo.ProductionData pd
                        WHERE pd.productiondata_id = @ProductionData_Id;
                        SELECT @ReturnStatus = 0, 
                               @ReturnMessage = 'Incremented ' + CONVERT(NVARCHAR, @ProductionData_Id);
                END;
                    ELSE
                    BEGIN		
                        -- If there already is a productiondata row and this is an override, then they should match  
                        IF ISNULL(@Override, 0) <> ISNULL(@ProductionData_Id, 0)
                            BEGIN
                                SELECT @ReturnStatus = -1, 
                                       @ReturnMessage = 'Invalid Override ' + CONVERT(NVARCHAR, ISNULL(@Override, ''));
                                GOTO ErrExit;
                        END;
                        -- If it makes it to here, then override/replace existing with @Actual 
                        --
                        UPDATE dbo.ProductionData
                          SET 
                              actual = @ActualInt, 
                              setup_scrap = @Setup_Scrap, 
                              other_scrap = @Other_Scrap,
                              last_modified_by = @Initials, 
                              last_modified_on = GETDATE()
                        FROM dbo.ProductionData pd
                        WHERE pd.productiondata_id = @ProductionData_Id;
                        SELECT @ReturnStatus = 0, 
                               @ReturnMessage = 'Override ' + CONVERT(NVARCHAR, @ProductionData_Id);
                END;
        END --if ProductionData_Id exists;
            ELSE
        --do an insert, including computing ideal and target
            BEGIN

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

                SELECT @Produced_Quantity = SUM(actual-setup_scrap-other_scrap)
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
                --case when @TimeStamp is between the break, the remaining break is from @Timestamp to end of the break,
                --case when break is in the hour but @Timestamp is less than start break time, the remaining break is the full break duration
                --case when break was before the @Timestamp, the break is not count.
                --logic not support break time that start before the current hour or finish in the next hour


				--Check if we need to use the full hour or the actual minutes to get ideal and target
				SELECT @Previous_Production_Id = PD.productiondata_id
				FROM dbo.ProductionData PD WHERE PD.order_id = @Order_Id;

				IF ISNULL(@Previous_Production_Id,0) = 0
				BEGIN
				--IS THE FIRST ORDER
                SELECT @Remaining_BreakMinutes = SUM(CASE
                                                         WHEN(@Timestamp BETWEEN CONCAT(FORMAT(@Timestamp, 'yyyy-MM-dd'), ' ', u.start_time) AND CONCAT(FORMAT(@Timestamp, 'yyyy-MM-dd'), ' ', u.end_time))
                                                         THEN DATEDIFF(MINUTE, @Timestamp, CONCAT(FORMAT(@Timestamp, 'yyyy-MM-dd'), ' ', u.end_time))
                                                         WHEN(@Timestamp <= CONCAT(FORMAT(@Timestamp, 'yyyy-MM-dd'), ' ', u.start_time)
                                                              AND DATEADD(HOUR, DATEPART(HOUR, @Timestamp) + 1, CONVERT(DATETIME, FORMAT(@Timestamp, 'yyyy-MM-dd'))) >= CONCAT(FORMAT(@Timestamp, 'yyyy-MM-dd'), ' ', u.end_time))
                                                         THEN u.duration_in_minutes
                                                         ELSE 0
                                                     END)
                FROM dbo.Unavailable u
                WHERE u.asset_id = @Asset_Id AND u.status = 'Active' AND ((@Timestamp BETWEEN CONCAT(FORMAT(@Timestamp, 'yyyy-MM-dd'), ' ', u.start_time) AND CONCAT(FORMAT(@Timestamp, 'yyyy-MM-dd'), ' ', u.end_time))
                     OR (@Timestamp <= CONCAT(FORMAT(@Timestamp, 'yyyy-MM-dd'), ' ', u.start_time)
                         AND DATEADD(HOUR, DATEPART(HOUR, @Timestamp) + 1, CONVERT(DATETIME, FORMAT(@Timestamp, 'yyyy-MM-dd'))) >= CONCAT(FORMAT(@Timestamp, 'yyyy-MM-dd'), ' ', u.end_time)))
                GROUP BY asset_id;
				END
				ELSE
				BEGIN
				SELECT @Remaining_BreakMinutes = SUM(u.duration_in_minutes)
													FROM dbo.Unavailable u
													WHERE u.asset_id = @Asset_Id AND u.status = 'Active' AND 
													CONCAT(FORMAT(@Timestamp, 'yyyy-MM-dd HH'),':00:00') <= CONCAT(FORMAT(@Timestamp, 'yyyy-MM-dd'), ' ', u.start_time) 
													AND DATEADD(HOUR,1,CONVERT(DATETIME,CONCAT(FORMAT(@Timestamp, 'yyyy-MM-dd HH'),':00:00'))) >= CONCAT(FORMAT(@Timestamp, 'yyyy-MM-dd'), ' ', u.end_time)
													GROUP BY asset_id;
				END

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

				--EXIST PREVIOUS PRODUCTION USE FULL HOUR
				IF ISNULL(@Previous_Production_Id,0) > 0 
				BEGIN
					SET @Minutes_Less = 0;
				END
				ELSE
				BEGIN
					--IF THE NEW PRODUCTION DATA IS THE FIRST PRODUCTION OF THE CURRENT ORDER AND BETWEEN THE FIRST HOUR OF THE START TIME ORDER USE REMAINING MINUTES
					IF @Timestamp BETWEEN CONCAT(FORMAT(@Order_Start_Time, 'yyyy-MM-dd HH'),':00:00') AND DATEADD(HOUR,1,CONVERT(DATETIME,CONCAT(FORMAT(@Order_Start_Time, 'yyyy-MM-dd HH'),':00:00')))
					BEGIN
						SET @Minutes_Less = DATEPART(MINUTE, @Timestamp);
					END
					--IF THE NEW PRODUCTION DATA IS THE FIRST PRODUCTION OF THE CURRENT ORDER AND THE PRODUCTION START AFTER THE FIRST HOUR OF THE ORDER WE USE FULL HOUR
					ELSE
					BEGIN
						SET @Minutes_Less = 0;
					END
				END


				--Calculate remaining minutes using in the target formula (use remaining break minutes)

                SET @Remaining_Minutes = (60 - @Remaining_BreakMinutes) - @Minutes_Less;
                IF ISNULL(@Remaining_Minutes, -1) < 0
                    BEGIN
                        SELECT @Remaining_Minutes = 0;
                END;

				--Calculate total remaining minutes using in the ideal formula (not use remaining break minutes)

                SELECT @TotalRemaining_Minutes = 60 - @Minutes_Less;
                IF ISNULL(@TotalRemaining_Minutes, -1) < 0
                    BEGIN
                        SELECT @TotalRemaining_Minutes = 0;
                END;

                --Ideal
                --If (Remaining Seconds in an hour / Routed Cycle Time) > Remaining Quantity
                --then Ideal = Remaining Quantity 
                --Else Remaining Seconds in an hour / Routed Cycle Time

                IF((@TotalRemaining_Minutes * 60.0) / @Routed_Cycle_Time) > @Remaining_Quantity
                    BEGIN
                        SET @Ideal = @Remaining_Quantity;
                END;
                    ELSE
                    BEGIN
                        SET @Ideal = (@TotalRemaining_Minutes * 60.0) / @Routed_Cycle_Time;
                END;

                --Target
                IF(((@Remaining_Minutes * 60.0) / @Routed_Cycle_Time) * @Target_Percent_Of_Ideal) > @Remaining_Quantity
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
                 @ActualInt, 
                 @UOM_Code, 
                 @Order_Id, 
                 @OrderNumber, 
                 @Timestamp, 
                 NULL, 
                 @Initials, 
                 GETDATE(), 
                 @Initials, 
                 GETDATE(), 
                 @Setup_Scrap, 
                 @Other_Scrap,
                 @First_Name + ' ' + @Last_Name
                );
                SET @ProductionData_Id = SCOPE_IDENTITY();
                
				SELECT @ReturnStatus = 0, 
                       @ReturnMessage = 'Inserted ' + CONVERT(NVARCHAR, @ProductionData_Id);
        END;
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
