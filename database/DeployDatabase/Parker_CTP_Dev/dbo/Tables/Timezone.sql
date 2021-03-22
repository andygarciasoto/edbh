CREATE TABLE [dbo].[Timezone] (
    [timezone_id]                     INT            IDENTITY (1, 1) NOT NULL,
    [name]                            NVARCHAR (100) NOT NULL,
    [ui_timezone]                     NVARCHAR (100) NOT NULL,
    [sql_timezone]                    NVARCHAR (100) NOT NULL,
    [status]                          NVARCHAR(100)  NOT NULL,
    [entered_by]                      NVARCHAR (100) CONSTRAINT [DF_Timezone_entered_by] DEFAULT (N'SQL Manual Entry') NOT NULL,
    [entered_on]                      DATETIME       CONSTRAINT [DF_Timezone_entered_on] DEFAULT (getdate()) NOT NULL,
    [last_modified_by]                NVARCHAR (100) CONSTRAINT [DF_Timezone_last_modified_by] DEFAULT (N'SQL Manual Entry') NOT NULL,
    [last_modified_on]                DATETIME       CONSTRAINT [DF_Timezone_last_modified_on] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_Timezone_Timezone_Id] PRIMARY KEY CLUSTERED ([timezone_id] ASC)
);

