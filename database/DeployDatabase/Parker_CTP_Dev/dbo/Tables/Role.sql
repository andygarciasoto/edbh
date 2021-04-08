CREATE TABLE [dbo].[Role] (
    [role_id]          INT            IDENTITY (1, 1) NOT NULL,
    [name]             NVARCHAR (100) NOT NULL,
    [description]      NVARCHAR (100) NULL,
    [default_view]     NVARCHAR (100) NULL,
    [status]           NVARCHAR (50)  NOT NULL,
    [entered_by]       NVARCHAR (100) CONSTRAINT [DF_Role_entered_by] DEFAULT (N'SQL Manual Entry') NOT NULL,
    [entered_on]       DATETIME       CONSTRAINT [DF_Role_entered_on] DEFAULT (getdate()) NOT NULL,
    [last_modified_by] NVARCHAR (100) CONSTRAINT [DF_Role_last_modified_by] DEFAULT (N'SQL Manual Entry') NOT NULL,
    [last_modified_on] DATETIME       CONSTRAINT [DF_Role_last_modified_on] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_Role_Role_Id] PRIMARY KEY CLUSTERED ([role_id] ASC)
);

