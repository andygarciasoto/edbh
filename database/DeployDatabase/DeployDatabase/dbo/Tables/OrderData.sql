CREATE TABLE [dbo].[OrderData] (
    [order_id]                  INT           IDENTITY (1, 1) NOT NULL,
    [order_number]              VARCHAR (100) NOT NULL,
    [product_code]              VARCHAR (100) NOT NULL,
    [order_quantity]            FLOAT (53)    NULL,
    [UOM_code]                  VARCHAR (100) NULL,
    [routed_cycle_time]         FLOAT (53)    NULL,
    [minutes_allowed_per_setup] FLOAT (53)    NULL,
    [ideal]                     FLOAT (53)    NULL,
    [target_percent_of_ideal]   FLOAT (53)    NULL,
    [production_status]         VARCHAR (100) NOT NULL,
    [setup_start_time]          DATETIME      NULL,
    [setup_end_time]            DATETIME      NULL,
    [production_start_time]     DATETIME      NULL,
    [production_end_time]       DATETIME      NULL,
    [start_time]                DATETIME      NOT NULL,
    [end_time]                  DATETIME      NULL,
    [is_current_order]          BIT           NULL,
    [entered_by]                VARCHAR (100) NOT NULL,
    [entered_on]                DATETIME      NOT NULL,
    [last_modified_by]          VARCHAR (100) NOT NULL,
    [last_modified_on]          DATETIME      NOT NULL,
    [asset_id]                  INT           NULL,
    CONSTRAINT [PK_OrderData_Order_Id] PRIMARY KEY NONCLUSTERED ([order_id] ASC),
    FOREIGN KEY ([asset_id]) REFERENCES [dbo].[Asset] ([asset_id]),
    FOREIGN KEY ([asset_id]) REFERENCES [dbo].[Asset] ([asset_id])
);


GO
CREATE NONCLUSTERED INDEX [fill_order_data_index_OD]
    ON [dbo].[OrderData]([asset_id] ASC)
    INCLUDE([order_id], [order_number], [product_code], [start_time], [end_time]);


GO
CREATE NONCLUSTERED INDEX [OrderData_End_Time_NC_Index]
    ON [dbo].[OrderData]([end_time] ASC)
    INCLUDE([asset_id]);


GO
CREATE NONCLUSTERED INDEX [nci_wi_OrderData_3D34583286B2F1D45359BD64D12D15F4]
    ON [dbo].[OrderData]([asset_id] ASC, [is_current_order] ASC, [order_number] ASC, [production_status] ASC)
    INCLUDE([end_time], [entered_by], [entered_on], [ideal], [last_modified_by], [last_modified_on], [minutes_allowed_per_setup], [order_id], [order_quantity], [product_code], [production_end_time], [production_start_time], [routed_cycle_time], [setup_end_time], [setup_start_time], [start_time], [target_percent_of_ideal], [UOM_code]);

