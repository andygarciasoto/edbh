CREATE TABLE [dbo].[CommentData] (
    [commentdata_id]   INT            IDENTITY (1, 1) NOT NULL,
    [dxhdata_id]       INT            NOT NULL,
    [comment]          NVARCHAR (256) NULL,
    [first_name]       NVARCHAR (100) NULL,
    [last_name]        NVARCHAR (100) NULL,
    [entered_by]       NVARCHAR (100) NULL,
    [entered_on]       DATETIME       NOT NULL,
    [last_modified_by] NVARCHAR (100) NULL,
    [last_modified_on] DATETIME       NOT NULL,
    CONSTRAINT [PK_CommentData_CommentData_Id] PRIMARY KEY CLUSTERED ([commentdata_id] ASC),
    CONSTRAINT [FK_CommentData_DxHData_ID] FOREIGN KEY ([dxhdata_id]) REFERENCES [dbo].[DxHData] ([dxhdata_id])
);


GO
CREATE NONCLUSTERED INDEX [NCI_CommentData_DxHData_Id]
    ON [dbo].[CommentData]([dxhdata_id] ASC);

