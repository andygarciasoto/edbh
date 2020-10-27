CREATE TABLE [dbo].[Tag] (
    [tag_id]           INT           IDENTITY (1, 1) NOT NULL,
    [tag_code]         VARCHAR (100) NOT NULL,
    [tag_name]         VARCHAR (200) NOT NULL,
    [tag_description]  VARCHAR (256) NULL,
    [tag_group]        VARCHAR (100) NULL,
    [datatype]         VARCHAR (100) NULL,
    [tag_type]         VARCHAR (100) NULL,
    [UOM_code]         VARCHAR (100) NULL,
    [rollover_point]   FLOAT (53)    NULL,
    [aggregation]      VARCHAR (100) NULL,
    [status]           VARCHAR (50)  NOT NULL,
    [entered_by]       VARCHAR (100) NOT NULL,
    [entered_on]       DATETIME      NOT NULL,
    [last_modified_by] VARCHAR (100) NOT NULL,
    [last_modified_on] DATETIME      NOT NULL,
    [site_id]          INT           NULL,
    [asset_id]         INT           NULL,
    [max_change]       INT           NULL,
    CONSTRAINT [PK_Tag_Tag_Id] PRIMARY KEY NONCLUSTERED ([tag_id] ASC),
    FOREIGN KEY ([asset_id]) REFERENCES [dbo].[Asset] ([asset_id]),
    FOREIGN KEY ([asset_id]) REFERENCES [dbo].[Asset] ([asset_id]),
    CONSTRAINT [FK_Tag_UOM_Code] FOREIGN KEY ([UOM_code]) REFERENCES [dbo].[UOM] ([UOM_code])
);


GO
CREATE UNIQUE NONCLUSTERED INDEX [UIX_Tag_Tag_Code]
    ON [dbo].[Tag]([tag_code] ASC);


GO
CREATE UNIQUE NONCLUSTERED INDEX [UIX_Tag_Tag_Name]
    ON [dbo].[Tag]([tag_name] ASC);

