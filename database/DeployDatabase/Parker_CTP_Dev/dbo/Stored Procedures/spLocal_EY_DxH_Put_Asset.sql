/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_Asset]    Script Date: 21/4/2021 12:25:55 ******/

/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_Asset]    Script Date: 20/4/2021 14:10:56 ******/

CREATE    PROCEDURE [dbo].[spLocal_EY_DxH_Put_Asset] (
	@asset_id					as INT,
	@asset_code					as NVARCHAR(100),			
	@asset_name					as NVARCHAR(200),	
	@asset_description			as NVARCHAR(256),	
	@asset_level				as NVARCHAR(100),	
	@site_code					as NVARCHAR(100),	
	@parent_asset_code			as NVARCHAR(100),
	@automation_level			as NVARCHAR(100),
	@include_in_escalation		as NVARCHAR(100),
	@grouping1					as NVARCHAR(256),
	@grouping2					as NVARCHAR(256),
	@grouping3    				as NVARCHAR(256),
	@grouping4					as NVARCHAR(256),
	@grouping5					as NVARCHAR(256),
	@status						as NVARCHAR(50),
	@target_percent_of_ideal	as FLOAT,
	@is_multiple				as BIT,
	@is_dynamic					as BIT,
	@badge						as VARCHAR(100),
	@value_stream				as VARCHAR(100))
	
AS  BEGIN 

DECLARE
@Username							NVARCHAR(100),
@First_Name							NVARCHAR(100),
@Last_Name							NVARCHAR(100),
@Site								INT,
@role_id							INT,
@escalation_id						INT,
@production_day_offset_minutes		FLOAT,
@inactive_timeout_minutes			INT,
@summary_timeout					INT,
@timezone_id						INT,
@language_id						INT,
@site_timezone						NVARCHAR(100),
@ui_timezone						NVARCHAR(100),
@language							NVARCHAR(50),
@site_name							NVARCHAR(100)

        SELECT TOP 1 
				@Username = TFD.Username,
				@First_Name = TFD.First_Name,
				@Last_Name = TFD.Last_Name,
				@role_id = TFD.role_id,
				@escalation_id = TFD.escalation_id
        FROM [dbo].[TFDUsers] TFD
		INNER JOIN dbo.Asset A ON TFD.Site = A.asset_id AND A.asset_code = @site_code
        WHERE TFD.Badge = @badge;

IF EXISTS (SELECT asset_id FROM dbo.Asset
	WHERE
	asset_id = @asset_id
	AND site_code = @site_code)
BEGIN
	UPDATE [dbo].[Asset]
	   SET [asset_name] = @asset_name
		  ,[asset_description] = @asset_description
		  ,[asset_level] = @asset_level
		  ,[parent_asset_code] = @parent_asset_code
		  ,[automation_level] = @automation_level
		  ,[include_in_escalation] = @include_in_escalation
		  ,[grouping1] = @grouping1
		  ,[grouping2] = @grouping2
		  ,[grouping3] = @grouping3
		  ,[grouping4] = @grouping4
		  ,[grouping5] = @grouping5
		  ,[status] = @status
		  ,[entered_by] = 'Administration Tool'
		  ,[entered_on] = GETDATE()
		  ,[last_modified_by] = 'Administration Tool'
		  ,[last_modified_on] = getDate()
		  ,[target_percent_of_ideal] = @target_percent_of_ideal
		  ,[is_multiple] = @is_multiple
		  ,[is_dynamic] = @is_dynamic
		  ,[value_stream] = @value_stream
	WHERE asset_code = @asset_code AND site_code = @site_code
	END
ELSE
	BEGIN
	INSERT INTO [dbo].[Asset]
			   ([asset_code]
			   ,[asset_name]
			   ,[asset_description]
			   ,[asset_level]
			   ,[site_code]
			   ,[parent_asset_code]
			   ,[automation_level]
			   ,[include_in_escalation]
			   ,[grouping1]
			   ,[grouping2]
			   ,[grouping3]
			   ,[grouping4]
			   ,[grouping5]
			   ,[status]
			   ,[entered_by]
			   ,[entered_on]
			   ,[last_modified_by]
			   ,[last_modified_on]
			   ,[target_percent_of_ideal]
			   ,[is_multiple]
			   ,[is_dynamic]
			   ,[value_stream])
		 VALUES
			   (@asset_code
			   ,@asset_name
			   ,@asset_description
			   ,@asset_level
			   ,@site_code
			   ,@parent_asset_code
			   ,@automation_level
			   ,@include_in_escalation
			   ,@grouping1
			   ,@grouping2
			   ,@grouping3
			   ,@grouping4
			   ,@grouping5
			   ,@status
			   ,'Administration Tool'
			   , GETDATE()
			   , 'Administration Tool'
			   , GETDATE()
			   ,@target_percent_of_ideal
			   ,@is_multiple
			   ,@is_dynamic
			   ,@value_stream)
			   SET @Site = SCOPE_IDENTITY();

		IF (@asset_level = 'Site')
		BEGIN

		SELECT @site_name = asset_name
		FROM dbo.Asset
		WHERE asset_id = @Site

		INSERT INTO [dbo].[TFDUsers]
			(Badge
			,Username
			,First_Name
			,Last_Name
			,Site
			,role_id
			,status
			,entered_by
			,entered_on
			,last_modified_by
			,last_modified_on
			,escalation_id)
		VALUES
			(@badge
			,@Username
			,@First_Name
			,@Last_Name
			,@Site
			,@role_id
			,'Active'
			,'Administration Tool'
			,GETDATE()
			,'Administration Tool'
			,GETDATE()
			,@escalation_id)

			 SELECT 
				@production_day_offset_minutes = CP.production_day_offset_minutes,
				@inactive_timeout_minutes = CP.inactive_timeout_minutes,
				@summary_timeout = CP.summary_timeout,
				@timezone_id = CP.timezone_id,
				@language_id = CP.language_id,
				@site_timezone = CP.site_timezone,
				@ui_timezone = CP.ui_timezone,
				@language = CP.language
        FROM [dbo].[CommonParameters] CP
		INNER JOIN dbo.TFDUsers TFD ON TFD.Site = CP.site_id
        WHERE TFD.Badge = @badge;
			
			INSERT INTO [dbo].[CommonParameters]
			(site_id
			,site_name
			,production_day_offset_minutes
			,site_timezone
			,ui_timezone
			,language
			,status
			,entered_by
			,entered_on
			,last_modified_by
			,last_modified_on
			,summary_timeout
			,timezone_id
			,language_id
			,site_prefix)
			VALUES
			(@Site
			,@site_name
			,@production_day_offset_minutes
			,@site_timezone
			,@ui_timezone
			,@language
			,'Active'
			,'Administration Tool'
			,GETDATE()
			,'Administration Tool'
			,GETDATE()
			,@summary_timeout
			,@timezone_id
			,@language_id
			,@site_name)

			INSERT INTO dbo.Shift
			(shift_code
			,shift_name
			,shift_sequence
			,start_time
			,end_time
			,start_time_offset_days
			,end_time_offset_days
			,duration_in_minutes
			,valid_from
			,is_first_shift_of_day
			,status
			,entered_by
			,entered_on
			,last_modified_by
			,last_modified_on
			,asset_id)
			VALUES
			(@site_name + '-Shift'
			,@site_name + '-Shift'
			,1
			,'00:00'
			,'23:00'
			,0
			,0
			,1380
			,GETDATE()
			,1
			,'Active'
			,'Administration Tool'
			,GETDATE()
			,'Administration Tool'
			,GETDATE()
			,@Site)
		END
	END
END
