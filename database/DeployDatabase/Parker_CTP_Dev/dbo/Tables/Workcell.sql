CREATE TABLE [dbo].[Workcell] (
    [workcell_id]          INT            IDENTITY (1, 1) NOT NULL,
    [workcell_name]        NVARCHAR (200) NOT NULL,
    [workcell_description] NVARCHAR (256) NULL,
    [entered_by]           NVARCHAR (100) CONSTRAINT [DF_Workcell_entered_by] DEFAULT (N'SQL Manual Entry') NOT NULL,
    [entered_on]           DATETIME       CONSTRAINT [DF_Workcell_entered_on] DEFAULT (getdate()) NOT NULL,
    [last_modified_by]     NVARCHAR (100) CONSTRAINT [DF_Workcell_last_modified_by] DEFAULT (N'SQL Manual Entry') NOT NULL,
    [last_modified_on]     DATETIME       CONSTRAINT [DF_Workcell_last_modified_on] DEFAULT (getdate()) NOT NULL,
    [site_id]              INT             NOT NULL,
    CONSTRAINT [PK_Workcell_ID] PRIMARY KEY CLUSTERED ([workcell_id] ASC)
);

