
--exec spLocal_EY_DxH_Put_Production_From_IoT '168-0065.Blowout.Length', '413591', 'SQL manual entry', '2020-07-29 11:50:59.813'
CREATE    PROCEDURE [dbo].[spLocal_EY_DxH_Put_Production_From_IoT]
(@tag_name AS      VARCHAR(200), 
 @tagdata_value AS VARCHAR(256), 
 @entered_by AS    VARCHAR(100), 
 @entered_on AS    DATETIME
)
AS
    BEGIN
        DECLARE @TagComparation TABLE
        (tagdata_id     INT, 
         current_value  FLOAT, 
         previous_value FLOAT
        );
        DECLARE @DxHDataTemp TABLE
        (asset_id       INT, 
         timestamp      DATETIME, 
         dxhdata_id     INT, 
         production_day DATETIME, 
         shift_code     VARCHAR(100), 
         hour_interval  VARCHAR(100)
        );
        DECLARE @asset_id INT, @dxhdata_id INT, @current_value FLOAT, @previous_value FLOAT, @productiondata_id AS VARCHAR(100), @value FLOAT, @actual FLOAT, @site_code VARCHAR(100), @timezone DATETIME, @setup_scrap FLOAT, @other_scrap FLOAT, @rollover_point FLOAT, @max_change FLOAT, @order_number VARCHAR(100);
        IF @tagdata_value = ''
            BEGIN
                SELECT @tagdata_value = NULL;
        END;
        IF @tagdata_value IS NULL
           OR @tagdata_value = '0'
            BEGIN
                SELECT 'Wrong message. Production won''t be inserted';
        END;
            ELSE
            BEGIN
                SELECT @asset_id = asset_id, 
                       @rollover_point = rollover_point, 
                       @max_change = max_change
                FROM dbo.Tag
                WHERE tag_name = @tag_name;
                SELECT @site_code = site_code
                FROM dbo.Asset
                WHERE asset_id = @asset_id;

                SELECT @timezone = (SELECT GETUTCDATE() AT TIME ZONE 'UTC' AT TIME ZONE site_timezone)
                FROM dbo.CommonParameters where site_name = @site_code;

                INSERT INTO dbo.TagData
                (tag_name, 
                 tagdata_value, 
                 entered_by, 
                 entered_on, 
                 last_modified_by, 
                 last_modified_on, 
                 timestamp
                )
                VALUES
                (@tag_name, 
                 @tagdata_value, 
                 @entered_by, 
                 @entered_on, 
                 @entered_by, 
                 @entered_on, 
                 @timezone
                );
                BEGIN
                    INSERT INTO @DxHDataTemp
                    EXEC dbo.spLocal_EY_DxH_Get_DxHDataId
                         @asset_id, 
                         @timezone, 
                         0;
                    SELECT @dxhdata_id = dxhdata_id
                    FROM @DxHDataTemp;
                    SELECT @order_number = order_number
                    FROM dbo.OrderData
                    WHERE asset_id = @asset_id
                          AND is_current_order = 1;
                    BEGIN
                        INSERT INTO @TagComparation
                               SELECT TOP 1 td.tagdata_id, 
                                            td.tagdata_value AS [Current value], 
                                            LAG(td.tagdata_value, 1, 0) OVER(
                                            ORDER BY td.tagdata_id) AS [Previous value]
                               FROM dbo.TagData td
                               WHERE tag_name = @tag_name
                               ORDER BY tagdata_id DESC;
                        SELECT *
                        FROM @TagComparation;
                        SELECT @previous_value = previous_value, 
                               @current_value = current_value
                        FROM @TagComparation;
                        SELECT @value = @current_value - @previous_value;
                        IF @value < 0
                            BEGIN
                                IF ABS(@value) > @max_change
                                    BEGIN
                                        SELECT @value = (@current_value + @rollover_point) - @previous_value;
                                END;
                                    ELSE
                                    BEGIN
                                        SELECT @value = 0;
                                END;
                                IF @value > @max_change
                                    BEGIN
                                        SELECT @value = @current_value;
                                END;
                        END;
						IF @value > 100000
							BEGIN
								SELECT 'Production won''t be inserted. Value is greater than 100000'
							END
							ELSE
							BEGIN
                        IF EXISTS
                        (
                            SELECT TOP 1 productiondata_id
                            FROM dbo.ProductionData
                            WHERE dxhdata_id = @dxhdata_id
                                  AND order_number = @order_number
                            ORDER BY start_time DESC
                        )
                            BEGIN
                                SELECT TOP 1 @actual = actual, 
                                             @setup_scrap = setup_scrap, 
                                             @other_scrap = other_scrap, 
                                             @productiondata_id = productiondata_id
                                FROM dbo.ProductionData
                                WHERE dxhdata_id = @dxhdata_id
                                      AND order_number = @order_number
                                ORDER BY start_time DESC;
                                SELECT @value = @value + @actual;
                                EXEC spLocal_EY_DxH_Put_ProductionData 
                                     @dxhdata_id, 
                                     @value, 
                                     @setup_scrap, 
                                     @other_scrap, 
                                     NULL, 
                                     'T', 
                                     'D', 
                                     @timezone, 
                                     @productiondata_id;
                        END;
                            ELSE
                            BEGIN
                                EXEC spLocal_EY_DxH_Put_ProductionData 
                                     @dxhdata_id, 
                                     @value, 
                                     0, 
                                     0, 
                                     NULL, 
                                     'T', 
                                     'D', 
                                     @timezone, 
                                     0;
                        END;
						END;
        END;
        END;
        END;
    END;
