CREATE TABLE [dbo].[Scan](
	[scan_id] [int] IDENTITY(1,1) NOT NULL,
	[badge] [varchar](50) NOT NULL,
	[first_name] [varchar](50) NOT NULL,
	[last_name] [varchar](50) NOT NULL,
	[asset_id] [int] NOT NULL,
	[start_time] [datetime] NOT NULL,
	[end_time] [datetime] NULL,
	[possible_end_time] [datetime] NULL,
	[is_current_scan] [bit] NOT NULL,
	[reason] [varchar](50) NULL,
	[entered_by] [varchar](50) NOT NULL,
	[entered_on] [datetime] NOT NULL,
	[last_modified_by] [varchar](50) NOT NULL,
	[last_modified_on] [datetime] NOT NULL,
	CONSTRAINT [PK_Scan_Scan_Id] PRIMARY KEY CLUSTERED ([scan_id] ASC),
    CONSTRAINT [FK_Scan_Asset_Id] FOREIGN KEY ([asset_id]) REFERENCES [dbo].[Asset] ([asset_id]),
    CONSTRAINT [UNC_Scan_Name_Scan_Id] UNIQUE NONCLUSTERED ([badge] ASC)
);