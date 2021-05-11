CREATE TABLE [dbo].[DTReason] (
    [dtreason_id]          INT            IDENTITY (1, 1) NOT NULL,
    [dtreason_code]        NVARCHAR (100) NOT NULL,
    [dtreason_name]        NVARCHAR (200) NOT NULL,
    [dtreason_description] NVARCHAR (256) NULL,
    [dtreason_category]    NVARCHAR (100) NULL,
    [level]                NVARCHAR (100) NULL,
    [reason1]              NVARCHAR (100) NULL,
    [reason2]              NVARCHAR (100) NULL,
    [status]               VARCHAR (50)   NOT NULL,
    [entered_by]           NVARCHAR (100) CONSTRAINT [DF_DTReason_entered_by] DEFAULT (N'SQL Manual Entry') NOT NULL,
    [entered_on]           DATETIME       CONSTRAINT [DF_DTReason_entered_on] DEFAULT (getdate()) NOT NULL,
    [last_modified_by]     NVARCHAR (100) CONSTRAINT [DF_DTReason_last_modified_by] DEFAULT (N'SQL Manual Entry') NOT NULL,
    [last_modified_on]     DATETIME       CONSTRAINT [DF_DTReason_last_modified_on] DEFAULT (getdate()) NOT NULL,
    [asset_id]             INT            NOT NULL,
    [type]                 NVARCHAR (256) NULL,
    [site_id]              INT            NULL,
    CONSTRAINT [PK_DTReason_DTReason_Id] PRIMARY KEY CLUSTERED ([dtreason_id] ASC),
    CONSTRAINT [FK_DTReason_Asset_Id] FOREIGN KEY ([asset_id]) REFERENCES [dbo].[Asset] ([asset_id])
);

