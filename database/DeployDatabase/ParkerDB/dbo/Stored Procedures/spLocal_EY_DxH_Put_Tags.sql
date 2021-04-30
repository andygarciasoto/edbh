/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_Tags]    Script Date: 8/4/2021 01:39:10 ******/

/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_Tags]    Script Date: 31/12/2020 09:35:04 ******/

-- Example Call:
-- exec spLocal_EY_DxH_Put_Users 8, 'Modbus.ADAM01CRIMPER.CRIMPER_PART_COUNT', 'Modbus.ADAM01CRIMPER.CRIMPER_PART_COUNT', null, 'int', 'PCS', 10000, 'SUM', 'Active', 1, 18, 10

CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Put_Tags] 
	@tag_id					AS INT,
	@tag_code				AS NVARCHAR(256),			
	@tag_name				AS NVARCHAR(256),	
	@tag_description		AS NVARCHAR(100),	
	@datatype				AS NVARCHAR(100),	
	@UOM_code				AS NVARCHAR(100),	
	@rollover_point			AS INT,
	@aggregation			AS NVARCHAR(100),
	@status					AS NVARCHAR(100),
	@site_id				AS INT,
	@asset_id				AS INT,
	@max_change				AS FLOAT

AS  BEGIN 

	IF EXISTS (SELECT tag_code FROM dbo.Tag
	WHERE
	site_id = @site_id AND tag_id = @tag_id)
		BEGIN
			UPDATE dbo.Tag
			SET 
			tag_name = @tag_name,
			tag_description = @tag_description,
			datatype = @datatype,
			UOM_code = @UOM_code,
			rollover_point = @rollover_point,
			aggregation = @aggregation,
			asset_id = @asset_id,
			max_change = @max_change,
			status = @status,
			last_modified_by = 'Administration Tool',
			last_modified_on = GETDATE()
			WHERE
			site_id = @site_id AND tag_id = @tag_id
		END
	ELSE
		BEGIN
			INSERT INTO dbo.Tag
           (tag_code
           ,tag_name
           ,tag_description
           ,datatype
           ,UOM_code
		   ,rollover_point
		   ,aggregation
		   ,site_id
		   ,asset_id
		   ,max_change
		   ,status
           ,entered_by
           ,entered_on
           ,last_modified_by
           ,last_modified_on)
		VALUES
           (@tag_code
           ,@tag_name
           ,@tag_description
           ,@datatype
           ,@UOM_code
		   ,@rollover_point
		   ,@aggregation
		   ,@site_id
		   ,@asset_id
		   ,@max_change
		   ,@status
           ,'Administration Tool'
           ,GETDATE()
           ,'Administration Tool'
           ,GETDATE())
		END
	END
	
		