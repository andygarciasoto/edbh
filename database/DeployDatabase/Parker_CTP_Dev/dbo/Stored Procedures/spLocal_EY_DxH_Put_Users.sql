/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_Users]    Script Date: 31/12/2020 09:35:04 ******/

-- Example Call:
-- exec spLocal_EY_DxH_Put_Users 'AdministratorHA', 'AdminHA', 'Administrator', 'HA', 1, 'Active', 127

CREATE   PROCEDURE [dbo].[spLocal_EY_DxH_Put_Users] 
	@badge					AS NVARCHAR(100),
	@username				AS NVARCHAR(100),			
	@first_name				AS NVARCHAR(100),	
	@last_name				AS NVARCHAR(100),		
	@role_id				AS INT,	
	@status					AS NVARCHAR(100),
	@site_id				AS INT,
	@escalation_id			AS INT

AS  BEGIN 

	DECLARE
	@role AS NVARCHAR(100)
	SELECT @role = name FROM dbo.Role WHERE role_id = @role_id


	IF EXISTS (SELECT Badge FROM dbo.TFDUsers
	WHERE
	Site = @site_id AND Badge = @badge)
		BEGIN
			UPDATE dbo.TFDUsers
			SET 
			Username = @username,
			First_Name = @first_name,
			Last_Name = @last_name,
			role_id = @role_id,
			status = @status,
			last_modified_by = 'Administration Tool',
			last_modified_on = GETDATE(),
			escalation_id = @escalation_id
			WHERE
			Site = @site_id AND Badge = @badge
		END
	ELSE
		BEGIN
			INSERT INTO dbo.TFDUsers
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
           ,@username
           ,@first_name
           ,@last_name
           ,@site_id
		   ,@role_id
		   ,@status
           ,'Administration Tool'
           ,GETDATE()
           ,'Administration Tool'
           ,GETDATE()
		   ,@escalation_id)
		END
	END
	
		