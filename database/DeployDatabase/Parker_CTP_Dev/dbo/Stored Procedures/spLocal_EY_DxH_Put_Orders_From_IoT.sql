CREATE      PROCEDURE [dbo].[spLocal_EY_DxH_Put_Orders_From_IoT]
(@order_number AS              VARCHAR(100), 
 @asset_code AS                VARCHAR(100), 
 @product_code AS              VARCHAR(100), 
 @order_quantity AS            FLOAT, 
 @UOM_code AS                  VARCHAR(100), 
 @routed_cycle_time AS         FLOAT, 
 @minutes_allowed_per_setup AS FLOAT, 
 @ideal AS                     FLOAT, 
 @target_percent_of_ideal AS   FLOAT, 
 @production_status AS         VARCHAR(100), 
 @start_time AS                DATETIME, 
 @entered_by AS                VARCHAR(100), 
 @entered_on AS                DATETIME
)
AS
    BEGIN
        DECLARE @DxHDataTemp TABLE
        (asset_id       INT, 
         timestamp      DATETIME, 
         dxhdata_id     INT, 
         production_day DATETIME, 
         shift_code     VARCHAR(100), 
         hour_interval  VARCHAR(100)
        );
        DECLARE @setup_start_time AS DATETIME, @setup_end_time AS DATETIME, @production_start_time AS DATETIME, @production_end_time AS DATETIME, @bandera AS BIT, @json AS NVARCHAR(MAX), @dxhdata_id INT, @site_code AS VARCHAR(100), @site_id AS INT, @timezone AS VARCHAR(100), @asset_id AS INT;
        SET @site_code =
        (
            SELECT site_code
            FROM Asset
            WHERE asset_code = @asset_code
        );
        SET @site_id =
        (
            SELECT asset_id
            FROM Asset
            WHERE asset_code = @site_code
        );
        SET @timezone =
        (
            SELECT site_timezone
            FROM CommonParameters
            WHERE site_id = @site_id
        );
        SET @asset_id =
        (
            SELECT asset_id
            FROM Asset
            WHERE asset_code = @asset_code
        );
        IF @production_status = 'production'
            BEGIN
                SET @setup_start_time = NULL;
                SET @setup_end_time = NULL;
                SET @production_start_time = (SELECT GETUTCDATE() AT TIME ZONE 'UTC' AT TIME ZONE @timezone);
                SET @production_end_time = (SELECT GETUTCDATE() AT TIME ZONE 'UTC' AT TIME ZONE @timezone);
        END;
            ELSE
            BEGIN
                SET @setup_start_time = (SELECT GETUTCDATE() AT TIME ZONE 'UTC' AT TIME ZONE @timezone);
                SET @setup_end_time = (SELECT GETUTCDATE() AT TIME ZONE 'UTC' AT TIME ZONE @timezone);
                SET @production_start_time = NULL;
                SET @production_end_time = NULL;
        END;
        IF @order_quantity = 0
            BEGIN
                SET @order_quantity = NULL;
        END;
        IF @UOM_code = ''
            BEGIN
                SET @UOM_code = NULL;
        END;
        IF @routed_cycle_time = 0
            BEGIN
                SET @routed_cycle_time = NULL;
        END;
        IF @minutes_allowed_per_setup = 0
            BEGIN
                SET @minutes_allowed_per_setup = NULL;
        END;
        IF @ideal = 0
            BEGIN
                SET @ideal = NULL;
        END;
        IF @target_percent_of_ideal = 0
            BEGIN
                SET @target_percent_of_ideal = NULL;
        END;

        SET @start_time =  (SELECT GETUTCDATE() AT TIME ZONE 'UTC' AT TIME ZONE @timezone);
        SET @bandera = 0;
        INSERT INTO @DxHDataTemp
        EXEC dbo.spLocal_EY_DxH_Get_DxHDataId 
             @asset_id, 
             @start_time, 
             0;
        SET @dxhdata_id =
        (
            SELECT dxhdata_id
            FROM @DxHDataTemp
        );
        IF EXISTS
        (
            SELECT *
            FROM dbo.Asset
            WHERE asset_id = @asset_id
        )
            BEGIN
                IF EXISTS
                (
                    SELECT *
                    FROM dbo.OrderData
                    WHERE asset_id = @asset_id
                          AND order_number = @order_number
                          AND is_current_order = 1
                          AND production_status = 'setup'
                          AND @production_status = 'production'
                          AND @bandera = 0
                )
                    BEGIN
                        SET @bandera = 1;
                        UPDATE dbo.OrderData
                          SET 
                              order_quantity = @order_quantity, 
                              UOM_code = @UOM_code, 
                              routed_cycle_time = @routed_cycle_time, 
                              minutes_allowed_per_setup = @minutes_allowed_per_setup, 
                              ideal = @ideal, 
                              target_percent_of_ideal = @target_percent_of_ideal, 
                              production_status = @production_status,
                              setup_end_time = (SELECT GETUTCDATE() AT TIME ZONE 'UTC' AT TIME ZONE @timezone),
							  production_start_time = (SELECT GETUTCDATE() AT TIME ZONE 'UTC' AT TIME ZONE @timezone),
                              last_modified_by = @entered_by, 
                              last_modified_on = @entered_on
                        WHERE asset_id = @asset_id
                              AND order_number = @order_number
                              AND is_current_order = 1
                              AND production_status = 'setup'
                              AND @production_status = 'production';
                END;
                IF EXISTS
                (
                    SELECT *
                    FROM dbo.OrderData
                    WHERE asset_id = @asset_id
                          AND order_number = @order_number
                          AND is_current_order = 1
                          AND production_status = 'setup'
                          AND @production_status = 'setup'
                          AND @bandera = 0
                )
                    BEGIN
                        SET @bandera = 1;
                        UPDATE dbo.OrderData
                          SET 
                              order_quantity = @order_quantity, 
                              UOM_code = @UOM_code, 
                              routed_cycle_time = @routed_cycle_time, 
                              minutes_allowed_per_setup = @minutes_allowed_per_setup, 
                              ideal = @ideal, 
                              target_percent_of_ideal = @target_percent_of_ideal, 
                              production_status = @production_status, 
                              last_modified_by = @entered_by, 
                              last_modified_on = @entered_on
                        WHERE asset_id = @asset_id
                              AND order_number = @order_number
                              AND is_current_order = 1
                              AND production_status = 'setup'
                              AND @production_status = 'setup';
                END;
                IF EXISTS
                (
                    SELECT *
                    FROM dbo.OrderData
                    WHERE asset_id = @asset_id
                          AND order_number = @order_number
                          AND is_current_order = 1
                          AND production_status = 'production'
                          AND @production_status = 'production'
                          AND @bandera = 0
                )
                    BEGIN
                        SET @bandera = 1;
                        UPDATE dbo.OrderData
                          SET 
                              order_quantity = @order_quantity, 
                              UOM_code = @UOM_code, 
                              routed_cycle_time = @routed_cycle_time, 
                              minutes_allowed_per_setup = @minutes_allowed_per_setup, 
                              ideal = @ideal, 
                              target_percent_of_ideal = @target_percent_of_ideal, 
                              production_status = @production_status, 
                              last_modified_by = @entered_by, 
                              last_modified_on = @entered_on
                        WHERE asset_id = @asset_id
                              AND order_number = @order_number
                              AND is_current_order = 1
                              AND production_status = 'production'
                              AND @production_status = 'production';
                END;
                IF EXISTS
                (
                    SELECT *
                    FROM dbo.OrderData
                    WHERE asset_id = @asset_id
                          AND order_number = @order_number
                          AND is_current_order = 1
                          AND production_status = 'production'
                          AND @production_status = 'setup'
                          AND @bandera = 0
                )
                    BEGIN
                        SET @bandera = 1;
                        BEGIN
                            UPDATE dbo.OrderData
                              SET 
                                  order_quantity = @order_quantity, 
                                  is_current_order = 0,
                                  end_time = (SELECT GETUTCDATE() AT TIME ZONE 'UTC' AT TIME ZONE @timezone),
                                  UOM_code = @UOM_code, 
                                  routed_cycle_time = @routed_cycle_time, 
                                  minutes_allowed_per_setup = @minutes_allowed_per_setup, 
                                  ideal = @ideal, 
                                  target_percent_of_ideal = @target_percent_of_ideal,  
                                  production_end_time = (SELECT GETUTCDATE() AT TIME ZONE 'UTC' AT TIME ZONE @timezone),
                                  last_modified_by = @entered_by, 
                                  last_modified_on = @entered_on
                            WHERE asset_id = @asset_id
                                  AND order_number = @order_number
                                  AND is_current_order = 1
                                  AND production_status = 'production'
                                  AND @production_status = 'setup';
                END;
                        INSERT INTO dbo.OrderData
                        (order_number, 
                         product_code, 
                         order_quantity, 
                         UOM_code, 
                         routed_cycle_time, 
                         minutes_allowed_per_setup, 
                         ideal, 
                         target_percent_of_ideal, 
                         production_status, 
                         setup_start_time, 
                         setup_end_time, 
                         production_start_time, 
                         production_end_time, 
                         start_time, 
                         end_time, 
                         is_current_order, 
                         entered_by, 
                         entered_on, 
                         last_modified_by, 
                         last_modified_on, 
                         asset_id
                        )
                        VALUES
                        (@order_number, 
                         @product_code, 
                         @order_quantity, 
                         @UOM_code, 
                         @routed_cycle_time, 
                         @minutes_allowed_per_setup, 
                         @ideal, 
                         @target_percent_of_ideal, 
                         @production_status,
                         (SELECT GETUTCDATE() AT TIME ZONE 'UTC' AT TIME ZONE @timezone),
                         NULL, 
                         NULL, 
                         NULL,
                         (SELECT GETUTCDATE() AT TIME ZONE 'UTC' AT TIME ZONE @timezone),
                         NULL, 
                         1, 
                         @entered_by, 
                         @entered_on, 
                         @entered_by, 
                         @entered_on, 
                         @asset_id
                        );
                        EXEC spLocal_EY_DxH_Put_ProductionData 
                             @dxhdata_id, 
                             0, 
                             0, 
                             0, 
                             NULL, 
                             'T', 
                             'D', 
                             @start_time, 
                             0;
                END;
                IF EXISTS
                (
                    SELECT *
                    FROM dbo.OrderData
                    WHERE asset_id = @asset_id
                          AND @bandera = 0
                )
                    BEGIN
                        IF EXISTS
                        (
                            SELECT *
                            FROM dbo.OrderData
                            WHERE asset_id = @asset_id
                                  AND is_current_order = 1
                                  AND @bandera = 0
                        )
                            BEGIN
                                SET @bandera = 1;
                                UPDATE dbo.OrderData
                                  SET 
                                      is_current_order = 0, 
                                      end_time = (SELECT GETUTCDATE() AT TIME ZONE 'UTC' AT TIME ZONE @timezone),
                                      production_end_time = (SELECT GETUTCDATE() AT TIME ZONE 'UTC' AT TIME ZONE @timezone),
                                      last_modified_by = @entered_by, 
                                      last_modified_on = @entered_on
                                WHERE asset_id = @asset_id
                                      AND is_current_order = 1;
                        END;
                        INSERT INTO dbo.OrderData
                        (order_number, 
                         product_code, 
                         order_quantity, 
                         UOM_code, 
                         routed_cycle_time, 
                         minutes_allowed_per_setup, 
                         ideal, 
                         target_percent_of_ideal, 
                         production_status, 
                         setup_start_time, 
                         setup_end_time, 
                         production_start_time, 
                         production_end_time, 
                         start_time, 
                         end_time, 
                         is_current_order, 
                         entered_by, 
                         entered_on, 
                         last_modified_by, 
                         last_modified_on, 
                         asset_id
                        )
                        VALUES
                        (@order_number, 
                         @product_code, 
                         @order_quantity, 
                         @UOM_code, 
                         @routed_cycle_time, 
                         @minutes_allowed_per_setup, 
                         @ideal, 
                         @target_percent_of_ideal, 
                         @production_status, 
                         @setup_start_time, 
                         NULL, 
                         @production_start_time, 
                         NULL,
                         (SELECT GETUTCDATE() AT TIME ZONE 'UTC' AT TIME ZONE @timezone),
                         NULL, 
                         1, 
                         @entered_by, 
                         @entered_on, 
                         @entered_by, 
                         @entered_on, 
                         @asset_id
                        );
                        EXEC spLocal_EY_DxH_Put_ProductionData 
                             @dxhdata_id, 
                             0, 
                             0, 
                             0, 
                             NULL, 
                             'T', 
                             'D', 
                             @start_time, 
                             0;
                END;
                IF NOT EXISTS
                (
                    SELECT *
                    FROM dbo.OrderData
                    WHERE asset_id = @asset_id
                )
                    BEGIN
                        INSERT INTO dbo.OrderData
                        (order_number, 
                         product_code, 
                         order_quantity, 
                         UOM_code, 
                         routed_cycle_time, 
                         minutes_allowed_per_setup, 
                         ideal, 
                         target_percent_of_ideal, 
                         production_status, 
                         setup_start_time, 
                         setup_end_time, 
                         production_start_time, 
                         production_end_time, 
                         start_time, 
                         end_time, 
                         is_current_order, 
                         entered_by, 
                         entered_on, 
                         last_modified_by, 
                         last_modified_on, 
                         asset_id
                        )
                        VALUES
                        (@order_number, 
                         @product_code, 
                         @order_quantity, 
                         @UOM_code, 
                         @routed_cycle_time, 
                         @minutes_allowed_per_setup, 
                         @ideal, 
                         @target_percent_of_ideal, 
                         @production_status, 
                         @setup_start_time, 
                         NULL, 
                         @production_start_time, 
                         NULL,
                         (SELECT GETUTCDATE() AT TIME ZONE 'UTC' AT TIME ZONE @timezone),
                         NULL, 
                         1, 
                         @entered_by, 
                         @entered_on, 
                         @entered_by, 
                         @entered_on, 
                         @asset_id
                        );
                        EXEC spLocal_EY_DxH_Put_ProductionData 
                             @dxhdata_id, 
                             0, 
                             0, 
                             0, 
                             NULL, 
                             'T', 
                             'D', 
                             @start_time, 
                             0;
                END;
        END;
    END;
