CREATE TABLE [dbo].[UOM] (
    [UOM_id]           INT            IDENTITY (1, 1) NOT NULL,
    [UOM_code]         NVARCHAR (100) NULL,
    [UOM_name]         NVARCHAR (200) NULL,
    [UOM_description]  NVARCHAR (256) NULL,
    [status]           VARCHAR (50)   NOT NULL,
    [entered_by]       NVARCHAR (100) NULL,
    [entered_on]       DATETIME       NOT NULL,
    [last_modified_by] NVARCHAR (100) NULL,
    [last_modified_on] DATETIME       NOT NULL,
    [site_id]          INT            NOT NULL,
    [decimals]         BIT            NULL,
    CONSTRAINT [PK_UOM_UOM_ID] PRIMARY KEY CLUSTERED ([UOM_id] ASC),
    CONSTRAINT [UNC_UOM_UOM_Code] UNIQUE NONCLUSTERED ([UOM_code] ASC)
);

