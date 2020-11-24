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
    FOREIGN KEY ([asset_id]) REFERENCES [dbo].[Asset] ([asset_id])
);


GO
CREATE NONCLUSTERED INDEX [FI_OrderData_IsCurrentOrder]
    ON [dbo].[OrderData]([is_current_order] ASC) WHERE ([is_current_order]=(1));


GO
CREATE NONCLUSTERED INDEX [index_orderdata]
    ON [dbo].[OrderData]([asset_id] ASC, [setup_start_time] ASC);


GO
CREATE NONCLUSTERED INDEX [NCI_OrderData_Setup]
    ON [dbo].[OrderData]([order_number] ASC)
    INCLUDE([setup_start_time], [setup_end_time]);


GO
CREATE NONCLUSTERED INDEX [index_2_orderdata]
    ON [dbo].[OrderData]([is_current_order] ASC, [asset_id] ASC)
    INCLUDE([order_id], [order_number], [product_code], [order_quantity], [routed_cycle_time], [target_percent_of_ideal], [setup_start_time], [setup_end_time], [start_time]);

