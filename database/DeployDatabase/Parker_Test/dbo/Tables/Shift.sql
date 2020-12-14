﻿CREATE TABLE [dbo].[Shift] (
    [shift_id]              INT           IDENTITY (1, 1) NOT NULL,
    [shift_code]            VARCHAR (100) NOT NULL,
    [shift_name]            VARCHAR (200) NOT NULL,
    [shift_description]     VARCHAR (256) NULL,
    [shift_sequence]        INT           NULL,
    [start_time]            TIME (0)      NOT NULL,
    [start_time_offset_days]INT         NOT NULL DEFAULT 0,
    [end_time]              TIME (0)      NOT NULL,
    [end_time_offset_days]  INT         NOT NULL DEFAULT 0,
    [duration_in_minutes]   INT           NOT NULL,
    [valid_from]            DATETIME      NOT NULL,
    [valid_to]              DATETIME      NULL,
    [team_code]             VARCHAR (100) NULL,
    [is_first_shift_of_day] BIT           NOT NULL,
    [status]                VARCHAR (50)  NOT NULL,
    [entered_by]            VARCHAR (100) NOT NULL,
    [entered_on]            DATETIME      NOT NULL,
    [last_modified_by]      VARCHAR (100) NOT NULL,
    [last_modified_on]      DATETIME      NOT NULL,
    [asset_id]              INT           NULL,
    CONSTRAINT [PK_Shift_Shift_Id] PRIMARY KEY CLUSTERED ([shift_id] ASC),
    CONSTRAINT [FK_Shift_Asset_Id] FOREIGN KEY ([asset_id]) REFERENCES [dbo].[Asset] ([asset_id]),
    CONSTRAINT [UNC_Shift_Shift_Code] UNIQUE NONCLUSTERED ([shift_code] ASC)
);

