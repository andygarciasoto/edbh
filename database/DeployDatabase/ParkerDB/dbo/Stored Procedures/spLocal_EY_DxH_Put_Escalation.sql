/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_Escalation]    Script Date: 20/4/2021 14:58:33 ******/

/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_Escalation]    Script Date: 31/12/2020 09:35:04 ******/

-- Example Call:
-- exec spLocal_EY_DxH_Put_Escalation 'Front Line Manager', 'Group 2', 1, 2

CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Put_Escalation] 
	@escalation_id		AS INT,
	@escalation_name	AS NVARCHAR(100),
	@escalation_group	AS NVARCHAR(100),			
	@escalation_level	AS INT,	
	@escalation_hours	AS INT,
	@status				AS NVARCHAR(50)

AS  BEGIN 

	IF EXISTS (SELECT escalation_id FROM dbo.Escalation
	WHERE
	escalation_id = @escalation_id)
		BEGIN
			UPDATE dbo.Escalation
			SET 
			escalation_name = @escalation_name,
			escalation_group= @escalation_group,
			escalation_level= @escalation_level,
			escalation_hours = @escalation_hours,
			status = @status,
			last_modified_by = 'Administration Tool',
			last_modified_on = GETDATE()
			WHERE
			escalation_id = @escalation_id
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
		VALUES
           (@escalation_name
           ,@escalation_group
           ,@escalation_level
           ,@escalation_hours
           ,@status
           ,'Administration Tool'
           ,GETDATE()
           ,'Administration Tool'
           ,GETDATE())
		END
	END
