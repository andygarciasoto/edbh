CREATE TABLE [dbo].[Translation] (
    [translation_id]               INT           IDENTITY (1, 1) NOT NULL,
    [label_code]                   VARCHAR (100) NOT NULL,
    [label_name]                   VARCHAR (200) NOT NULL,
    [label_description]            VARCHAR (256) NULL,
    [language_code]                VARCHAR (100) NULL,
    [translated_label_code]        VARCHAR (100) NULL,
    [translated_label_name]        VARCHAR (200) NULL,
    [translated_label_description] VARCHAR (256) NULL,
    [module]                       VARCHAR (100) NULL,
    [status]                       VARCHAR (50)  NOT NULL,
    [entered_by]                   VARCHAR (100) NOT NULL,
    [entered_on]                   DATETIME      NOT NULL,
    [last_modified_by]             VARCHAR (100) NOT NULL,
    [last_modified_on]             DATETIME      NOT NULL,
    CONSTRAINT [PK_Translation_Translation_Id] PRIMARY KEY NONCLUSTERED ([translation_id] ASC)
);

