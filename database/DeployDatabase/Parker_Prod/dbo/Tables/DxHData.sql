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
    CONSTRAINT [FK__DxHData__asset_i__0E04126B] FOREIGN KEY ([asset_id]) REFERENCES [dbo].[Asset] ([asset_id])
);


GO
CREATE NONCLUSTERED INDEX [DxHData_PROD_DAY_ASSET_NC_Index]
    ON [dbo].[DxHData]([production_day] ASC, [asset_id] ASC)
    INCLUDE([dxhdata_id], [hour_interval], [shift_code], [operator_signoff], [operator_signoff_timestamp], [supervisor_signoff], [supervisor_signoff_timestamp]);


GO
CREATE NONCLUSTERED INDEX [nci_wi_DxHData_0BF9F8F6A092EDAB110F00796B4215EC]
    ON [dbo].[DxHData]([asset_id] ASC)
    INCLUDE([asset_code], [dxhdata_id], [entered_by], [entered_on], [hour_interval], [last_modified_by], [last_modified_on], [operator_signoff], [operator_signoff_timestamp], [production_day], [shift_code], [summary_action_taken], [summary_actual], [summary_comments], [summary_dtminutes], [summary_dtreason_code], [summary_ideal], [summary_order_number], [summary_product_code], [summary_target], [summary_UOM_code], [supervisor_signoff], [supervisor_signoff_timestamp]);

