CREATE TABLE [dbo].[CommentData] (
    [commentdata_id]   INT           IDENTITY (1, 1) NOT NULL,
    [dxhdata_id]       INT           NOT NULL,
    [comment]          VARCHAR (256) NULL,
    [first_name]       VARCHAR (100) NULL,
    [last_name]        VARCHAR (100) NULL,
    [entered_by]       VARCHAR (100) NOT NULL,
    [entered_on]       DATETIME      NOT NULL,
    [last_modified_by] VARCHAR (100) NOT NULL,
    [last_modified_on] DATETIME      NOT NULL,
    CONSTRAINT [PK_CommentData_CommentData_Id] PRIMARY KEY NONCLUSTERED ([commentdata_id] ASC),
    CONSTRAINT [FK_CommentData_DxHData_ID] FOREIGN KEY ([dxhdata_id]) REFERENCES [dbo].[DxHData] ([dxhdata_id])
);

