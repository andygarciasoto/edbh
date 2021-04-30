CREATE TABLE [dbo].[Language] (
    [language_id]      INT            IDENTITY (1, 1) NOT NULL,
    [name]             NVARCHAR (100) NOT NULL,
    [translation]      NVARCHAR (100) NOT NULL,
    [status]           VARCHAR (100)  NOT NULL,
    [entered_by]       NVARCHAR (100) CONSTRAINT [DF_Language_entered_by] DEFAULT (N'SQL Manual Entry') NOT NULL,
    [entered_on]       DATETIME       CONSTRAINT [DF_Language_entered_on] DEFAULT (getdate()) NOT NULL,
    [last_modified_by] NVARCHAR (100) CONSTRAINT [DF_Language_last_modified_by] DEFAULT (N'SQL Manual Entry') NOT NULL,
    [last_modified_on] DATETIME       CONSTRAINT [DF_Language_last_modified_on] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_Language_Language_Id] PRIMARY KEY CLUSTERED ([language_id] ASC)
);

