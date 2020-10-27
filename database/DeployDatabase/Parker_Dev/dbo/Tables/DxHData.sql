CREATE TABLE [dbo].[DxHData] (
    [dxhdata_id]                   INT           IDENTITY (1, 1) NOT NULL,
    [asset_code]                   VARCHAR (100) NULL,
    [production_day]               DATETIME      NOT NULL,
    [hour_interval]                VARCHAR (100) NOT NULL,
    [shift_code]                   VARCHAR (100) NOT NULL,
    [summary_product_code]         VARCHAR (100) NULL,
    [summary_ideal]                FLOAT (53)    NULL,
    [summary_target]               FLOAT (53)    NULL,
    [summary_actual]               FLOAT (53)    NULL,
    [summary_UOM_code]             VARCHAR (100) NULL,
    [summary_order_number]         VARCHAR (100) NULL,
    [summary_dtminutes]            FLOAT (53)    NULL,
    [summary_dtreason_code]        VARCHAR (100) NULL,
    [summary_comments]             VARCHAR (256) NULL,
    [summary_action_taken]         VARCHAR (256) NULL,
    [operator_signoff]             VARCHAR (100) NULL,
    [operator_signoff_timestamp]   DATETIME      NULL,
    [supervisor_signoff]           VARCHAR (100) NULL,
    [supervisor_signoff_timestamp] DATETIME      NULL,
    [entered_by]                   VARCHAR (100) NOT NULL,
    [entered_on]                   DATETIME      NOT NULL,
    [last_modified_by]             VARCHAR (100) NOT NULL,
    [last_modified_on]             DATETIME      NOT NULL,
    [start_time]                   DATETIME      NULL,
    [end_time]                     DATETIME      NULL,
    [asset_id]                     INT           NULL,
    CONSTRAINT [PK_DxHData_DxHData_Id] PRIMARY KEY NONCLUSTERED ([dxhdata_id] ASC),
    CONSTRAINT [FK__DxHData__asset_i__0E04126B] FOREIGN KEY ([asset_id]) REFERENCES [dbo].[Asset] ([asset_id]),
    CONSTRAINT [FK_DxHData_Asset_Code] FOREIGN KEY ([asset_code]) REFERENCES [dbo].[Asset] ([asset_code]),
    CONSTRAINT [FK_DxHData_Shift_Code] FOREIGN KEY ([shift_code]) REFERENCES [dbo].[Shift] ([shift_code])
);


GO
CREATE NONCLUSTERED INDEX [index_dxhdata]
    ON [dbo].[DxHData]([asset_id] ASC, [hour_interval] ASC, [production_day] ASC, [shift_code] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_DxHData_AssetId]
    ON [dbo].[DxHData]([asset_id] ASC, [production_day] ASC, [shift_code] ASC)
    INCLUDE([dxhdata_id]);

