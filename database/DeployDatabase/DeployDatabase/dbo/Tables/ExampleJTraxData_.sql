CREATE TABLE [dbo].[ExampleJTraxData$] (
    [Plant]                NVARCHAR (255) NULL,
    [JobNumber]            NVARCHAR (255) NULL,
    [PartNumber]           NVARCHAR (255) NULL,
    [MachineNumber]        FLOAT (53)     NULL,
    [Operation]            FLOAT (53)     NULL,
    [CycleTime]            FLOAT (53)     NULL,
    [JobQuantity]          FLOAT (53)     NULL,
    [AcceptedPieces]       FLOAT (53)     NULL,
    [RejectedPieces]       FLOAT (53)     NULL,
    [ReleaseDate]          DATETIME       NULL,
    [SetupStart]           DATETIME       NULL,
    [SetupEnd]             DATETIME       NULL,
    [ElapsedSetupTime]     FLOAT (53)     NULL,
    [FirstInspectionEvent] DATETIME       NULL,
    [LastInspectionEvent]  DATETIME       NULL,
    [ClosedDate]           DATETIME       NULL
);

