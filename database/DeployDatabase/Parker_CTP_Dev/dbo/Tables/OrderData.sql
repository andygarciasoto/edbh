﻿CREATE TABLE [dbo].[OrderData] (
    [order_id]                  INT            IDENTITY (1, 1) NOT NULL,
    [order_number]              NVARCHAR (100) NULL,
    [product_code]              NVARCHAR (100) NULL,
    [order_quantity]            FLOAT (53)     NULL,
    [UOM_code]                  NVARCHAR (100) NULL,
    [routed_cycle_time]         FLOAT (53)     NULL,
    [minutes_allowed_per_setup] FLOAT (53)     NULL,
    [ideal]                     FLOAT (53)     NULL,
    [target_percent_of_ideal]   FLOAT (53)     NULL,
    [production_status]         VARCHAR (100)  NOT NULL,
    [setup_start_time]          DATETIME       NULL,
    [setup_end_time]            DATETIME       NULL,
    [production_start_time]     DATETIME       NULL,
    [production_end_time]       DATETIME       NULL,
    [start_time]                DATETIME       NOT NULL,
    [end_time]                  DATETIME       NULL,
    [is_current_order]          BIT            NULL,
    [entered_by]                NVARCHAR (100) NULL,
    [entered_on]                DATETIME       NOT NULL,
    [last_modified_by]          NVARCHAR (100) NULL,
    [last_modified_on]          DATETIME       NOT NULL,
    [asset_id]                  INT            NULL,
    CONSTRAINT [PK_OrderData_Order_Id] PRIMARY KEY CLUSTERED ([order_id] ASC),
    CONSTRAINT [FK_OrderData_Asset_ID] FOREIGN KEY ([asset_id]) REFERENCES [dbo].[Asset] ([asset_id])
);


GO
CREATE NONCLUSTERED INDEX [NCI_OrderData_Asset]
    ON [dbo].[OrderData]([asset_id] ASC)
    INCLUDE([end_time]);


GO
CREATE NONCLUSTERED INDEX [NCI_OrderData_ASSET_ID_ODNUM_CURRENT_PRDSTAT]
    ON [dbo].[OrderData]([asset_id] ASC, [order_number] ASC, [is_current_order] ASC, [production_status] ASC)
    INCLUDE([end_time], [entered_by], [entered_on], [ideal], [last_modified_by], [last_modified_on], [minutes_allowed_per_setup], [order_id], [order_quantity], [product_code], [production_end_time], [production_start_time], [routed_cycle_time], [setup_end_time], [setup_start_time], [start_time], [target_percent_of_ideal], [UOM_code]);


GO
CREATE NONCLUSTERED INDEX [NCI_OrderData_End_Time]
    ON [dbo].[OrderData]([end_time] ASC)
    INCLUDE([asset_id]);


GO
CREATE NONCLUSTERED INDEX [NCI_OrderData_IsCurr_Asset]
    ON [dbo].[OrderData]([is_current_order] ASC, [asset_id] ASC)
    INCLUDE([order_id], [order_number], [product_code], [order_quantity], [routed_cycle_time], [setup_start_time], [setup_end_time], [start_time]);

