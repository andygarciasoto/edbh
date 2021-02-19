CREATE TABLE [dbo].[DxHData] (
    [dxhdata_id]                   INT            IDENTITY (1, 1) NOT NULL,
    [production_day]               DATETIME       NOT NULL,
    [hour_interval]                VARCHAR (100)  NOT NULL,
    [shift_code]                   NVARCHAR (100) NULL,
    [summary_product_code]         NVARCHAR (100) NULL,
    [summary_ideal]                FLOAT (53)     NULL,
    [summary_target]               FLOAT (53)     NULL,
    [summary_actual]               FLOAT (53)     NULL,
    [summary_UOM_code]             NVARCHAR (100) NULL,
    [summary_order_number]         NVARCHAR (100) NULL,
    [summary_dtminutes]            FLOAT (53)     NULL,
    [summary_dtreason_code]        NVARCHAR (100) NULL,
    [summary_comments]             NVARCHAR (256) NULL,
    [summary_action_taken]         NVARCHAR (256) NULL,
    [operator_signoff]             NVARCHAR (100) NULL,
    [operator_signoff_timestamp]   DATETIME       NULL,
    [supervisor_signoff]           NVARCHAR (100) NULL,
    [supervisor_signoff_timestamp] DATETIME       NULL,
    [entered_by]                   NVARCHAR (100) NULL,
    [entered_on]                   DATETIME       NOT NULL,
    [last_modified_by]             NVARCHAR (100) NULL,
    [last_modified_on]             DATETIME       NOT NULL,
    [start_time]                   DATETIME       NULL,
    [end_time]                     DATETIME       NULL,
    [asset_id]                     INT            NULL,
    CONSTRAINT [PK_DxHData_DxHData_Id] PRIMARY KEY CLUSTERED ([dxhdata_id] ASC),
    CONSTRAINT [FK_DxHData_Asset_Id] FOREIGN KEY ([asset_id]) REFERENCES [dbo].[Asset] ([asset_id]),
    CONSTRAINT [FK_DxHData_Shift_Code] FOREIGN KEY ([shift_code]) REFERENCES [dbo].[Shift] ([shift_code])
);


GO
CREATE NONCLUSTERED INDEX [NCI_DxHData_ASSET_ID]
    ON [dbo].[DxHData]([asset_id] ASC)
    INCLUDE([dxhdata_id], [entered_by], [entered_on], [hour_interval], [last_modified_by], [last_modified_on], [operator_signoff], [operator_signoff_timestamp], [production_day], [shift_code], [summary_action_taken], [summary_actual], [summary_comments], [summary_dtminutes], [summary_dtreason_code], [summary_ideal], [summary_order_number], [summary_product_code], [summary_target], [summary_UOM_code], [supervisor_signoff], [supervisor_signoff_timestamp]);


GO
CREATE NONCLUSTERED INDEX [NCI_DxHData_PROD_DAY_ASSET_ID]
    ON [dbo].[DxHData]([production_day] ASC, [asset_id] ASC)
    INCLUDE([dxhdata_id], [hour_interval], [shift_code], [operator_signoff], [operator_signoff_timestamp], [supervisor_signoff], [supervisor_signoff_timestamp]);


GO
CREATE UNIQUE NONCLUSTERED INDEX [UIX_DxHData_Asset_Id_Prod_Day_Hour_Shift]
    ON [dbo].[DxHData]([asset_id] ASC, [production_day] ASC, [hour_interval] ASC, [shift_code] ASC);

