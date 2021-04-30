CREATE TABLE [dbo].[Scan] (
    [scan_id]           INT            IDENTITY (1, 1) NOT NULL,
    [badge]             NVARCHAR (50)  NULL,
    [name]              NVARCHAR (100) NULL,
    [asset_id]          INT            NOT NULL,
    [start_time]        DATETIME       NOT NULL,
    [end_time]          DATETIME       NULL,
    [possible_end_time] DATETIME       NULL,
    [is_current_scan]   BIT            NOT NULL,
    [reason]            NVARCHAR (50)  NULL,
    [status]            VARCHAR (50)   NOT NULL,
    [entered_by]        NVARCHAR (100) CONSTRAINT [DF_Scan_entered_by] DEFAULT (N'SQL Manual Entry') NOT NULL,
    [entered_on]        DATETIME       CONSTRAINT [DF_Scan_entered_on] DEFAULT (getdate()) NOT NULL,
    [last_modified_by]  NVARCHAR (100) CONSTRAINT [DF_Scan_last_modified_by] DEFAULT (N'SQL Manual Entry') NOT NULL,
    [last_modified_on]  DATETIME       CONSTRAINT [DF_Scan_last_modified_on] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_Scan_scan_id] PRIMARY KEY CLUSTERED ([scan_id] ASC),
    CONSTRAINT [FK_Scan_asset_id] FOREIGN KEY ([asset_id]) REFERENCES [dbo].[Asset] ([asset_id])
);

