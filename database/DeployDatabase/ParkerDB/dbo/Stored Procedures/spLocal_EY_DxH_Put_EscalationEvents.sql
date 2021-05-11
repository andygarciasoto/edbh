/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_EscalationEvents]    Script Date: 20/4/2021 14:58:33 ******/

/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_EscalationEvents]    Script Date: 31/12/2020 09:35:04 ******/

-- Example Call:
-- exec spLocal_EY_DxH_Put_EscalationEvents 1685795, 76, '2021-05-06 18:28:00', null, 'Badge', 1, 1

CREATE   PROCEDURE [dbo].[spLocal_EY_DxH_Put_EscalationEvents] 
	@dxhdata_id			AS INT,
	@asset_id			AS INT,
	@escalation_time	AS DATETIME,			
	@sign_time			AS DATETIME,	
	@badge				AS NVARCHAR(100),
	@site_id				AS INT,
	@escalation_id		AS INT

AS  BEGIN 

	IF EXISTS (SELECT dxhdata_id FROM dbo.EscalationEvents
	WHERE
	dxhdata_id = @dxhdata_id AND @escalation_time IS NULL)
		BEGIN
			UPDATE dbo.EscalationEvents
			SET 
			sign_time = @sign_time,
			badge = @badge
			WHERE
			dxhdata_id = @dxhdata_id AND @escalation_time IS NULL
		END
	ELSE
		BEGIN
			IF NOT EXISTS (SELECT dxhdata_id FROM dbo.EscalationEvents
			WHERE
			dxhdata_id = @dxhdata_id)
			BEGIN
				INSERT INTO dbo.EscalationEvents
			   (dxhdata_id
			   ,asset_id
			   ,escalation_time
			   ,site
			   ,escalation_id)
			VALUES
			   (@dxhdata_id
			   ,@asset_id
			   ,@escalation_time
			   ,@site_id
			   ,@escalation_id)
			END
		END
	END
