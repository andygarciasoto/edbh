CREATE TABLE [dbo].[Unavailable] (
    [unavailable_id]          INT           IDENTITY (1, 1) NOT NULL,
    [unavailable_code]        VARCHAR (100) NOT NULL,
    [unavailable_name]        VARCHAR (200) NOT NULL,
    [unavailable_description] VARCHAR (256) NULL,
    [start_time]              TIME (0)      NOT NULL,
    [end_time]                TIME (0)      NOT NULL,
    [duration_in_minutes]     INT           NOT NULL,
    [valid_from]              DATETIME      NOT NULL,
    [valid_to]                DATETIME      NULL,
    [status]                  VARCHAR (50)  NOT NULL,
    [entered_by]              VARCHAR (100) NOT NULL,
    [entered_on]              DATETIME      NOT NULL,
    [last_modified_by]        VARCHAR (100) NOT NULL,
    [last_modified_on]        DATETIME      NOT NULL,
    [site_id]                 INT            NOT NULL,
    [asset_id]                INT           NULL,
    CONSTRAINT [PK_Unavailable_Unavailable_Id] PRIMARY KEY CLUSTERED ([unavailable_id] ASC),
    CONSTRAINT [FK_Unavailable_Asset_Id] FOREIGN KEY ([asset_id]) REFERENCES [dbo].[Asset] ([asset_id])
);

