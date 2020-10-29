CREATE TABLE [dbo].[SupervisorAsset] (
    [supervisorasset_id] INT           IDENTITY (1, 1) NOT NULL,
    [supervisor]         VARCHAR (100) NOT NULL,
    [shift_code]         VARCHAR (100) NOT NULL,
    [valid_from]         DATETIME      NOT NULL,
    [valid_to]           DATETIME      NULL,
    [status]             VARCHAR (50)  NOT NULL,
    [entered_by]         VARCHAR (100) NOT NULL,
    [entered_on]         DATETIME      NOT NULL,
    [last_modified_by]   VARCHAR (100) NOT NULL,
    [last_modified_on]   DATETIME      NOT NULL,
    [asset_id]           INT           NULL,
    CONSTRAINT [PK_SupervisorAsset_Id] PRIMARY KEY NONCLUSTERED ([supervisorasset_id] ASC),
    FOREIGN KEY ([asset_id]) REFERENCES [dbo].[Asset] ([asset_id])
);

