CREATE TABLE [dbo].[DTReason] (
    [dtreason_id]          INT            IDENTITY (1, 1) NOT NULL,
    [dtreason_code]        NVARCHAR (100) NULL,
    [dtreason_name]        NVARCHAR (200) NULL,
    [dtreason_description] NVARCHAR (256) NULL,
    [dtreason_category]    NVARCHAR (100) NULL,
    [level]                NVARCHAR (100) NULL,
    [reason1]              NVARCHAR (100) NULL,
    [reason2]              NVARCHAR (100) NULL,
    [status]               VARCHAR (50)   NOT NULL,
    [entered_by]           NVARCHAR (100) NULL,
    [entered_on]           DATETIME       NOT NULL,
    [last_modified_by]     NVARCHAR (100) NULL,
    [last_modified_on]     DATETIME       NOT NULL,
    [asset_id]             INT            NULL,
    [type]                 NVARCHAR (256) DEFAULT ('downtime') NULL,
    [site_id] INT NOT NULL DEFAULT 1, 
    CONSTRAINT [PK_DTReason_DTReason_Id] PRIMARY KEY CLUSTERED ([dtreason_id] ASC),
    CONSTRAINT [FK_DTReason_Asset_Id] FOREIGN KEY ([asset_id]) REFERENCES [dbo].[Asset] ([asset_id])
);

