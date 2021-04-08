CREATE TABLE [dbo].[AssetDisplaySystem] (
    [assetdisplaysystem_id] INT            IDENTITY (1, 1) NOT NULL,
    [displaysystem_name]    NVARCHAR (200) NOT NULL,
    [status]                VARCHAR (50)   NOT NULL,
    [entered_by]            NVARCHAR (100) CONSTRAINT [DF_AssetDisplaySystem_entered_by] DEFAULT (N'SQL Manual Entry') NOT NULL,
    [entered_on]            DATETIME       CONSTRAINT [DF_AssetDisplaySystem_entered_on] DEFAULT (getdate()) NOT NULL,
    [last_modified_by]      NVARCHAR (100) CONSTRAINT [DF_AssetDisplaySystem_last_modified_by] DEFAULT (N'SQL Manual Entry') NOT NULL,
    [last_modified_on]      DATETIME       CONSTRAINT [DF_AssetDisplaySystem_last_modified_on] DEFAULT (getdate()) NOT NULL,
    [asset_id]              INT            NOT NULL,
    [site_id]               INT            NULL,
    CONSTRAINT [PK_AssetDisplaySystem_AssetDisplaySystem_Id] PRIMARY KEY CLUSTERED ([assetdisplaysystem_id] ASC),
    CONSTRAINT [FK_ADS_Asset_Id] FOREIGN KEY ([asset_id]) REFERENCES [dbo].[Asset] ([asset_id]),
    CONSTRAINT [UNC_ADS_Name_DisplaySystem_Name] UNIQUE NONCLUSTERED ([displaysystem_name] ASC, [status] ASC)
);

