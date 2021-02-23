CREATE TABLE [dbo].[TFDUsers] (
    [ID]         INT            IDENTITY (1, 1) NOT NULL,
    [Badge]      NVARCHAR (50)  NULL,
    [Username]   NVARCHAR (50)  NULL,
    [First_Name] NVARCHAR (50)  NULL,
    [Last_Name]  NVARCHAR (50)  NULL,
    [Site]       INT            NULL,
    [role_id]    INT            NOT NULL,
    [status] NVARCHAR(50) NOT NULL DEFAULT 'Active', 
    [entered_by] NVARCHAR(100) NOT NULL DEFAULT 'SQL Manual Entry', 
    [entered_on] DATETIME NOT NULL DEFAULT GETDATE(), 
    [last_modified_by] NVARCHAR(100) NOT NULL DEFAULT 'SQL Manual Entry', 
    [last_modified_on] DATETIME NOT NULL DEFAULT GETDATE(), 
    [escalation_id] INT NULL, 
    CONSTRAINT [PK_TFDUSERS_ID] PRIMARY KEY CLUSTERED ([ID] ASC),
    CONSTRAINT [FK_TFDUsers_Asset] FOREIGN KEY ([Site]) REFERENCES [dbo].[Asset] ([asset_id]),
    CONSTRAINT [FK_TFDUsers_Role_Id] FOREIGN KEY ([role_id]) REFERENCES [dbo].[Role] ([role_id]),
    CONSTRAINT [FK_TFDUsers_escalation_Id] FOREIGN KEY ([escalation_id]) REFERENCES [dbo].[Escalation] ([escalation_id])
);

