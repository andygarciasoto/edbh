CREATE TABLE [dbo].[AssetDisplaySystem] (
    [assetdisplaysystem_id] INT            IDENTITY (1, 1) NOT NULL,
    [displaysystem_name]    NVARCHAR (200) NULL,
    [status]                VARCHAR (50)   CONSTRAINT [DF_AssetDisplaySystem_status] DEFAULT ('Active') NOT NULL,
    [entered_by]            NVARCHAR (100) CONSTRAINT [DF_AssetDisplaySystem_entered_by] DEFAULT (N'N''SQL Manual Entry''') NULL,
    [entered_on]            DATETIME       CONSTRAINT [DF_AssetDisplaySystem_entered_on] DEFAULT (getdate()) NOT NULL,
    [last_modified_by]      NVARCHAR (100) CONSTRAINT [DF_AssetDisplaySystem_last_modified_by] DEFAULT (N'SQL Manual Entry') NULL,
    [last_modified_on]      DATETIME       CONSTRAINT [DF_AssetDisplaySystem_last_modified_on] DEFAULT (getdate()) NOT NULL,
    [asset_id]              INT            NULL,
    [site_id]               INT            CONSTRAINT [DF_AssetDisplaySystem_site_id] DEFAULT ((1)) NOT NULL,
    CONSTRAINT [PK_AssetDisplaySystem_AssetDisplaySystem_Id] PRIMARY KEY CLUSTERED ([assetdisplaysystem_id] ASC),
    CONSTRAINT [FK_ADS_Asset_Id] FOREIGN KEY ([asset_id]) REFERENCES [dbo].[Asset] ([asset_id]),
    CONSTRAINT [UNC_ADS_Name_DisplaySystem_Name] UNIQUE NONCLUSTERED ([displaysystem_name] ASC, [status] ASC)
);

