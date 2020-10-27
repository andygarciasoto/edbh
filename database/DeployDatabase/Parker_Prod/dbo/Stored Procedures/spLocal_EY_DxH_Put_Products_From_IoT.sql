CREATE     PROCEDURE [dbo].[spLocal_EY_DxH_Put_Products_From_IoT]
(@product_code AS        VARCHAR(100), 
 @product_name AS        VARCHAR(200), 
 @product_description AS VARCHAR(256), 
 @product_family AS      VARCHAR(100), 
 @value_stream AS        VARCHAR(256), 
 @grouping1 AS           VARCHAR(256), 
 @grouping2 AS           VARCHAR(256), 
 @grouping3 AS           VARCHAR(256), 
 @grouping4 AS           VARCHAR(256), 
 @grouping5 AS           VARCHAR(256), 
 @status AS              VARCHAR(50), 
 @entered_by AS          VARCHAR(100), 
 @timestamp AS           DATETIME
)
AS
    BEGIN
        IF @product_description = ''
            SET @product_description = NULL;
        IF @product_family = ''
            SET @product_family = NULL;
        IF @value_stream = ''
            SET @value_stream = NULL;
        IF @grouping1 = ''
            SET @grouping1 = NULL;
        IF @grouping2 = ''
            SET @grouping2 = NULL;
        IF @grouping3 = ''
            SET @grouping3 = NULL;
        IF @grouping4 = ''
            SET @grouping4 = NULL;
        IF @grouping5 = ''
            SET @grouping5 = NULL;
        IF EXISTS
        (
            SELECT *
            FROM dbo.Product
            WHERE product_code = @product_code
        )
            BEGIN
                UPDATE dbo.Product
                  SET 
                      product_name = @product_name, 
                      product_description = @product_description, 
                      product_family = @product_family, 
                      value_stream = @value_stream, 
                      grouping1 = @grouping1, 
                      grouping2 = @grouping2, 
                      grouping3 = @grouping3, 
                      grouping4 = @grouping4, 
                      grouping5 = @grouping5, 
                      STATUS = @status, 
                      last_modified_by = @entered_by, 
                      last_modified_on = @timestamp
                WHERE product_code = @product_code;
        END;
            ELSE
            BEGIN
                INSERT INTO dbo.Product
                (product_code, 
                 product_name, 
                 product_description, 
                 product_family, 
                 value_stream, 
                 grouping1, 
                 grouping2, 
                 grouping3, 
                 grouping4, 
                 grouping5, 
                 STATUS, 
                 entered_by, 
                 entered_on, 
                 last_modified_by, 
                 last_modified_on
                )
                VALUES
                (@product_code, 
                 @product_name, 
                 @product_description, 
                 @product_family, 
                 @value_stream, 
                 @grouping1, 
                 @grouping2, 
                 @grouping3, 
                 @grouping4, 
                 @grouping5, 
                 @status, 
                 @entered_by, 
                 @timestamp, 
                 @entered_by, 
                 @timestamp
                );
        END;
    END;
