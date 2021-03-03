CREATE TABLE [dbo].[DTReason] (
    [dtreason_id]          INT           IDENTITY (1, 1) NOT NULL,
    [dtreason_code]        VARCHAR (100) NOT NULL,
    [dtreason_name]        VARCHAR (200) NOT NULL,
    [dtreason_description] VARCHAR (256) NULL,
    [dtreason_category]    VARCHAR (100) NULL,
    [reason1]              VARCHAR (100) NULL,
    [reason2]              VARCHAR (100) NULL,
    [status]               VARCHAR (50)  NOT NULL,
    [entered_by]           VARCHAR (100) NOT NULL,
    [entered_on]           DATETIME      NOT NULL,
    [last_modified_by]     VARCHAR (100) NOT NULL,
    [last_modified_on]     DATETIME      NOT NULL,
    [asset_id]             INT           NULL,
    CONSTRAINT [PK_DTReason_DTReason_Id] PRIMARY KEY NONCLUSTERED ([dtreason_id] ASC),
    FOREIGN KEY ([asset_id]) REFERENCES [dbo].[Asset] ([asset_id])
);

