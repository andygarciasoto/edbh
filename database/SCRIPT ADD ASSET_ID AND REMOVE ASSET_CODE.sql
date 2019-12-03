--ADD COLUMN ASSET_ID TO REPLACE ASSET_CODE

ALTER TABLE [dbo].[AssetDisplaySystem] ADD [asset_id] INT NULL, FOREIGN KEY([asset_id]) REFERENCES [dbo].[Asset]([asset_id]);

ALTER TABLE [dbo].[DTReason] ADD [asset_id] INT NULL, FOREIGN KEY([asset_id]) REFERENCES [dbo].[Asset]([asset_id]);

ALTER TABLE [dbo].[DxHData] ADD [asset_id] INT NULL, FOREIGN KEY([asset_id]) REFERENCES [dbo].[Asset]([asset_id]);

ALTER TABLE [dbo].[InterShiftData] ADD [asset_id] INT NULL, FOREIGN KEY([asset_id]) REFERENCES [dbo].[Asset]([asset_id]);

ALTER TABLE [dbo].[OrderData] ADD [asset_id] INT NULL, FOREIGN KEY([asset_id]) REFERENCES [dbo].[Asset]([asset_id]);

ALTER TABLE [dbo].[Shift] ADD [asset_id] INT NULL, FOREIGN KEY([asset_id]) REFERENCES [dbo].[Asset]([asset_id]);

ALTER TABLE [dbo].[SupervisorAsset] ADD [asset_id] INT NULL, FOREIGN KEY([asset_id]) REFERENCES [dbo].[Asset]([asset_id]);

ALTER TABLE [dbo].[Tag] ADD [asset_id] INT NULL, FOREIGN KEY([asset_id]) REFERENCES [dbo].[Asset]([asset_id]);

ALTER TABLE [dbo].[Unavailable] ADD [asset_id] INT NULL, FOREIGN KEY([asset_id]) REFERENCES [dbo].[Asset]([asset_id]);

--UPDATE NEW ASSET_ID COLUMN WITH THE CORRECT ID FROM ASSET_TABLE BASE ON ACTUAL ASSET_CODE

UPDATE Table_A SET Table_A.[asset_id] = Table_B.[asset_id]
FROM [dbo].[AssetDisplaySystem] as Table_A
INNER JOIN [dbo].[Asset] as Table_B ON Table_A.[asset_code] = Table_B.[asset_code];

UPDATE Table_A SET Table_A.[asset_id] = Table_B.[asset_id]
FROM [dbo].[DTReason] as Table_A
INNER JOIN [dbo].[Asset] as Table_B ON Table_A.[asset_code] = Table_B.[asset_code];

UPDATE Table_A SET Table_A.[asset_id] = Table_B.[asset_id]
FROM [dbo].[DxHData] as Table_A
INNER JOIN [dbo].[Asset] as Table_B ON Table_A.[asset_code] = Table_B.[asset_code];

UPDATE Table_A SET Table_A.[asset_id] = Table_B.[asset_id]
FROM [dbo].[InterShiftData] as Table_A
INNER JOIN [dbo].[Asset] as Table_B ON Table_A.[asset_code] = Table_B.[asset_code];

UPDATE Table_A SET Table_A.[asset_id] = Table_B.[asset_id]
FROM [dbo].[OrderData] as Table_A
INNER JOIN [dbo].[Asset] as Table_B ON Table_A.[asset_code] = Table_B.[asset_code];

UPDATE Table_A SET Table_A.[asset_id] = Table_B.[asset_id]
FROM [dbo].[Shift] as Table_A
INNER JOIN [dbo].[Asset] as Table_B ON Table_A.[asset_code] = Table_B.[asset_code];

UPDATE Table_A SET Table_A.[asset_id] = Table_B.[asset_id]
FROM [dbo].[SupervisorAsset] as Table_A
INNER JOIN [dbo].[Asset] as Table_B ON Table_A.[asset_code] = Table_B.[asset_code];

UPDATE Table_A SET Table_A.[asset_id] = Table_B.[asset_id]
FROM [dbo].[Tag] as Table_A
INNER JOIN [dbo].[Asset] as Table_B ON Table_A.[asset_code] = Table_B.[asset_code];

UPDATE Table_A SET Table_A.[asset_id] = Table_B.[asset_id]
FROM [dbo].[Unavailable] as Table_A
INNER JOIN [dbo].[Asset] as Table_B ON Table_A.[asset_code] = Table_B.[asset_code];

--DROP ASSET_CODE COLUMN (UNUSED) FROM TABLES

ALTER TABLE [dbo].[AssetDisplaySystem] DROP COLUMN [asset_code];

DROP INDEX [dbo].[DTReason].[UIX_DTReason_DTReason_Code];
DROP INDEX [dbo].[DTReason].[UIX_DTReason_DTReason_Name];
DROP INDEX [dbo].[DTReason].[dtreason_index];
ALTER TABLE [dbo].[DTReason] DROP COLUMN [asset_code];

DROP INDEX [dbo].[DxHData].[dxhdata_index];
ALTER TABLE [dbo].[DxHData] DROP COLUMN [asset_code];

ALTER TABLE [dbo].[InterShiftData] DROP COLUMN [asset_code];

DROP INDEX [dbo].[OrderData].[orderdata_index];
ALTER TABLE [dbo].[OrderData] DROP COLUMN [asset_code];

ALTER TABLE [dbo].[Shift] DROP COLUMN [asset_code];

ALTER TABLE [dbo].[SupervisorAsset] DROP COLUMN [asset_code];

ALTER TABLE [dbo].[Tag] DROP COLUMN [asset_code];

DROP INDEX [dbo].[Unavailable].[UIX_Unavailable_Unavailable_Code];
DROP INDEX [dbo].[Unavailable].[UIX_Unavailable_Unavailable_Name];
ALTER TABLE [dbo].[Unavailable] DROP COLUMN [asset_code];

