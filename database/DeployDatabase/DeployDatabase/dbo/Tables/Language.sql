CREATE TABLE [dbo].[Language] (
    [language_id]           INT           IDENTITY (1, 1) NOT NULL,
    [language_code]         VARCHAR (100) NOT NULL,
    [language_name]         VARCHAR (200) NOT NULL,
    [langueage_description] VARCHAR (256) NULL,
    [module]                VARCHAR (100) NULL,
    [status]                VARCHAR (50)  NOT NULL,
    [entered_by]            VARCHAR (100) NOT NULL,
    [entered_on]            DATETIME      NOT NULL,
    [last_modified_by]      VARCHAR (100) NOT NULL,
    [last_modified_on]      DATETIME      NOT NULL,
    CONSTRAINT [PK_Language_Language_Id] PRIMARY KEY NONCLUSTERED ([language_id] ASC)
);

