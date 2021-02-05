CREATE TABLE [dbo].[TFDUsers] (
    [Badge]      VARCHAR (50)  NOT NULL,
    [Username]   VARCHAR (50)  NULL,
    [first_name] VARCHAR (50)  NULL,
    [last_name]  VARCHAR (50)  NULL,
    [Role]       VARCHAR (100) NULL,
    [Site]       INT           NULL,
    [id]         INT           IDENTITY (1, 1) NOT NULL,
    CONSTRAINT [FK_TFDUsers_Asset] FOREIGN KEY ([Site]) REFERENCES [dbo].[Asset] ([asset_id])
);

