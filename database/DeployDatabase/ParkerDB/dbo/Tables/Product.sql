CREATE TABLE [dbo].[Product] (
    [product_id]          INT           IDENTITY (1, 1) NOT NULL,
    [product_code]        VARCHAR (100) NOT NULL,
    [product_name]        VARCHAR (200) NOT NULL,
    [product_description] VARCHAR (256) NULL,
    [product_family]      VARCHAR (100) NULL,
    [value_stream]        VARCHAR (100) NULL,
    [grouping1]           VARCHAR (256) NULL,
    [grouping2]           VARCHAR (256) NULL,
    [grouping3]           VARCHAR (256) NULL,
    [grouping4]           VARCHAR (256) NULL,
    [grouping5]           VARCHAR (256) NULL,
    [status]              VARCHAR (50)  NOT NULL,
    [entered_by]          VARCHAR (100) NOT NULL,
    [entered_on]          DATETIME      NOT NULL,
    [last_modified_by]    VARCHAR (100) NOT NULL,
    [last_modified_on]    DATETIME      NOT NULL,
    [asset_id]            INT           NULL,
    CONSTRAINT [PK_Product_Product_Id] PRIMARY KEY NONCLUSTERED ([product_id] ASC)
);

