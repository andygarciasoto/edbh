/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_Unavailable]    Script Date: 31/12/2020 09:35:04 ******/

-- Example Call:
-- exec spLocal_EY_DxH_Put_Unavailable

CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Put_Unavailable]
	@unavailable_code			AS NVARCHAR(100),
	@unavailable_id				AS INT,
	@unavailable_name			AS NVARCHAR(200),
	@unavailable_description	AS NVARCHAR(256),
	@start_time					AS TIME,
	@end_time					AS TIME,
	@duration_in_minutes		AS INT,
	@valid_from					AS DATETIME,
	@status						AS NVARCHAR(100),
	@asset_id					AS INT,
	@site_id					AS INT
AS
	BEGIN 

	IF EXISTS (SELECT unavailable_id FROM dbo.Unavailable
	WHERE unavailable_id = @unavailable_id)
		BEGIN
			UPDATE dbo.Unavailable
			SET
			unavailable_name = @unavailable_name,
			unavailable_description = @unavailable_description,
			start_time = @start_time,
			end_time = @end_time,
			duration_in_minutes = @duration_in_minutes,
			valid_from = @valid_from,
			valid_to = null,
			asset_id = @asset_id,
			status = @status,
			last_modified_by = 'Administration Tool',
			last_modified_on = GETDATE()
			WHERE
			unavailable_id = @unavailable_id
		END
	ELSE
		BEGIN
			INSERT INTO dbo.Unavailable
           ([unavailable_code]
           ,[unavailable_name]
           ,[unavailable_description]
           ,[start_time]
           ,[end_time]
           ,[duration_in_minutes]
           ,[valid_from]
           ,[valid_to]
           ,[status]
           ,[entered_by]
           ,[entered_on]
           ,[last_modified_by]
           ,[last_modified_on]
           ,[site_id]
           ,[asset_id])
		VALUES
           (@unavailable_code
		   ,@unavailable_name
		   ,@unavailable_description
           ,@start_time
		   ,@end_time
		   ,@duration_in_minutes
		   ,@valid_from
		   ,null
		   ,@status
           ,'Administration Tool'
           ,GETDATE()
           ,'Administration Tool'
           ,GETDATE()
		   ,@site_id
		   ,@asset_id)
		END
	END