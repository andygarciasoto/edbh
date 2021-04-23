/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_CommonParameters]    Script Date: 26/3/2021 12:46:15 ******/

/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_CommonParameters]    Script Date: 31/12/2020 09:35:04 ******/

-- Example Call:
-- exec spLocal_EY_DxH_Put_CommonParameters 1, 'Eaton', -60, 0.9, 20, 300, 480, 'Active', 10080, 20, 30, 'Eaton', 'http://tfd036w04.us.parker.corp/jTrax/DxHTrigger/api/assemblyorder', 36, 1, 'Group 1'

CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Put_CommonParameters] 
	@site_id							AS INT,
	@site_name							AS NVARCHAR(100),
	@production_day_offset_minutes		AS FLOAT,			
	@default_target_percent_of_ideal	AS FLOAT,	
	@default_setup_minutes				AS FLOAT,		
	@default_routed_cycle_time			AS FLOAT,
	@inactive_timeout_minutes			AS FLOAT,	
	@status								AS NVARCHAR(100),
	@summary_timeout					AS INT,
	@break_minutes						AS FLOAT,
	@lunch_minutes						AS FLOAT,
	@site_prefix						AS NVARCHAR(100),
	@assembly_url						AS NVARCHAR(256),			
	@timezone_id						AS INT,
	@language_id						AS INT,
	@escalation_group					AS NVARCHAR(50)	
    
AS  BEGIN 

	IF EXISTS (SELECT site_id FROM dbo.CommonParameters
	WHERE
	site_id = @site_id)
		BEGIN
			UPDATE dbo.CommonParameters
			SET 
			site_name = @site_name,
			production_day_offset_minutes = @production_day_offset_minutes,
			default_target_percent_of_ideal = @default_target_percent_of_ideal,
			default_setup_minutes = @default_setup_minutes,
			default_routed_cycle_time = @default_routed_cycle_time,
			inactive_timeout_minutes = @inactive_timeout_minutes,
			status = @status,
			summary_timeout = @summary_timeout,
			break_minutes = @break_minutes,
			lunch_minutes = @lunch_minutes,
			site_prefix = @site_prefix,
			assembly_url = @assembly_url,
			timezone_id = @timezone_id,
			language_id = @language_id,
			last_modified_by = 'Administration Tool',
			last_modified_on = GETDATE(),
			escalation_group = @escalation_group
			WHERE
			site_id = @site_id
		END
	ELSE
		BEGIN
			INSERT INTO dbo.CommonParameters
           (site_id
           ,site_name
           ,production_day_offset_minutes
           ,default_target_percent_of_ideal
           ,default_setup_minutes
		   ,default_routed_cycle_time
		   ,inactive_timeout_minutes
		   ,status
		   ,summary_timeout
		   ,break_minutes
		   ,lunch_minutes
		   ,site_prefix
		   ,assembly_url
		   ,timezone_id
		   ,language_id
           ,entered_by
           ,entered_on
           ,last_modified_by
           ,last_modified_on
		   ,escalation_group)

		VALUES
           (@site_id
           ,@site_name
           ,@production_day_offset_minutes
           ,@default_target_percent_of_ideal
           ,@default_setup_minutes
		   ,@default_routed_cycle_time
		   ,@inactive_timeout_minutes
		   ,@status
		   ,@summary_timeout
		   ,@break_minutes
		   ,@lunch_minutes
		   ,@site_prefix
		   ,@assembly_url
		   ,@timezone_id
		   ,@language_id
           ,'Administration Tool'
           ,GETDATE()
           ,'Administration Tool'
           ,GETDATE()
		   ,@escalation_group)
		END
	END
