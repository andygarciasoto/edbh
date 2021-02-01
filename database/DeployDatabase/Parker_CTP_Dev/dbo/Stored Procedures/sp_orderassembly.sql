
CREATE       PROCEDURE [dbo].[sp_orderassembly] (@order_number as VARCHAR(100),
@asset_code as VARCHAR(100))

 AS  BEGIN 
 DECLARE
 @json_out							nVarchar(max),
 @asset_id							int
 SET @asset_id = (SELECT asset_id from Asset where asset_code = @asset_code)
IF EXISTS (SELECT * FROM dbo.OrderData
WHERE
order_number = @order_number and asset_id = @asset_id and is_current_order = 1)
BEGIN
SET @json_out = (SELECT * FROM dbo.OrderData where 
order_number = @order_number and asset_id = @asset_id and is_current_order = 1 for JSON AUTO, INCLUDE_NULL_VALUES)
END

SELECT @json_out as 'GetOrderAssembly'
END
