CREATE TABLE [dbo].[Workcell] (
    [workcell_id]          INT            IDENTITY (1, 1) NOT NULL,
    [workcell_name]        NVARCHAR (200) NULL,
    [workcell_description] NVARCHAR (256) NULL,
    [entered_by]           NVARCHAR (100) NULL,
    [entered_on]           DATETIME       CONSTRAINT [DF_Workcell_entered_on] DEFAULT (getdate()) NULL,
    [last_modified_by]     NVARCHAR (100) NULL,
    [last_modified_on]     DATETIME       CONSTRAINT [DF_Workcell_last_modified_on] DEFAULT (getdate()) NULL,
    CONSTRAINT [PK_Workcell_ID] PRIMARY KEY CLUSTERED ([workcell_id] ASC)
);

