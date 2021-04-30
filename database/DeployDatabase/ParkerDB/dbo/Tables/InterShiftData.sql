CREATE TABLE [dbo].[InterShiftData] (
    [intershift_id]    INT            IDENTITY (1, 1) NOT NULL,
    [production_day]   DATETIME       NOT NULL,
    [shift_code]       NVARCHAR (100) NOT NULL,
    [comment]          NVARCHAR (256) NOT NULL,
    [first_name]       NVARCHAR (100) NOT NULL,
    [last_name]        NVARCHAR (100) NOT NULL,
    [entered_by]       NVARCHAR (100) CONSTRAINT [DF_InterShiftData_entered_by] DEFAULT (N'SQL Manual Entry') NOT NULL,
    [entered_on]       DATETIME       CONSTRAINT [DF_InterShiftData_entered_on] DEFAULT (getdate()) NOT NULL,
    [last_modified_by] NVARCHAR (100) CONSTRAINT [DF_InterShiftData_last_modified_by] DEFAULT (N'SQL Manual Entry') NOT NULL,
    [last_modified_on] DATETIME       CONSTRAINT [DF_InterShiftData_last_modified_on] DEFAULT (getdate()) NOT NULL,
    [asset_id]         INT            NOT NULL,
    CONSTRAINT [PK_InterShift_InterShift_Id] PRIMARY KEY CLUSTERED ([intershift_id] ASC),
    CONSTRAINT [FK_InterShiftData_Asset_Id] FOREIGN KEY ([asset_id]) REFERENCES [dbo].[Asset] ([asset_id]),
    CONSTRAINT [FK_InterShiftData_Shift_Code] FOREIGN KEY ([shift_code]) REFERENCES [dbo].[Shift] ([shift_code])
);

