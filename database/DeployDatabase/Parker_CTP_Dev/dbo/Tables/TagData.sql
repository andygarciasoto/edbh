CREATE TABLE [dbo].[TagData] (
    [tagdata_id]       INT           IDENTITY (1, 1) NOT NULL,
    [tag_name]         VARCHAR (200) NOT NULL,
    [tagdata_value]    VARCHAR (256) NULL,
    [entered_by]       VARCHAR (100) NOT NULL,
    [entered_on]       DATETIME      NOT NULL,
    [last_modified_by] VARCHAR (100) NOT NULL,
    [last_modified_on] DATETIME      NOT NULL,
    [timestamp]        DATETIME      NULL,
    CONSTRAINT [PK_TagData_TagData_Id] PRIMARY KEY CLUSTERED ([tagdata_id] ASC),
    CONSTRAINT [FK_TagData_Tag_Name] FOREIGN KEY ([tag_name]) REFERENCES [dbo].[Tag] ([tag_name])
);


GO
CREATE NONCLUSTERED INDEX [NCI_TagData_Tag_Name]
    ON [dbo].[TagData]([tag_name] ASC)
    INCLUDE([tagdata_id], [tagdata_value]);


GO
--SELECT *
--FROM TagData
--ORDER by tagdata_id desc

CREATE TRIGGER dbo.updateTagDataModifiedDate
ON dbo.TagData
AFTER INSERT, UPDATE 
AS UPDATE TagData SET last_modified_on = CURRENT_TIMESTAMP
      FROM TagData t
	    INNER JOIN inserted i
		  ON t.tagdata_id = i.tagdata_id