/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_Unavailable]    Script Date: 31/12/2020 09:35:04 ******/

-- Example Call:
-- exec spLocal_EY_DxH_Put_Unavailable

CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Put_Unavailable]
	@unavailable_code			AS NVARCHAR(100),
	@unavailable_name			AS NVARCHAR(200),
	@unavailable_description	AS NVARCHAR(256),
	@start_time					AS TIME,
	@end_time					AS TIME,
	@duration_in_minutes		AS INT,
	@valid_from					AS DATETIME,
	@status						AS NVARCHAR(100),
	@asset_level				AS NVARCHAR(100),
	@asset_id					AS INT,
	@site_id					AS INT
AS
	BEGIN 

	DECLARE
		@site_level		AS NVARCHAR(100) = 'Site',
		@area_level		AS NVARCHAR(100) = 'Area',
		@cell_level		AS NVARCHAR(100) = 'Cell';

	IF EXISTS (SELECT unavailable_id FROM dbo.Unavailable
	WHERE unavailable_code = @unavailable_code AND asset_id = @asset_id)
		BEGIN
			UPDATE dbo.Unavailable
			SET
				unavailable_name = @unavailable_name,
				unavailable_description = @unavailable_description,
				start_time = @start_time,
				end_time = @end_time,
				duration_in_minutes = @duration_in_minutes,
				valid_from = @valid_from,
				valid_to = null,
				status = @status,
				last_modified_by = 'Administration Tool',
				last_modified_on = GETDATE()
			WHERE
			unavailable_code = @unavailable_code AND asset_id = @asset_id
		END
	ELSE
		BEGIN
			INSERT INTO dbo.Unavailable
           ([unavailable_code]
           ,[unavailable_name]
           ,[unavailable_description]
           ,[start_time]
           ,[end_time]
           ,[duration_in_minutes]
           ,[valid_from]
           ,[valid_to]
           ,[status]
           ,[entered_by]
           ,[entered_on]
           ,[last_modified_by]
           ,[last_modified_on]
           ,[site_id]
           ,[asset_id])
		SELECT
		S.[unavailable_code],
		S.[unavailable_name],
		S.[unavailable_description],
		S.[start_time],
		S.[end_time],
		S.[duration_in_minutes],
		S.[valid_from],
		S.[valid_to],
		S.[status],
		S.[entered_by],
		S.[entered_on],
		S.[last_modified_by],
		S.[last_modified_on],
		@site_id AS site_id,
		A.asset_id
		FROM (VALUES
			(	@unavailable_code,
				@unavailable_name,
				@unavailable_description,
				@start_time,
				@end_time,
				@duration_in_minutes,
				@valid_from,
				null,
				@status,
				'Administration Tool',
				GETDATE(),
				'Administration Tool',
				GETDATE(),
				@asset_level,
				@asset_id
			)
		) AS S([unavailable_code],[unavailable_name],[unavailable_description],[start_time],[end_time],[duration_in_minutes],[valid_from],[valid_to],[status],[entered_by],[entered_on],
		[last_modified_by],[last_modified_on],asset_level,asset_id)
		OUTER APPLY [dbo].[AssetsResolverFromId] (s.asset_id, CASE WHEN S.asset_level=@site_level THEN 2 WHEN S.asset_level= @area_level THEN 1 ELSE 0 END) as H
		INNER JOIN dbo.Asset A ON
				H.asset_id = A.asset_id AND A.asset_level = @cell_level AND A.status = 'Active';
		END
	END