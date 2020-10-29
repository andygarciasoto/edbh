
CREATE    PROCEDURE [dbo].[sp_importproducts] (@product_code AS VARCHAR(100),
@product_name AS varchar(200),
@product_description AS varchar(256),
@product_family  AS varchar(100),
@value_stream AS VARCHAR(256),
@grouping1 AS varchar(256),
@grouping2 AS varchar(256),
@grouping3 AS varchar(256),
@grouping4 AS varchar(256),
@grouping5 AS varchar(256),
@status AS varchar(50),
@entered_by as varchar(100),
@timestamp as datetime
)
AS  BEGIN 
IF @product_description = '' 
SET @product_description = null
IF @product_family = '' 
SET @product_family = null
IF @value_stream = '' 
SET @value_stream = null
IF @grouping1 = '' 
SET @grouping1= null
IF @grouping2 = '' 
SET @grouping2 = null
IF @grouping3 = '' 
SET @grouping3 = null
IF @grouping4 = '' 
SET @grouping4 = null
IF @grouping5 = '' 
SET @grouping5 = null

IF EXISTS (SELECT * FROM dbo.Product 
WHERE
product_code = @product_code)
BEGIN
UPDATE dbo.Product SET 
				   product_name = @product_name, 
                   product_description = @product_description, 
                   product_family = @product_family,
				   value_stream = @value_stream,
				   grouping1 = @grouping1,
				   grouping2 = @grouping2,
				   grouping3 = @grouping3,
				   grouping4 = @grouping4,
				   grouping5 = @grouping5,
				   status = @status,
				   last_modified_by = @entered_by,
				   last_modified_on = @timestamp
				   WHERE product_code = @product_code
				   END
ELSE
BEGIN
INSERT INTO dbo.Product (product_code,product_name,product_description,product_family,value_stream,grouping1,grouping2,grouping3,grouping4,grouping5,status,entered_by,entered_on,last_modified_by,last_modified_on)
VALUES(@product_code,@product_name,@product_description,@product_family,@value_stream,@grouping1,@grouping2,@grouping3,@grouping4,@grouping5,@status,@entered_by,@timestamp,@entered_by,@timestamp)
END
END
