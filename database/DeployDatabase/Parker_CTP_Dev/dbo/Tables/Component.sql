CREATE TABLE [dbo].[Component] (
    [component_id]     INT            IDENTITY (1, 1) NOT NULL,
    [name]             NVARCHAR (100) NOT NULL,
    [status]           NVARCHAR (50)  NOT NULL,
    [entered_by]       NVARCHAR (100) CONSTRAINT [DF_Component_entered_by] DEFAULT (N'SQL Manual Entry') NOT NULL,
    [entered_on]       DATETIME       CONSTRAINT [DF_Component_entered_on] DEFAULT (getdate()) NOT NULL,
    [last_modified_by] NVARCHAR (100) CONSTRAINT [DF_Component_last_modified_by] DEFAULT (N'SQL Manual Entry') NOT NULL,
    [last_modified_on] DATETIME       CONSTRAINT [DF_Component_last_modified_on] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_Component_Component_Id] PRIMARY KEY CLUSTERED ([component_id] ASC)
);

