/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_Shifts]    Script Date: 10/3/2021 13:22:54 ******/

/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_Shifts]    Script Date: 31/12/2020 09:35:04 ******/

-- Example Call:
-- exec spLocal_EY_DxH_Put_Shifts null, 'EY - example shift', 'example shift', 'testing', 1, '08:00', 0, '21:00', 0, 480, '2021-03-02 10:54:17.000', null, true, 'Active', 225

CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Put_Shifts] 
	@shift_id				AS INT,
	@shift_code				AS NVARCHAR(100),
	@shift_name				AS NVARCHAR(100),			
	@shift_description		AS NVARCHAR(256),	
	@shift_sequence			AS INT,		
	@start_time				AS TIME,
	@start_time_offset_days	AS INT,	
	@end_time				AS TIME,
	@end_time_offset_days	AS INT,
	@duration_in_minutes	AS INT,
	@valid_from				AS DATETIME,
	@is_first_shift_of_day	AS BIT,
	@status					AS NVARCHAR(100),			
	@asset_id				AS NVARCHAR(100)		
    
AS  BEGIN 

	IF EXISTS (SELECT shift_id FROM dbo.Shift
	WHERE
	shift_id = @shift_id AND asset_id = @asset_id)
		BEGIN
			UPDATE dbo.Shift
			SET
			shift_name = @shift_name,
			shift_description = @shift_description,
			shift_sequence = @shift_sequence,
			start_time = @start_time,
			start_time_offset_days = @start_time_offset_days,
			end_time = @end_time,
			end_time_offset_days = @end_time_offset_days,
			duration_in_minutes = @duration_in_minutes,
			valid_from = @valid_from,
			valid_to = null,
			is_first_shift_of_day = @is_first_shift_of_day,
			status = @status,
			last_modified_by = 'Administration Tool',
			last_modified_on = GETDATE()
			WHERE
			shift_id = @shift_id AND asset_id = @asset_id
		END
	ELSE
		BEGIN
			INSERT INTO dbo.Shift
           (shift_code
           ,shift_name
           ,shift_description
           ,shift_sequence
           ,start_time
		   ,start_time_offset_days
		   ,end_time
		   ,end_time_offset_days
		   ,duration_in_minutes
		   ,valid_from
		   ,valid_to
		   ,is_first_shift_of_day
		   ,status
           ,entered_by
           ,entered_on
           ,last_modified_by
           ,last_modified_on
		   ,asset_id)
		VALUES
           (@shift_code
           ,@shift_name
           ,@shift_description
           ,@shift_sequence
           ,@start_time
		   ,@start_time_offset_days
		   ,@end_time
		   ,@end_time_offset_days
		   ,@duration_in_minutes
		   ,@valid_from
		   ,null
		   ,@is_first_shift_of_day
		   ,@status
           ,'Administration Tool'
           ,GETDATE()
           ,'Administration Tool'
           ,GETDATE()
		   ,@asset_id)
		END
	END