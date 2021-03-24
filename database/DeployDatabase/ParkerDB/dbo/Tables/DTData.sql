CREATE TABLE [dbo].[DTData] (
    [dtdata_id]             INT           IDENTITY (1, 1) NOT NULL,
    [dxhdata_id]            INT           NOT NULL,
    [dtreason_id]           INT           NULL,
    [dtminutes]             FLOAT (53)    NULL,
    [dtminutes_provisional] FLOAT (53)    NULL,
    [dtminutes_total]       FLOAT (53)    NULL,
    [dtminutes_breaks]      FLOAT (53)    NULL,
    [dtminutes_setup]       FLOAT (53)    NULL,
    [entered_by]            VARCHAR (100) NOT NULL,
    [entered_on]            DATETIME      NOT NULL,
    [last_modified_by]      VARCHAR (100) NOT NULL,
    [last_modified_on]      DATETIME      NOT NULL,
    [name]                  VARCHAR (100) NULL,
    CONSTRAINT [PK_DTData_DTData_Id] PRIMARY KEY NONCLUSTERED ([dtdata_id] ASC),
    CONSTRAINT [FK_DTData_DTReason_ID] FOREIGN KEY ([dtreason_id]) REFERENCES [dbo].[DTReason] ([dtreason_id]),
    CONSTRAINT [FK_DTData_DxHData_ID] FOREIGN KEY ([dxhdata_id]) REFERENCES [dbo].[DxHData] ([dxhdata_id])
);


GO
CREATE NONCLUSTERED INDEX [DTDATA_DxHData_Id_NC_Index]
    ON [dbo].[DTData]([dxhdata_id] ASC);

