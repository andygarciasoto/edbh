CREATE TABLE [dbo].[ProductionData_History] (
    [productiondatahistory_id] INT           IDENTITY (1, 1) NOT NULL,
    [productiondata_id]        INT           NULL,
    [dxhdata_id]               INT           NULL,
    [product_code]             VARCHAR (100) NULL,
    [ideal]                    FLOAT (53)    NULL,
    [target]                   FLOAT (53)    NULL,
    [actual]                   FLOAT (53)    NULL,
    [UOM_code]                 VARCHAR (100) NULL,
    [order_id]                 INT           NULL,
    [order_number]             VARCHAR (100) NULL,
    [start_time]               DATETIME      NULL,
    [end_time]                 DATETIME      NULL,
    [entered_by]               VARCHAR (100) NULL,
    [entered_on]               DATETIME      NULL,
    [last_modified_by]         VARCHAR (100) NULL,
    [last_modified_on]         DATETIME      NULL,
    [history_entered_by]       VARCHAR (100) NULL,
    [history_entered_on]       DATETIME      NULL,
    [history_entered_on_UTC]   DATETIME      NULL,
    CONSTRAINT [PK_ProductionDataHistory_ProductionDataHistory_Id] PRIMARY KEY NONCLUSTERED ([productiondatahistory_id] ASC)
);

