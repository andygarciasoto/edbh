/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_Workcell]    Script Date: 6/4/2021 09:10:47 ******/

/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_Workcell]    Script Date: 31/12/2020 09:35:04 ******/

-- Example Call:
-- exec spLocal_EY_DxH_Put_Workcell 'Cell 1', 'Workcell 1', 1

CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Put_Workcell] 
	@workcell_id			AS INT,
	@workcell_name			AS NVARCHAR(100),
	@workcell_description	AS NVARCHAR(100),			
	@site_id				AS INT

AS  BEGIN 

	IF EXISTS (SELECT workcell_id FROM dbo.Workcell
	WHERE
	site_id = @site_id AND workcell_id = @workcell_id)
		BEGIN
			UPDATE dbo.Workcell
			SET 
			workcell_name = @workcell_name,
			workcell_description = @workcell_description,
			last_modified_by = 'Administration Tool',
			last_modified_on = GETDATE()
			WHERE
			site_id = @site_id AND workcell_id = @workcell_id
		END
	ELSE
		BEGIN
			INSERT INTO dbo.Workcell
           (workcell_name
           ,workcell_description
           ,entered_by
           ,entered_on
           ,last_modified_by
           ,last_modified_on
		   ,site_id)
		VALUES
           (@workcell_name
           ,@workcell_description
           ,'Administration Tool'
           ,GETDATE()
           ,'Administration Tool'
           ,GETDATE()
		   ,@site_id)
		END
	END
	
		