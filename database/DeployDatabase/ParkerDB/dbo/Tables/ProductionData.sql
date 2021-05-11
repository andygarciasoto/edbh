CREATE TABLE [dbo].[ProductionData] (
    [productiondata_id] INT            IDENTITY (1, 1) NOT NULL,
    [dxhdata_id]        INT            NOT NULL,
    [product_code]      NVARCHAR (100) NOT NULL,
    [ideal]             FLOAT (53)     NULL,
    [target]            FLOAT (53)     NULL,
    [actual]            FLOAT (53)     NOT NULL,
    [UOM_code]          NVARCHAR (100) NOT NULL,
    [order_id]          INT            NOT NULL,
    [order_number]      NVARCHAR (100) NOT NULL,
    [start_time]        DATETIME       NOT NULL,
    [end_time]          DATETIME       NULL,
    [entered_by]        NVARCHAR (100) CONSTRAINT [DF_ProductionData_entered_by] DEFAULT (N'SQL Manual Entry') NOT NULL,
    [entered_on]        DATETIME       CONSTRAINT [DF_ProductionData_entered_on] DEFAULT (getdate()) NOT NULL,
    [last_modified_by]  NVARCHAR (100) CONSTRAINT [DF_ProductionData_last_modified_by] DEFAULT (N'SQL Manual Entry') NOT NULL,
    [last_modified_on]  DATETIME       CONSTRAINT [DF_ProductionData_last_modified_on] DEFAULT (getdate()) NOT NULL,
    [setup_scrap]       FLOAT (53)     NOT NULL,
    [other_scrap]       FLOAT (53)     NOT NULL,
    [name]              NVARCHAR (100) NOT NULL,
    CONSTRAINT [PK_ProductionData_ProductionData_Id] PRIMARY KEY CLUSTERED ([productiondata_id] ASC),
    CONSTRAINT [FK_ProductionData_DxHData_ID] FOREIGN KEY ([dxhdata_id]) REFERENCES [dbo].[DxHData] ([dxhdata_id])
);


GO
CREATE NONCLUSTERED INDEX [NCI_ProductionData_DxHData_Id]
    ON [dbo].[ProductionData]([dxhdata_id] ASC)
    INCLUDE([productiondata_id], [product_code], [ideal], [target], [actual], [start_time], [setup_scrap], [other_scrap]);


GO
CREATE NONCLUSTERED INDEX [NCI_ProductionData_Order_Id]
    ON [dbo].[ProductionData]([order_id] ASC);


GO
CREATE NONCLUSTERED INDEX [NCI_ProductionData_Order_Num_Start_T]
    ON [dbo].[ProductionData]([order_number] ASC, [start_time] ASC);


GO

CREATE trigger [dbo].[TriggerProductionDataHistory] on [dbo].[ProductionData]
after update, insert
as
Begin
	Insert dbo.ProductionData_History 
		(
		productiondata_id, 
		dxhdata_id, 
		product_code, 
		ideal, 
		target, 
		actual, 
		UOM_code, 
		order_id, 
		order_number, 
		start_time, 
		end_time, 
		entered_by, 
		entered_on, 
		last_modified_by, 
		last_modified_on,
		history_entered_by,
		history_entered_on,
		history_entered_on_UTC
		)
	Select 
		pd.productiondata_id, 
		pd.dxhdata_id, 
		pd.product_code, 
		pd.ideal, 
		pd.target, 
		pd.actual, 
		pd.UOM_code, 
		pd.order_id, 
		pd.order_number, 
		pd.start_time, 
		pd.end_time, 
		pd.entered_by, 
		pd.entered_on, 
		pd.last_modified_by, 
		pd.last_modified_on,
		suser_sname() as 'history_entered_by',
		getutcdate() at time zone 'UTC' at time zone 'Eastern Standard Time',
		getutcdate() at time zone 'UTC' 
	From dbo.ProductionData pd 
		inner join inserted i on pd.productiondata_id = i.productiondata_id 
End
