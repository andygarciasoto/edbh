CREATE TABLE [dbo].[AssetDisplaySystem] (
    [assetdisplaysystem_id] INT           IDENTITY (1, 1) NOT NULL,
    [displaysystem_name]    VARCHAR (200) NOT NULL,
    [status]                VARCHAR (50)  CONSTRAINT [DF_AssetDisplaySystem_status] DEFAULT ('Active') NOT NULL,
    [entered_by]            VARCHAR (100) CONSTRAINT [DF_AssetDisplaySystem_entered_by] DEFAULT ('Unknown') NOT NULL,
    [entered_on]            DATETIME      CONSTRAINT [DF_AssetDisplaySystem_entered_on] DEFAULT (getdate()) NOT NULL,
    [last_modified_by]      VARCHAR (100) CONSTRAINT [DF_AssetDisplaySystem_last_modified_by] DEFAULT ('Unknown') NOT NULL,
    [last_modified_on]      DATETIME      CONSTRAINT [DF_AssetDisplaySystem_last_modified_on] DEFAULT (getdate()) NOT NULL,
    [asset_id]              INT           NULL,
    CONSTRAINT [PK_AssetDisplaySystem_AssetDisplaySystem_Id] PRIMARY KEY NONCLUSTERED ([assetdisplaysystem_id] ASC),
    FOREIGN KEY ([asset_id]) REFERENCES [dbo].[Asset] ([asset_id])
);


GO
CREATE UNIQUE NONCLUSTERED INDEX [UIX_AssetDisplaySystem_DisplaySystem_Name]
    ON [dbo].[AssetDisplaySystem]([displaysystem_name] ASC, [status] ASC);

