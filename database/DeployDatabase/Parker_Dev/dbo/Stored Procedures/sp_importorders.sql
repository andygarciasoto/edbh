
CREATE PROCEDURE [dbo].[sp_importorders] (@order_number AS VARCHAR(100),
@asset_code AS varchar(100),
@product_code AS varchar(100),
@order_quantity  AS float,
@UOM_code AS VARCHAR(100),
@routed_cycle_time AS float,
@minutes_allowed_per_setup AS float,
@ideal AS float,
@target_percent_of_ideal AS float,
@production_status AS varchar(100),
@start_time as datetime,
@entered_by as varchar(100),
@entered_on as datetime
)

AS  BEGIN 
DECLARE
@TableVariable TABLE (GetDxHDataID NVARCHAR(MAX));
DECLARE
@DxHDataTemp TABLE (asset_id int,
timestamp datetime,
dxhdata_id int,
production_day datetime,
shift_code varchar(100),
hour_interval varchar(100),
message varchar(100))
DECLARE 
@setup_start_time as datetime, 
@setup_end_time as datetime, 
@production_start_time as datetime, 
@production_end_time as datetime,
@bandera as bit,
@json AS NVARCHAR(MAX),
@dxhdata_id int,
@site_code as varchar(100),
@site_id as int,
@timezone as varchar(100),
@asset_id as int

SET @site_code = (Select site_code from Asset where asset_code = @asset_code)
SET @site_id = (Select asset_id from Asset where asset_code = @site_code)
SET @timezone = (Select site_timezone from CommonParameters where site_id = @site_id)
SET @asset_id = (Select asset_id from Asset where asset_code = @asset_code)

IF @production_status = 'production'
BEGIN
SET @setup_start_time = null
SET @setup_end_time = null
SET @production_start_time = (Select GETUTCDATE() at time zone 'UTC' at time zone @timezone)
SET @production_end_time = (Select GETUTCDATE() at time zone 'UTC' at time zone @timezone)
END
ELSE
BEGIN
SET @setup_start_time = (Select GETUTCDATE() at time zone 'UTC' at time zone @timezone)
SET @setup_end_time = (Select GETUTCDATE() at time zone 'UTC' at time zone @timezone)
SET @production_start_time = null
SET @production_end_time = null
END

IF @order_quantity = 0 
BEGIN
SET @order_quantity = null
END
IF @UOM_code = ''
BEGIN
SET @UOM_code= null
END
IF @routed_cycle_time = 0 
BEGIN
SET @routed_cycle_time = null
END
IF @minutes_allowed_per_setup = 0 
BEGIN
SET @minutes_allowed_per_setup= null
END
IF @ideal = 0 
BEGIN
SET @ideal= null
END
IF @target_percent_of_ideal = 0 
BEGIN
SET @target_percent_of_ideal = null
END

SET @start_time = (Select GETUTCDATE() at time zone 'UTC' at time zone @timezone)
SET @bandera = 0

INSERT into @TableVariable exec dbo.spLocal_EY_DxH_Get_DxHDataId @asset_id, @start_time, 0
set @json =(select GetDxHDataID from @TableVariable)
INSERT INTO @DxHDataTemp SELECT *  
FROM OPENJSON(@json)  
  WITH (asset_id int '$.asset_id',  
        timestamp datetime '$.timestamp', dxhdata_id int '$.dxhdata_id',  
        production_day datetime '$.production_day', shift_code varchar(100) '$.shift_code', 
		hour_interval varchar(100) '$.hour_interval', message varchar(100) '$.message')
SET @dxhdata_id = (SELECT dxhdata_id from @DxHDataTemp)

If exists (Select * From dbo.Asset Where asset_id = @asset_id)
BEGIN

IF exists (Select * from dbo.OrderData where asset_id = @asset_id and order_number = @order_number and is_current_order = 1 and production_status = 'setup' AND @production_status = 'production' AND @bandera = 0)
BEGIN
SET @bandera = 1
UPDATE dbo.OrderData SET
			       order_quantity = @order_quantity,
				   UOM_code = @UOM_code,
				   routed_cycle_time = @routed_cycle_time,
				   minutes_allowed_per_setup = @minutes_allowed_per_setup,
				   ideal = @ideal,
				   target_percent_of_ideal = @target_percent_of_ideal,  
				   production_status = @production_status,
                   setup_end_time = (Select GETUTCDATE() at time zone 'UTC' at time zone @timezone),
				   production_start_time = (Select GETUTCDATE() at time zone 'UTC' at time zone @timezone),
				   last_modified_by = @entered_by,
				   last_modified_on = @entered_on
				   WHERE  asset_id = @asset_id and order_number = @order_number and is_current_order = 1 and production_status = 'setup' and @production_status = 'production'
END

IF exists (Select * from dbo.OrderData where asset_id = @asset_id and order_number = @order_number and is_current_order = 1 and production_status = 'setup' AND @production_status = 'setup' AND @bandera = 0)
BEGIN
SET @bandera = 1
UPDATE dbo.OrderData SET
			       order_quantity = @order_quantity,
				   UOM_code = @UOM_code,
				   routed_cycle_time = @routed_cycle_time,
				   minutes_allowed_per_setup = @minutes_allowed_per_setup,
				   ideal = @ideal,
				   target_percent_of_ideal = @target_percent_of_ideal,  
				   production_status = @production_status,
				   last_modified_by = @entered_by,
				   last_modified_on = @entered_on
				   WHERE asset_id = @asset_id and order_number = @order_number and is_current_order = 1 and production_status = 'setup' and @production_status = 'setup'
