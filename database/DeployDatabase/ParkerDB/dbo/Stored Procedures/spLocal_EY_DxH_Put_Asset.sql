/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_Asset]    Script Date: 28/4/2021 15:04:54 ******/

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
	@value_stream				as VARCHAR(100),
	@site_prefix				as NVARCHAR(100))
	
AS  BEGIN 

	DECLARE
	@Site					INT,
	@New_Site_Id			INT,
	@Count					INT,
	@escalation_group		NVARCHAR(50);

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
				   ,CASE WHEN @asset_level = 'Site' THEN @asset_code ELSE @site_code END
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
				   SET @New_Site_Id = SCOPE_IDENTITY();

			IF (@asset_level = 'Site')
			BEGIN

			SELECT @Site = asset_id
			FROM dbo.Asset
			WHERE asset_code = @site_code AND asset_level = 'Site';

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
			SELECT
				Badge,
				Username,
				First_Name,
				Last_Name,
				@New_Site_Id AS Site,
				role_id,
				status,
				'Administration Tool' AS entered_by,
				GETDATE() AS entered_on,
				'Administration Tool' AS last_modified_by,
				GETDATE() AS last_modified_on,
				escalation_id
			FROM dbo.TFDUsers
				WHERE Badge = @badge AND Site = @Site;

			
			INSERT INTO [dbo].[CommonParameters]
				(site_id,
				site_name,
				production_day_offset_minutes,
				site_timezone,
				ui_timezone,
				default_target_percent_of_ideal,
				default_setup_minutes,
				default_routed_cycle_time,
				inactive_timeout_minutes,
				language,
				status,
				entered_by,
				entered_on,
				last_modified_by,
				last_modified_on,
				summary_timeout,
				break_minutes,
				lunch_minutes,
				site_prefix,
				assembly_url,
				timezone_id,
				language_id)
			SELECT
				@New_Site_Id AS site_id,
				@asset_name AS site_name,
				production_day_offset_minutes,
				site_timezone,
				ui_timezone,
				default_target_percent_of_ideal,
				default_setup_minutes,
				default_routed_cycle_time,
				inactive_timeout_minutes,
				language,
				'Active' AS status,
				'Administration Tool' AS entered_by,
				GETDATE() AS entered_on,
				'Administration Tool' AS last_modified_by,
				GETDATE() AS last_modified_on,
				summary_timeout,
				break_minutes,
				lunch_minutes,
				@site_prefix,
				assembly_url,
				timezone_id,
				language_id
			FROM dbo.CommonParameters
				WHERE site_id = @Site;

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
			SELECT
				CONCAT(@site_prefix,'-',shift_name) AS shift_code,
				shift_name,
				shift_sequence,
				start_time,
				end_time,
				start_time_offset_days,
				end_time_offset_days,
				duration_in_minutes,
				valid_from,
				is_first_shift_of_day,
				status,
				'Administration Tool' AS entered_by,
				GETDATE() AS entered_on,
				'Administration Tool' AS last_modified_by,
				GETDATE() AS last_modified_on,
				@New_Site_Id AS asset_id
			FROM dbo.Shift
				WHERE asset_id = @Site;

			SELECT @Count = COUNT(DISTINCT E.escalation_group) + 1
			FROM dbo.Escalation E;

			SELECT @escalation_group = escalation_group FROM dbo.CommonParameters
				WHERE site_id = @Site;

			IF (ISNULL(@escalation_group,'') <> '')
			BEGIN
				INSERT INTO dbo.Escalation
					(escalation_name
					,escalation_group
					,escalation_level
					,escalation_hours
					,status
					,entered_by
					,entered_on
					,last_modified_by
					,last_modified_on)
				SELECT
					escalation_name,
					'Group ' + CAST(@Count AS VARCHAR(2)) as escalation_group,
					escalation_level,
					escalation_hours,
					'Active' as status,
					'Administration Tool' as entered_by,
					GETDATE() as entered_on,
					'Administration Tool' as last_modified_by,
					GETDATE() as last_modified_on
				FROM dbo.Escalation
					WHERE escalation_group = @escalation_group;
			END
			ELSE
			BEGIN
				INSERT INTO dbo.Escalation
					(escalation_name
					,escalation_group
					,escalation_level
					,escalation_hours
					,status
					,entered_by
					,entered_on
					,last_modified_by
					,last_modified_on)
				SELECT
					escalation_name,
					'Group ' + CAST(@Count AS VARCHAR(2)) as escalation_group,
					escalation_level,
					escalation_hours,
					'Active' as status,
					'Administration Tool' as entered_by,
					GETDATE() as entered_on,
					'Administration Tool' as last_modified_by,
					GETDATE() as last_modified_on
				FROM dbo.Escalation
					WHERE escalation_id IN (1,2,3);
			END
		
			UPDATE dbo.CommonParameters
				SET escalation_group = 'Group ' + CAST(@Count AS VARCHAR(2))
			WHERE site_id = @New_Site_Id;

			END
		END
END
