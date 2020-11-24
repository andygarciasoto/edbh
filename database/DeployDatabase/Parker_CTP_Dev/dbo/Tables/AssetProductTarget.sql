CREATE TABLE [dbo].[AssetProductTarget] (
    [assetproducttarget_id]     INT           IDENTITY (1, 1) NOT NULL,
    [asset_code]                VARCHAR (100) NULL,
    [product_code]              VARCHAR (100) NOT NULL,
    [UOM_code]                  VARCHAR (100) NOT NULL,
    [routed_cycle_time]         FLOAT (53)    NULL,
    [minutes_allowed_per_setup] FLOAT (53)    NULL,
    [ideal]                     FLOAT (53)    NULL,
    [target_percent_of_ideal]   FLOAT (53)    NULL,
    [valid_from]                DATETIME      NOT NULL,
    [valid_to]                  DATETIME      NULL,
    [entered_by]                VARCHAR (100) NOT NULL,
    [entered_on]                DATETIME      NOT NULL,
    [last_modified_by]          VARCHAR (100) NOT NULL,
    [last_modified_on]          DATETIME      NOT NULL,
    CONSTRAINT [PK_AssetProductTarget_Id] PRIMARY KEY CLUSTERED ([assetproducttarget_id] ASC),
    CONSTRAINT [FK_APT_Asset_Code] FOREIGN KEY ([asset_code]) REFERENCES [dbo].[Asset] ([asset_code]),
    CONSTRAINT [FK_APT_Product_Code] FOREIGN KEY ([product_code]) REFERENCES [dbo].[Product] ([product_code]),
    CONSTRAINT [FK_APT_UOM_Code] FOREIGN KEY ([UOM_code]) REFERENCES [dbo].[UOM] ([UOM_code])
);