END

IF exists (Select * from dbo.OrderData where asset_id = @asset_id and order_number = @order_number and is_current_order = 1 and production_status = 'production' AND @production_status = 'production' AND @bandera = 0)
BEGIN
SET @bandera = 1
UPDATE dbo.OrderData SET
			       order_quantity = @order_quantity,
				   UOM_code = @UOM_code,
				   routed_cycle_time = @routed_cycle_time,
				   minutes_allowed_per_setup = @minutes_allowed_per_setup,
				   ideal = @ideal,
				   target_percent_of_ideal = @target_percent_of_ideal,  
				   production_status = @production_status,
				   last_modified_by = @entered_by,
				   last_modified_on = @entered_on
				   WHERE asset_id = @asset_id and order_number = @order_number and is_current_order = 1 and production_status = 'production' and @production_status = 'production'
END

IF exists (Select * from dbo.OrderData where asset_id = @asset_id and order_number = @order_number and is_current_order = 1 and production_status = 'production' AND @production_status = 'setup' AND @bandera = 0)
BEGIN
SET @bandera = 1
BEGIN
UPDATE dbo.OrderData SET
			       order_quantity = @order_quantity,
				   is_current_order = 0,
				   end_time = (Select GETUTCDATE() at time zone 'UTC' at time zone @timezone),
				   UOM_code = @UOM_code,
				   routed_cycle_time = @routed_cycle_time,
				   minutes_allowed_per_setup = @minutes_allowed_per_setup,
				   ideal = @ideal,
				   target_percent_of_ideal = @target_percent_of_ideal,  
				   production_end_time = (Select GETUTCDATE() at time zone 'UTC' at time zone @timezone),
				   last_modified_by = @entered_by,
				   last_modified_on = @entered_on
				   WHERE asset_id = @asset_id and order_number = @order_number and is_current_order = 1 and production_status = 'production' and @production_status = 'setup'
END
INSERT INTO dbo.OrderData (
order_number,
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
VALUES(
@order_number,
@product_code,
@order_quantity,
@UOM_code,
@routed_cycle_time,
@minutes_allowed_per_setup,
@ideal,
@target_percent_of_ideal,
@production_status,
(Select GETUTCDATE() at time zone 'UTC' at time zone @timezone),
null,
null,
null,
(Select GETUTCDATE() at time zone 'UTC' at time zone @timezone),
null,
1,
@entered_by,
@entered_on,
@entered_by,
@entered_on,
@asset_id)
exec spLocal_EY_DxH_Put_ProductionData @dxhdata_id, 0, 0, 0, null, 'T', 'D', @start_time, 0
END

IF EXISTS (SELECT * FROM dbo.OrderData 
WHERE
asset_id = @asset_id AND @bandera = 0)
BEGIN
IF EXISTS (SELECT * FROM dbo.OrderData 
WHERE
asset_id = @asset_id AND is_current_order = 1 AND @bandera = 0)
BEGIN
SET @bandera = 1
UPDATE dbo.OrderData SET 
				   is_current_order = 0, 
                   end_time = (Select GETUTCDATE() at time zone 'UTC' at time zone @timezone), 
				   production_end_time = (Select GETUTCDATE() at time zone 'UTC' at time zone @timezone),
				   last_modified_by = @entered_by,
				   last_modified_on = @entered_on
				   WHERE asset_id = @asset_id AND is_current_order = 1
END
INSERT INTO dbo.OrderData (
order_number,
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
VALUES(
@order_number,
@product_code,
@order_quantity,
@UOM_code,
@routed_cycle_time,
@minutes_allowed_per_setup,
@ideal,
@target_percent_of_ideal,
@production_status,
@setup_start_time,
null,
@production_start_time,
null,
(Select GETUTCDATE() at time zone 'UTC' at time zone @timezone), 
null,
1,
@entered_by,
@entered_on,
@entered_by,
@entered_on,
@asset_id)
exec spLocal_EY_DxH_Put_ProductionData @dxhdata_id, 0, 0, 0, 0, null, 'T', 'D', @start_time, 0
END

IF NOT EXISTS (SELECT * FROM dbo.OrderData 
WHERE
asset_id = @asset_id)
BEGIN
INSERT INTO dbo.OrderData (
order_number,
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
VALUES(
@order_number,
@product_code,
@order_quantity,
@UOM_code,
@routed_cycle_time,
@minutes_allowed_per_setup,
@ideal,
@target_percent_of_ideal,
@production_status,
@setup_start_time,
null,
@production_start_time,
null,
(Select GETUTCDATE() at time zone 'UTC' at time zone @timezone), 
null,
1,
@entered_by,
@entered_on,
@entered_by,
@entered_on,
@asset_id)
exec spLocal_EY_DxH_Put_ProductionData @dxhdata_id, 0, 0, 0, 0, null, 'T', 'D', @start_time, 0
END
END
END