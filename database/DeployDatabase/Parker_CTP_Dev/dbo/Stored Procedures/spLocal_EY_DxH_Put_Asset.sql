/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_Asset]    Script Date: 8/4/2021 09:14:38 ******/

CREATE    PROCEDURE [dbo].[spLocal_EY_DxH_Put_Asset] (
	@asset_id					as INT,
	@asset_code					as NVARCHAR(100),			
	@asset_name					as NVARCHAR(200),	
	@asset_description			as NVARCHAR(256),	
	@asset_level				as NVARCHAR(100),	
	@site_code					as NVARCHAR(100),	
	@parent_asset_code			as NVARCHAR(100),
	@automation_level			as NVARCHAR(100),
	@include_in_escalation		as BIT,
	@grouping1					as NVARCHAR(256),
	@grouping2					as NVARCHAR(256),
	@grouping3    				as NVARCHAR(256),
	@grouping4					as NVARCHAR(256),
	@grouping5					as NVARCHAR(256),
	@status						as NVARCHAR(50),
	@target_percent_of_ideal	as FLOAT,
	@is_multiple				as BIT)
	
AS  BEGIN 

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
	WHERE asset_id = @asset_id AND site_code = @site_code
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
			   ,[is_multiple])
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
			   ,@is_multiple)
	END
END

