CREATE TABLE [dbo].[Product] (
    [product_id]          INT            IDENTITY (1, 1) NOT NULL,
    [product_code]        NVARCHAR (100) NULL,
    [product_name]        NVARCHAR (100) NULL,
    [product_description] NVARCHAR (256) NULL,
    [product_family]      NVARCHAR (100) NULL,
    [value_stream]        NVARCHAR (100) NULL,
    [grouping1]           NVARCHAR (256) NULL,
    [grouping2]           NVARCHAR (256) NULL,
    [grouping3]           NVARCHAR (256) NULL,
    [grouping4]           NVARCHAR (256) NULL,
    [grouping5]           NVARCHAR (256) NULL,
    [status]              VARCHAR (50)   NOT NULL,
    [entered_by]          NVARCHAR (100) NULL,
    [entered_on]          DATETIME       NOT NULL,
    [last_modified_by]    NVARCHAR (100) NULL,
    [last_modified_on]    DATETIME       NOT NULL,
    [asset_id]            INT            NULL,
    CONSTRAINT [PK_Product_Product_Id] PRIMARY KEY CLUSTERED ([product_id] ASC)
);

