CREATE TABLE [dbo].[CommentData] (
    [commentdata_id]   INT            IDENTITY (1, 1) NOT NULL,
    [dxhdata_id]       INT            NOT NULL,
    [comment]          NVARCHAR (256) NOT NULL,
    [first_name]       NVARCHAR (100) NOT NULL,
    [last_name]        NVARCHAR (100) NOT NULL,
    [entered_by]       NVARCHAR (100) CONSTRAINT [DF_Comment_entered_by] DEFAULT (N'SQL Manual Entry') NOT NULL,
    [entered_on]       DATETIME       CONSTRAINT [DF_Comment_entered_on] DEFAULT (getdate()) NOT NULL,
    [last_modified_by] NVARCHAR (100) CONSTRAINT [DF_Comment_last_modified_by] DEFAULT (N'SQL Manual Entry') NOT NULL,
    [last_modified_on] DATETIME       CONSTRAINT [DF_Comment_last_modified_on] DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PK_CommentData_CommentData_Id] PRIMARY KEY CLUSTERED ([commentdata_id] ASC),
    CONSTRAINT [FK_CommentData_DxHData_ID] FOREIGN KEY ([dxhdata_id]) REFERENCES [dbo].[DxHData] ([dxhdata_id])
);


GO
CREATE NONCLUSTERED INDEX [NCI_CommentData_DxHData_Id]
    ON [dbo].[CommentData]([dxhdata_id] ASC);


GO
CREATE TRIGGER [dbo].[TR_CommentData_After_Insert] ON [dbo].[CommentData]
    AFTER INSERT
AS
    DECLARE
		@dxhdata_id			INT,
		@production_day		DATETIME,
		@shift_code			NVARCHAR(100),
		@hour_interval		VARCHAR(100),
		@asset_id			INT,
		@site_id			INT,
		@shift_start_time	DATETIME,
		@shift_end_time		DATETIME,
		@start_datetime		DATETIME,
		@end_datetime		DATETIME,
		@order_id			INT;

	--Get dxhdata_id of the inserted comment
    SELECT
		@dxhdata_id = I.dxhdata_id
    FROM Inserted I;

	SELECT
		@production_day = production_day,
		@shift_code = shift_code,
		@asset_id = asset_id,
		@hour_interval = hour_interval
	FROM dbo.DxHData WHERE dxhdata_id = @dxhdata_id;

	--Check if not exists production row for the dxhdata
	IF NOT EXISTS(SELECT * FROM dbo.ProductionData WHERE dxhdata_id = @dxhdata_id) AND EXISTS (SELECT * FROM dbo.OrderData WHERE asset_id = @asset_id)
	BEGIN

		SELECT
			@site_id = asset_id
		FROM dbo.Asset WHERE asset_code = (SELECT site_code FROM dbo.Asset WHERE asset_id = @asset_id);

		SELECT
			@shift_start_time = DATEADD(HOUR, DATEPART(HOUR, start_time), DATEADD(DAY, start_time_offset_days, @production_day)),
			@shift_end_time = DATEADD(HOUR, DATEPART(HOUR, end_time), DATEADD(DAY, end_time_offset_days, @production_day))
		FROM dbo.Shift WHERE shift_code = @shift_code;

		SELECT 
			@start_datetime = started_on_chunck,
			@end_datetime = ended_on_chunck
		FROM [dbo].[GetRangesBetweenDates](@shift_start_time, @shift_end_time, 60, 1) AS BD
		WHERE LOWER(CONCAT(FORMAT(BD.started_on_chunck, 'htt'), ' - ', FORMAT(BD.ended_on_chunck, 'htt'))) = @hour_interval;
	
		SELECT
			@order_id = order_id
		FROM dbo.OrderData OD
		WHERE asset_id = @Asset_Id AND 
			(
				(OD.end_time IS NULL AND OD.start_time < @start_datetime) OR
				(OD.start_time < @start_datetime AND OD.end_time > @end_datetime)
			);

		--SELECT @dxhdata_id, @order_id, @site_id, @asset_id, @start_datetime;
		EXEC dbo.spLocal_EY_DxH_Insert_ProductionData @dxhdata_id, @order_id, @site_id, @asset_id, @start_datetime;
	END;
       
