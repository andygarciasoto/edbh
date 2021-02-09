﻿CREATE TABLE [dbo].[Asset] (
    [asset_id]                INT           IDENTITY (1, 1) NOT NULL,
    [asset_code]              VARCHAR (100) NOT NULL,
    [asset_name]              VARCHAR (200) NOT NULL,
    [asset_description]       VARCHAR (256) NULL,
    [asset_level]             VARCHAR (100) NOT NULL,
    [site_code]               VARCHAR (100) NOT NULL,
    [parent_asset_code]       VARCHAR (100) NOT NULL,
    [value_stream]            VARCHAR (100) NULL,
    [automation_level]        VARCHAR (100) NULL,
    [include_in_escalation]   BIT           NULL,
    [grouping1]               VARCHAR (256) NULL,
    [grouping2]               VARCHAR (256) NULL,
    [grouping3]               VARCHAR (256) NULL,
    [grouping4]               VARCHAR (256) NULL,
    [grouping5]               VARCHAR (256) NULL,
    [status]                  VARCHAR (50)  NOT NULL,
    [entered_by]              VARCHAR (100) NOT NULL,
    [entered_on]              DATETIME      NOT NULL,
    [last_modified_by]        VARCHAR (100) NOT NULL,
    [last_modified_on]        DATETIME      NOT NULL,
    [target_percent_of_ideal] FLOAT (53)    NULL,
    [is_multiple]             BIT           NULL,
    CONSTRAINT [PK_Asset_Asset_Id] PRIMARY KEY CLUSTERED ([asset_id] ASC),
    CONSTRAINT [UNC_Asset_Asset_Code] UNIQUE NONCLUSTERED ([asset_code] ASC)
);

