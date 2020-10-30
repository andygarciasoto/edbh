
--exec sp_importtagdata 'Braider_52.PLC.FOOTAGE_COUNT', '832', 'SQL manual entry', '2020-03-30 11:50:59.813'
CREATE PROCEDURE [dbo].[sp_importtagdata_new_1] (@tag_name AS VARCHAR(200),
@tagdata_value AS varchar(256),
@entered_by as varchar(100),
@entered_on as datetime
)

AS  BEGIN 

DECLARE
@TableVariable TABLE (GetDxHDataID NVARCHAR(MAX));

DECLARE
@TagComparation TABLE (tagdata_id INT,
current_value float,
previous_value float)

DECLARE
@DxHDataTemp TABLE (asset_id int,
timestamp datetime,
dxhdata_id int,
production_day datetime,
shift_code varchar(100),
hour_interval varchar(100),
message varchar(100))

DECLARE
@json AS NVARCHAR(MAX),
@asset_id int,
@dxhdata_id int,
@current_value float,
@previous_value float,
@productiondata_id as VARCHAR(100),
@value float,
@actual float,
@site_code varchar(100),
@timezone datetime,
@setup_scrap float,
@other_scrap float,
@rollover_point float,
@max_change float,
@order_number varchar(100) 

IF @tagdata_value = '' 
BEGIN
SELECT @tagdata_value = NULL
END

IF @tagdata_value IS NULL OR @tagdata_value = '0'
BEGIN
SELECT 'Wrong message'
END

ELSE
BEGIN
SELECT 
@asset_id = asset_id,
@rollover_point = rollover_point,
@max_change = max_change
FROM dbo.Tag
WHERE tag_name = @tag_name

SELECT @site_code = site_code
FROM dbo.Asset		
WHERE asset_id = @asset_id

SELECT @timezone = (Select GETUTCDATE() at time zone 'UTC' at time zone site_timezone) 
FROM dbo.CommonParameters where site_name = @site_code

INSERT INTO dbo.TagData (
tag_name,
tagdata_value,
entered_by,
entered_on,
last_modified_by, 
last_modified_on,
timestamp
)
VALUES(
@tag_name,
@tagdata_value,
@entered_by,
@entered_on,
@entered_by,
@entered_on,
@timezone)

BEGIN
INSERT INTO @TableVariable exec dbo.spLocal_EY_DxH_Get_DxHDataId @asset_id, @timezone, 0

SELECT @json = GetDxHDataID 
FROM @TableVariable

INSERT INTO @DxHDataTemp SELECT *  
FROM OPENJSON(@json)  
  WITH (asset_id int '$.asset_id',  
        timestamp datetime '$.timestamp', dxhdata_id int '$.dxhdata_id',  
        production_day datetime '$.production_day', shift_code varchar(100) '$.shift_code', 
		hour_interval varchar(100) '$.hour_interval', message varchar(100) '$.message')

SELECT @dxhdata_id = dxhdata_id
FROM @DxHDataTemp

SELECT @order_number = order_number
FROM dbo.OrderData
WHERE asset_id = @asset_id
AND is_current_order = 1

BEGIN
INSERT INTO @TagComparation 
SELECT TOP 1
       td.tagdata_id,
       td.tagdata_value AS [Current value],
       Lag(td.tagdata_value,1,0) OVER (ORDER BY td.tagdata_id) AS [Previous value]
FROM dbo.TagData td
WHERE tag_name = @tag_name 
ORDER BY tagdata_id DESC

SELECT * FROM @TagComparation
SELECT 
@previous_value = previous_value,
@current_value = current_value 
FROM @TagComparation

SELECT @value = @current_value - @previous_value

IF @value < 0
BEGIN 

IF ABS(@value) > @max_change
BEGIN
SELECT @value = (@current_value + @rollover_point) - @previous_value
END

ELSE
BEGIN
SELECT @value = 0
END

IF @value > @max_change
BEGIN 
SELECT @value = @current_value
END  

END 

IF EXISTS (SELECT TOP 1 productiondata_id 
FROM dbo.ProductionData 
WHERE dxhdata_id = @dxhdata_id 
AND order_number = @order_number
ORDER BY start_time desc)
BEGIN

SELECT TOP 1
@actual = actual,
@setup_scrap = setup_scrap,
@other_scrap = other_scrap,
@productiondata_id = productiondata_id
FROM dbo.ProductionData 
WHERE dxhdata_id = @dxhdata_id
AND order_number = @order_number 
ORDER BY start_time desc

SELECT @value = @value + @actual
EXEC spLocal_EY_DxH_Put_ProductionData @dxhdata_id, @value, @setup_scrap, @other_scrap, null, 'T', 'D', @timezone, @productiondata_id

END
ELSE

BEGIN
EXEC spLocal_EY_DxH_Put_ProductionData @dxhdata_id, @value, 0, 0, null, 'T', 'D', @timezone, 0
END

END
END
END
END
