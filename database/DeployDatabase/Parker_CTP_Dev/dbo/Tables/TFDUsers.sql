CREATE TABLE [dbo].[TFDUsers] (
    [ID]               INT            IDENTITY (1, 1) NOT NULL,
    [Badge]            NVARCHAR (50)  NOT NULL,
    [Username]         NVARCHAR (50)  NULL,
    [First_Name]       NVARCHAR (50)  NOT NULL,
    [Last_Name]        NVARCHAR (50)  NOT NULL,
    [Site]             INT            NOT NULL,
    [role_id]          INT            NOT NULL,
    [status]           NVARCHAR (50)  CONSTRAINT [DF_TFDUsers_status] DEFAULT (N'Active') NOT NULL,
    [entered_by]       NVARCHAR (100) CONSTRAINT [DF_TFDUsers_entered_by] DEFAULT (N'SQL Manual Entry') NOT NULL,
    [entered_on]       DATETIME       CONSTRAINT [DF_TFDUsers_entered_on] DEFAULT (getdate()) NOT NULL,
    [last_modified_by] NVARCHAR (100) CONSTRAINT [DF_TFDUsers_last_modified_by] DEFAULT (N'SQL Manual Entry') NOT NULL,
    [last_modified_on] DATETIME       CONSTRAINT [DF_TFDUsers_last_modified_on] DEFAULT (getdate()) NOT NULL,
    [escalation_id]    INT            NULL,
    CONSTRAINT [PK_TFDUSERS_ID] PRIMARY KEY CLUSTERED ([ID] ASC),
    CONSTRAINT [FK_TFDUsers_Asset] FOREIGN KEY ([Site]) REFERENCES [dbo].[Asset] ([asset_id]),
    CONSTRAINT [FK_TFDUsers_escalation_id] FOREIGN KEY ([escalation_id]) REFERENCES [dbo].[Escalation] ([escalation_id]),
    CONSTRAINT [FK_TFDUsers_Role_Id] FOREIGN KEY ([role_id]) REFERENCES [dbo].[Role] ([role_id])
);

