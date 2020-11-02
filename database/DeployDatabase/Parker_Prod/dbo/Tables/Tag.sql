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
    CONSTRAINT [FK__Tag__Asset_ID] FOREIGN KEY ([asset_id]) REFERENCES [dbo].[Asset] ([asset_id])
);

