CREATE TABLE [dbo].[ProductionData] (
    [productiondata_id] INT           IDENTITY (1, 1) NOT NULL,
    [dxhdata_id]        INT           NOT NULL,
    [product_code]      VARCHAR (100) NOT NULL,
    [ideal]             FLOAT (53)    NULL,
    [target]            FLOAT (53)    NULL,
    [actual]            FLOAT (53)    NULL,
    [UOM_code]          VARCHAR (100) NULL,
    [order_id]          INT           NULL,
    [order_number]      VARCHAR (100) NULL,
    [start_time]        DATETIME      NULL,
    [end_time]          DATETIME      NULL,
    [entered_by]        VARCHAR (100) NOT NULL,
    [entered_on]        DATETIME      NOT NULL,
    [last_modified_by]  VARCHAR (100) NOT NULL,
    [last_modified_on]  DATETIME      NOT NULL,
    [setup_scrap]       FLOAT (53)    NULL,
    [other_scrap]       FLOAT (53)    NULL,
    [name]              VARCHAR (100) NULL,
    CONSTRAINT [PK_ProductionData_ProductionData_Id] PRIMARY KEY NONCLUSTERED ([productiondata_id] ASC),
    CONSTRAINT [FK_ProductionData_DxHData_ID] FOREIGN KEY ([dxhdata_id]) REFERENCES [dbo].[DxHData] ([dxhdata_id])
);


GO
CREATE NONCLUSTERED INDEX [ProductionData_DxHData_Id_NC_Index]
    ON [dbo].[ProductionData]([dxhdata_id] ASC)
    INCLUDE([productiondata_id], [product_code], [ideal], [target], [actual], [start_time], [setup_scrap], [other_scrap]);


GO
CREATE NONCLUSTERED INDEX [ProductionData_Order_Id_NC_Index]
    ON [dbo].[ProductionData]([order_id] ASC);


GO
CREATE NONCLUSTERED INDEX [ProductionData_Order_Num_Start_T_NC_Index]
    ON [dbo].[ProductionData]([order_number] ASC, [start_time] ASC);

