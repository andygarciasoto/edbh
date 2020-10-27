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
    [site_id]          INT           NULL,
    [decimals]         BIT           NULL,
    CONSTRAINT [PK_UOM_UOM_Id] PRIMARY KEY NONCLUSTERED ([UOM_id] ASC)
);


GO
CREATE UNIQUE NONCLUSTERED INDEX [UIX_UOM_UOM_Code]
    ON [dbo].[UOM]([UOM_code] ASC);

