CREATE TABLE [dbo].[UOM] (
    [UOM_id]           INT            IDENTITY (1, 1) NOT NULL,
    [UOM_code]         NVARCHAR (100) NULL,
    [UOM_name]         NVARCHAR (200) NULL,
    [UOM_description]  NVARCHAR (256) NULL,
    [status]           VARCHAR (50)   NOT NULL,
    [entered_by]       NVARCHAR (100) CONSTRAINT [DF_UOM_entered_by] DEFAULT (N'SQL Manual Entry') NULL,
    [entered_on]       DATETIME       CONSTRAINT [DF_UOM_entered_on] DEFAULT (getdate()) NOT NULL,
    [last_modified_by] NVARCHAR (100) CONSTRAINT [DF_UOM_last_modified_by] DEFAULT (N'SQL Manual Entry') NULL,
    [last_modified_on] DATETIME       CONSTRAINT [DF_UOM_last_modified_on] DEFAULT (getdate()) NOT NULL,
    [site_id]          INT            NOT NULL,
    [decimals]         BIT            NULL,
    CONSTRAINT [PK_UOM_UOM_ID] PRIMARY KEY CLUSTERED ([UOM_id] ASC),
    CONSTRAINT [UNC_UOM_UOM_Code] UNIQUE NONCLUSTERED ([UOM_code] ASC)
);

