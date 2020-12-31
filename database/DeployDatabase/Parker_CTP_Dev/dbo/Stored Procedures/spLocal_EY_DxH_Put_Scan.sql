/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_Scan]    Script Date: 31/12/2020 09:35:04 ******/

-- Example Call:
-- Exec spLocal_EY_DxH_Put_Scan 'EYAdministrator', 'Administrator', 'EY', 228, '2020-12-31 10:50:28.220', 'lunch', 225, 15, 30

CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Put_Scan] 
	@badge					as VARCHAR(100),			
	@first_name				as VARCHAR(100),	
	@last_name				as VARCHAR(100),	
	@asset_id				as INT,	
	@timestamp				as DATETIME,
	@reason					as VARCHAR(100),
	@site_id				as INT,
	@break_minutes			as FLOAT,
	@lunch_minutes			as FLOAT
 AS  BEGIN 
 DECLARE
 @initials as VARCHAR(100),
 @possible_end_time as DATETIME

SELECT @initials = CONVERT(VARCHAR, LEFT(@first_name, 1)) + CONVERT(VARCHAR, LEFT(@last_name, 1));

IF EXISTS (SELECT asset_id FROM dbo.Asset
WHERE
asset_id = @asset_id)
BEGIN
	IF EXISTS (SELECT Badge FROM dbo.TFDUsers
	WHERE
	Badge = @badge)
	BEGIN
		IF @reason = 'lunch'
		BEGIN
		SELECT @possible_end_time = DATEADD(mi, @lunch_minutes, @timestamp);
		END
		IF @reason = 'break'
		BEGIN
		SELECT @possible_end_time = DATEADD(mi, @break_minutes, @timestamp);
		END

		IF EXISTS (SELECT TOP 1 badge FROM dbo.Scan
		WHERE
		badge = @badge 
		AND is_current_scan = 1)
		BEGIN
			UPDATE [dbo].[Scan]
			SET [end_time] = @timestamp
			  ,[is_current_scan] = 0
			  ,[last_modified_by] = @initials
			  ,[last_modified_on] = GETDATE()
			  ,[reason] = @reason
			WHERE badge = @badge 
			AND is_current_scan = 1
		END

		INSERT INTO [dbo].[Scan]
           ([badge]
           ,[first_name]
           ,[last_name]
           ,[asset_id]
           ,[start_time]
           ,[possible_end_time]
           ,[is_current_scan]
           ,[entered_by]
           ,[entered_on]
           ,[last_modified_by]
           ,[last_modified_on])
		VALUES
           (@badge
           ,@first_name
           ,@last_name
           ,@asset_id
           ,@timestamp
           ,@possible_end_time
           ,1
           ,@initials
           ,GETDATE()
           ,@initials
           ,GETDATE())

	END
END
END
