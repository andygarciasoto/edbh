CREATE TABLE [dbo].[DTData] (
    [dtdata_id]         INT            IDENTITY (1, 1) NOT NULL,
    [dxhdata_id]        INT            NOT NULL,
    [dtreason_id]       INT            NOT NULL,
    [dtminutes]         FLOAT (53)     NULL,
    [entered_by]        NVARCHAR (100) CONSTRAINT [DF_DTData_entered_by] DEFAULT (N'SQL Manual Entry') NOT NULL,
    [entered_on]        DATETIME       CONSTRAINT [DF_DTData_entered_on] DEFAULT (getdate()) NOT NULL,
    [last_modified_by]  NVARCHAR (100) CONSTRAINT [DF_DTData_last_modified_by] DEFAULT (N'SQL Manual Entry') NOT NULL,
    [last_modified_on]  DATETIME       CONSTRAINT [DF_DTData_last_modified_on] DEFAULT (getdate()) NOT NULL,
    [name]              NVARCHAR (100) NULL,
    [quantity]          FLOAT (53)     DEFAULT 0 NULL,
    [productiondata_id] INT            NULL,
    [responsible]       NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_DTData_DTData_Id] PRIMARY KEY CLUSTERED ([dtdata_id] ASC),
    CONSTRAINT [FK_DTData_DTReason_ID] FOREIGN KEY ([dtreason_id]) REFERENCES [dbo].[DTReason] ([dtreason_id]),
    CONSTRAINT [FK_DTData_DxHData_ID] FOREIGN KEY ([dxhdata_id]) REFERENCES [dbo].[DxHData] ([dxhdata_id])
);


GO
CREATE NONCLUSTERED INDEX [NCI_DTDATA_DxHData_Id]
    ON [dbo].[DTData]([dxhdata_id] ASC);

