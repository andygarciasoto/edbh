CREATE TABLE [dbo].[Escalation] (
    [escalation_id]    INT            IDENTITY (1, 1) NOT NULL,
    [escalation_name]  NVARCHAR (100) NOT NULL,
    [escalation_group] NVARCHAR (100) NOT NULL,
    [escalation_level] INT            NOT NULL,
    [escalation_hours] FLOAT (53)     NULL,
    [status]           NVARCHAR (50)  NOT NULL,
    [entered_by]       NVARCHAR (100) CONSTRAINT [DF_Escalation_entered_by] DEFAULT (N'SQL Manual Entry') NOT NULL,
    [entered_on]       DATETIME       CONSTRAINT [DF_Escalation_entered_on] DEFAULT (getdate()) NOT NULL,
    [last_modified_by] NVARCHAR (100) CONSTRAINT [DF_Escalation_last_modified_by] DEFAULT (N'SQL Manual Entry') NOT NULL,
    [last_modified_on] DATETIME       CONSTRAINT [DF_Escalation_last_modified_on] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_Escalation] PRIMARY KEY CLUSTERED ([escalation_id] ASC)
);

