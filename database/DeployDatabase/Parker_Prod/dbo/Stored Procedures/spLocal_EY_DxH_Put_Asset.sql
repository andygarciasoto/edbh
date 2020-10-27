


CREATE   PROCEDURE [dbo].[spLocal_EY_DxH_Put_Asset] (@asset_code as Varchar(100),			
	@asset_name				as Varchar(200),	
	@asset_description		as Varchar(256),	
	@asset_level			as Varchar(100),	
	@site_code				as Varchar(100),	
	@parent_asset_code		as Varchar(100),		
	@value_stream			as Varchar(100),
	@automation_level		as Varchar(100),
	@include				as Varchar(100),
	@grouping1				as Varchar(256),
	@grouping2				as Varchar(256),
	@grouping3    			as Varchar(256),
	@grouping4				as Varchar(256),
	@grouping5				as Varchar(256),
	@status					as Varchar(50),
	@entered_by				as Varchar(100),
	@entered_on				as Datetime,
	@last_modified_by		as Varchar(100),
	@last_modified_on		as Datetime)

 AS  BEGIN 
 DECLARE
 @include_in_escalation as bit

 IF @asset_description = 'NULL'
 BEGIN
 SET @asset_description = NULL
 END

 IF @value_stream = 'NULL'
 BEGIN
 SET @value_stream = NULL
 END

 IF @automation_level = 'NULL'
 BEGIN
 SET @automation_level = NULL
 END

 IF @include = 'NULL'
 BEGIN
 SET @include = NULL
 END

 IF @include = '0'
 BEGIN
 SET @include_in_escalation = 0
 END

 IF @include = '1'
 BEGIN
 SET @include_in_escalation = 1
 END
 
 IF @grouping1 = 'NULL'
 BEGIN
 SET @grouping1 = NULL
 END

 IF @grouping2 = 'NULL'
 BEGIN
 SET @grouping2 = NULL
 END

 IF @grouping3 = 'NULL'
 BEGIN
 SET @grouping3 = NULL
 END

 IF @grouping4 = 'NULL'
 BEGIN
 SET @grouping4 = NULL
 END

 IF @grouping5 = 'NULL'
 BEGIN
 SET @grouping5 = NULL
 END

IF EXISTS (SELECT asset_code FROM dbo.Asset
WHERE
asset_code = @asset_code)
BEGIN
UPDATE [dbo].[Asset]
   SET [asset_name] = @asset_name
      ,[asset_description] = @asset_description
      ,[asset_level] = @asset_level
      ,[site_code] = @site_code
      ,[parent_asset_code] = @parent_asset_code
      ,[value_stream] = @value_stream
      ,[automation_level] = @automation_level
      ,[include_in_escalation] = @include_in_escalation
	  ,[grouping1] = @grouping1
      ,[grouping2] = @grouping2
      ,[grouping3] = @grouping3
      ,[grouping4] = @grouping4
      ,[grouping5] = @grouping5
      ,[status] = @status
      ,[entered_by] = 'SQL manual entry'
      ,[entered_on] = @entered_on
      ,[last_modified_by] = 'SQL manual entry'
      ,[last_modified_on] = getDate()
 WHERE asset_code = @asset_code
END

IF NOT EXISTS (SELECT asset_code FROM dbo.Asset
WHERE
asset_code = @asset_code)
BEGIN
INSERT INTO [dbo].[Asset]
           ([asset_code]
           ,[asset_name]
           ,[asset_description]
           ,[asset_level]
           ,[site_code]
           ,[parent_asset_code]
           ,[value_stream]
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
           ,[last_modified_on])
     VALUES
           (@asset_code
           ,@asset_name
           ,@asset_description
           ,@asset_level
           ,@site_code
           ,@parent_asset_code
           ,@value_stream
           ,@automation_level
           ,@include_in_escalation
           ,@grouping1
           ,@grouping2
           ,@grouping3
           ,@grouping4
           ,@grouping5
           ,@status
           ,'SQL manual entry'
           , getDate()
           , 'SQL manual entry'
           , getDate())
END
END


/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_AssetDisplaySystem]    Script Date: 4/12/2019 15:21:36 ******/
SET ANSI_NULLS ON
