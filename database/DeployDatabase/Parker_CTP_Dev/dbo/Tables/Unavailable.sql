CREATE TABLE [dbo].[Unavailable] (
    [unavailable_id]          INT            IDENTITY (1, 1) NOT NULL,
    [unavailable_code]        NVARCHAR (100) NULL,
    [unavailable_name]        NVARCHAR (200) NULL,
    [unavailable_description] NVARCHAR (256) NULL,
    [start_time]              TIME (0)       NOT NULL,
    [end_time]                TIME (0)       NOT NULL,
    [duration_in_minutes]     INT            NOT NULL,
    [valid_from]              DATETIME       NOT NULL,
    [valid_to]                DATETIME       NULL,
    [status]                  VARCHAR (50)   NOT NULL,
    [entered_by]              NVARCHAR (100) CONSTRAINT [DF_Unavailable_entered_by] DEFAULT (N'SQL Manual Entry') NULL,
    [entered_on]              DATETIME       CONSTRAINT [DF_Unavailable_entered_on] DEFAULT (getdate()) NOT NULL,
    [last_modified_by]        NVARCHAR (100) CONSTRAINT [DF_Unavailable_last_modified_by] DEFAULT (N'SQL Manual Entry') NULL,
    [last_modified_on]        DATETIME       CONSTRAINT [DF_Unavailable_last_modified_on] DEFAULT (getdate()) NOT NULL,
    [site_id]                 INT            NOT NULL,
    [asset_id]                INT            NULL,
    CONSTRAINT [PK_Unavailable_Unavailable_Id] PRIMARY KEY CLUSTERED ([unavailable_id] ASC),
    CONSTRAINT [FK_Unavailable_Asset_Id] FOREIGN KEY ([asset_id]) REFERENCES [dbo].[Asset] ([asset_id])
);

