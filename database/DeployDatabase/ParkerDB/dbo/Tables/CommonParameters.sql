﻿CREATE TABLE [dbo].[CommonParameters] (
    [parameter_id]                    INT            IDENTITY (1, 1) NOT NULL,
    [site_id]                         INT            NOT NULL,
    [site_name]                       NVARCHAR (100) NOT NULL,
    [production_day_offset_minutes]   FLOAT (53)     NOT NULL,
    [site_timezone]                   NVARCHAR (100) NOT NULL,
    [ui_timezone]                     NVARCHAR (100) NOT NULL,
    [default_target_percent_of_ideal] FLOAT (53)     NULL,
    [default_setup_minutes]           FLOAT (53)     NULL,
    [default_routed_cycle_time]       FLOAT (53)     NULL,
    [inactive_timeout_minutes]        FLOAT (53)     NULL,
    [language]                        NVARCHAR (100) NOT NULL,
    [status]                          VARCHAR (100)  NOT NULL,
    [entered_by]                      NVARCHAR (100) CONSTRAINT [DF_CommonParameters_entered_by] DEFAULT (N'SQL Manual Entry') NOT NULL,
    [entered_on]                      DATETIME       CONSTRAINT [DF_CommonParameters_entered_on] DEFAULT (getdate()) NOT NULL,
    [last_modified_by]                NVARCHAR (100) CONSTRAINT [DF_CommonParameters_last_modified_by] DEFAULT (N'SQL Manual Entry') NOT NULL,
    [last_modified_on]                DATETIME       CONSTRAINT [DF_CommonParameters_last_modified_on] DEFAULT (getdate()) NOT NULL,
    [summary_timeout]                 INT            NULL,
    [break_minutes]                   FLOAT (53)     NULL,
    [lunch_minutes]                   FLOAT (53)     NULL,
    [site_prefix]                     NVARCHAR (100) NULL,
    [assembly_url]                    NVARCHAR (256) NULL,
    [timezone_id]                     INT            NULL,
    [language_id]                     INT            NULL,
    [escalation_group]                NVARCHAR (50)  NULL,
    CONSTRAINT [PK_CommonParameters_Parameter_Id] PRIMARY KEY CLUSTERED ([parameter_id] ASC),
    CONSTRAINT [FK_CommonParameters_Language_Id] FOREIGN KEY ([language_id]) REFERENCES [dbo].[Language] ([language_id]),
    CONSTRAINT [FK_CommonParameters_Site_Id] FOREIGN KEY ([site_id]) REFERENCES [dbo].[Asset] ([asset_id]),
    CONSTRAINT [FK_CommonParameters_Timezone_Id] FOREIGN KEY ([timezone_id]) REFERENCES [dbo].[Timezone] ([timezone_id])
);

