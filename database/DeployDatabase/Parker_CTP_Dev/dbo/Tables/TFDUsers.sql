CREATE TABLE [dbo].[TFDUsers] (
    [ID]         INT            IDENTITY (1, 1) NOT NULL,
    [Badge]      NVARCHAR (50)  NULL,
    [Username]   NVARCHAR (50)  NULL,
    [First_Name] NVARCHAR (50)  NULL,
    [Last_Name]  NVARCHAR (50)  NULL,
    [Role]       NVARCHAR (100) NULL,
    [Site]       INT            NULL,
    [role_id]    INT            NOT NULL,
    CONSTRAINT [PK_TFDUSERS_ID] PRIMARY KEY CLUSTERED ([ID] ASC),
    CONSTRAINT [FK_TFDUsers_Asset] FOREIGN KEY ([Site]) REFERENCES [dbo].[Asset] ([asset_id]),
    CONSTRAINT [FK_TFDUsers_Role_Id] FOREIGN KEY ([role_id]) REFERENCES [dbo].[Role] ([role_id])
);

