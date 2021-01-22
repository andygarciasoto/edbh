CREATE TABLE [dbo].[TFDUsers] (
    [ID]         INT           IDENTITY (1, 1) NOT NULL,
    [Badge]      VARCHAR (50)  NULL,
    [Username]   VARCHAR (50)  NULL,
    [First_Name] VARCHAR (50)  NULL,
    [Last_Name]  VARCHAR (50)  NULL,
    [Role]       VARCHAR (100) NULL,
    [Site]       INT           NULL,
    CONSTRAINT [PK_TFDUSERS_ID] PRIMARY KEY CLUSTERED ([ID] ASC),
    CONSTRAINT [FK_TFDUsers_Asset] FOREIGN KEY ([Site]) REFERENCES [dbo].[Asset] ([asset_id])
);

