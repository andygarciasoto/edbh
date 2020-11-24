CREATE TABLE [dbo].[UOM] (
    [UOM_id]           INT           IDENTITY (1, 1) NOT NULL,
    [UOM_code]         VARCHAR (100) NOT NULL,
    [UOM_name]         VARCHAR (200) NOT NULL,
    [UOM_description]  VARCHAR (256) NULL,
    [status]           VARCHAR (50)  NOT NULL,
    [entered_by]       VARCHAR (100) NOT NULL,
    [entered_on]       DATETIME      NOT NULL,
    [last_modified_by] VARCHAR (100) NOT NULL,
    [last_modified_on] DATETIME      NOT NULL,
    [site_id]          INT           DEFAULT ((1)) NOT NULL,
    [decimals]         BIT           NULL,
    CONSTRAINT [PK_UOM_UOM_ID] PRIMARY KEY CLUSTERED ([UOM_id] ASC),
    CONSTRAINT [UNC_UOM_UOM_Code] UNIQUE NONCLUSTERED ([UOM_code] ASC)
);

