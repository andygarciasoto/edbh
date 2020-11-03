CREATE TABLE [dbo].[InterShiftData] (
    [intershift_id]    INT           IDENTITY (1, 1) NOT NULL,
    [production_day]   DATETIME      NOT NULL,
    [shift_code]       VARCHAR (100) NOT NULL,
    [comment]          VARCHAR (256) NULL,
    [first_name]       VARCHAR (100) NULL,
    [last_name]        VARCHAR (100) NULL,
    [entered_by]       VARCHAR (100) NOT NULL,
    [entered_on]       DATETIME      NOT NULL,
    [last_modified_by] VARCHAR (100) NOT NULL,
    [last_modified_on] DATETIME      NOT NULL,
    [asset_id]         INT           NULL,
    CONSTRAINT [PK_InterShift_InterShift_Id] PRIMARY KEY CLUSTERED ([intershift_id] ASC),
    CONSTRAINT [FK_InterShiftData_Asset_Id] FOREIGN KEY ([asset_id]) REFERENCES [dbo].[Asset] ([asset_id]),
    CONSTRAINT [FK_InterShiftData_Shift_Code] FOREIGN KEY ([shift_code]) REFERENCES [dbo].[Shift] ([shift_code])
);

