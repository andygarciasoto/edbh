CREATE TABLE [dbo].[TagData] (
    [tagdata_id]       INT           IDENTITY (1, 1) NOT NULL,
    [tag_name]         VARCHAR (200) NOT NULL,
    [tagdata_value]    VARCHAR (256) NULL,
    [entered_by]       VARCHAR (100) NOT NULL,
    [entered_on]       DATETIME      NOT NULL,
    [last_modified_by] VARCHAR (100) NOT NULL,
    [last_modified_on] DATETIME      NOT NULL,
    [timestamp]        DATETIME      NULL,
    CONSTRAINT [PK_TagData_TagData_Id] PRIMARY KEY NONCLUSTERED ([tagdata_id] ASC)
);


GO
CREATE NONCLUSTERED INDEX [nci_wi_TagData_837CA6E0CC88E5CA58438CADAC108229]
    ON [dbo].[TagData]([tag_name] ASC)
    INCLUDE([tagdata_id], [tagdata_value]);

