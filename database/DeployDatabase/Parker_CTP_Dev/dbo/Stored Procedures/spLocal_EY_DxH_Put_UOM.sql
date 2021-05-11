/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_UOM]    Script Date: 6/4/2021 09:10:47 ******/

/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_UOM]    Script Date: 31/12/2020 09:35:04 ******/

-- Example Call:
-- exec spLocal_EY_DxH_Put_UOM 1, 'PCS', 'PCS', 'Pieces', 'Active', 1, 1

CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Put_UOM] 
	@uom_id					AS INT,
	@uom_code				AS NVARCHAR(100),
	@uom_name				AS NVARCHAR(100),			
	@uom_description		AS NVARCHAR(256),
	@status					AS NVARCHAR(100),
	@site_id				AS INT,
	@decimals				AS BIT

AS  BEGIN 

	IF EXISTS (SELECT uom_id FROM dbo.UOM
	WHERE
	site_id = @site_id AND uom_id = @uom_id)
		BEGIN
			UPDATE dbo.UOM
			SET 
			uom_code = @uom_code,
			uom_name = @uom_name,
			uom_description = @uom_description,
			status = @status,
			decimals = @decimals,
			last_modified_by = 'Administration Tool',
			last_modified_on = GETDATE()
			WHERE
			site_id = @site_id AND uom_id = @uom_id
		END
	ELSE
		BEGIN
			INSERT INTO dbo.UOM
           (UOM_code
           ,UOM_name
		   ,UOM_description
		   ,status
           ,entered_by
           ,entered_on
           ,last_modified_by
           ,last_modified_on
		   ,site_id
		   ,decimals)
		VALUES
           (@uom_code
           ,@uom_name
		   ,@uom_description
		   ,@status
           ,'Administration Tool'
           ,GETDATE()
           ,'Administration Tool'
           ,GETDATE()
		   ,@site_id
		   ,@decimals)
		END
	END
	
		