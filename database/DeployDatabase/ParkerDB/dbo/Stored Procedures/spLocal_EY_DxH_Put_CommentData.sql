

--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Put_CommentData
--
--  Purpose:

--	Given a dxhdata_id and needed comment info, store the comment data
--
--	If the @Update field is Null or 0, then it is a new insert
--	If the @Update field is Not Null and Not 0, it is an update 
--		and the value is the commentdata_id to update
--
--	Returns a status and a message
--		 0 is pass
--		-1 is fail
--		
--
--	To Do:
--
--  Output Parameters:
---
--  Input Parameters:
---
---	
--  Trigger:
---
--  Data Read Other Inputs:  
--- 
---	
--  Data Written Results:
---
--  Assumptions:
--- 
--  Dependencies: 
---	None
---
--  Variables:
---
---
--  Tables Modified:
--	CommentData
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20190808		C00V00 - Intial code created		
--	20190818		C00V01 - Validated Timestamp and used it for entered_on for inserts		
--	20190822		C00V02 - Timestamp adjusted to UTC to be used as entered_on
--	20191204		C00V03 - Change CommonParameters to CommonParameters
--		
-- Example Call:
-- Exec spLocal_EY_DxH_Put_CommentData 3, 'Any ole comment', '2136', Null, Null, '2019-07-25 00:00:00.000', 0
--
CREATE    PROCEDURE [dbo].[spLocal_EY_DxH_Put_CommentData]
--Declare
	@DxHData_Id				Int,			-- the hour Id
	@Comment				NVARCHAR(256),	-- the main info for the display
	@Clock_Number			NVARCHAR(100),	-- used to look up First and Last, leave Null if you have first and last
	@First_Name				NVARCHAR(100),	-- Leave Null if you send Clock Number
	@Last_Name				NVARCHAR(100),	-- Leave Null if you send Clock Number
	@Timestamp				Datetime,		-- most likely use current time in site timezone
	@Update					Int				-- Null or 0 for insert, send the specific commentdata_id for update
AS

BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;

Declare @Output table
	(
	Id							Int Identity,
	commentdata_id				Int, 
	dxhdata_id					Int, 
	comment						NVARCHAR(256), 
	first_name					NVARCHAR(100), 
	last_name					NVARCHAR(100), 
	entered_by					NVARCHAR(100), 
	entered_on					Datetime, 
	last_modified_by			NVARCHAR(100), 
	last_modified_on			Datetime,
	message						NVARCHAR(100)
	)

Declare
	@First				NVARCHAR(50),
	@Last				NVARCHAR(50),
	@Initials			NVARCHAR(50),	
	@CommentData_Id		Int,
	@Existing_Comment	NVARCHAR(256),
	@ReturnStatus		Int,
	@ReturnMessage		NVARCHAR(1000),
	@Site_Timezone		NVARCHAR(100),
	@Timestamp_UTC		Datetime,
	@asset_id			INT,
	@Site_Id			INT

SET @asset_id = (SELECT asset_id 
                  FROM DxHData
                 WHERE dxhdata_id = @DxHData_Id)

SELECT @Site_Id = asset_id
FROM [dbo].[Asset] WHERE asset_level = 'Site' AND site_code = (SELECT site_code FROM [dbo].[Asset] WHERE asset_id=@asset_id);

Select @Site_Timezone = T.sql_timezone
From dbo.CommonParameters CP INNER JOIN dbo.Timezone T
ON T.timezone_id = CP.timezone_id
AND site_id = @Site_Id AND CP.status = 'Active';

Select @Timestamp_UTC = @Timestamp at time zone @Site_Timezone at time zone 'UTC'

If not exists (Select dxhdata_id From dbo.DxHData with (nolock) Where dxhdata_id = IsNull(@DxHData_Id,-1))
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid DxHData_Id ' + convert(NVARCHAR,IsNull(@DxHData_Id,''))
	Goto ErrExit
End

If IsNull(@Comment,'') = ''
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Comment ' + convert(NVARCHAR,IsNull(@Comment,''))
		Goto ErrExit
End

If exists (Select Badge From dbo.TFDUsers with (nolock) Where Badge = IsNull(@Clock_Number,-1))
Begin
	Select @First = First_Name,
		@Last = Last_Name
	From dbo.TFDUsers with (nolock) 
	Where Badge = @Clock_Number

	If IsNull(@First_Name,'') = ''
	Begin
		Set @First_Name = @First
	End

	If IsNull(@Last_Name,'') = ''
	Begin
		Set @Last_Name = @Last
	End
End

If IsNull(@First_Name,'') = ''
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid First Name ' + convert(NVARCHAR,IsNull(@First_Name,''))
		Goto ErrExit
End

If IsNull(@Last_Name,'') = ''
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Last Name ' + convert(NVARCHAR,IsNull(@Last_Name,''))
		Goto ErrExit

End

Select @Initials = convert(NVARCHAR,left(@First_Name,1)) +  convert(NVARCHAR,left(@last_Name,1))

If IsDate(@Timestamp)  <> 1 
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Timestamp ' + convert(NVARCHAR,IsNull(@Timestamp,''))
		Goto ErrExit
End

If 
	(IsNull(@Update,0) <> 0) 
	And 
	(not exists (Select commentdata_id From dbo.CommentData with (nolock) Where commentdata_id = IsNull(@Update,-1)))
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Update ' + convert(NVARCHAR,IsNull(@Update,''))
		Goto ErrExit
End


If IsNull(@Update,0) = 0
Begin
	Insert @Output
		Select 
			Null,
			@DxHData_Id,
			@Comment,
			@First_Name,
			@Last_Name,
			@Initials,
			@Timestamp_UTC,
			@Initials,
			getdate(),
			Null

	Insert dbo.CommentData
		Select 
			dxhdata_id, 
			comment, 
			first_name, 
			last_name, 
			entered_by, 
			entered_on, 
			last_modified_by, 
			last_modified_on
		From @Output			

		Set @CommentData_Id =  SCOPE_IDENTITY()

		Select 
			@ReturnStatus = 0,
			@ReturnMessage = 'Inserted ' + convert(NVARCHAR,@CommentData_Id)

End
Else
Begin
	If exists (Select commentdata_id From dbo.CommentData with (nolock) Where commentdata_id = IsNull(@Update,-1))
	Begin
		Select @Existing_Comment = comment
		From dbo.CommentData with (nolock) 
		Where commentdata_id = IsNull(@Update,-1)	

		If IsNull(@Existing_Comment,'') <> IsNull(@Comment,'')	
		Begin
			Update dbo.CommentData
			Set comment = @Comment,
				last_modified_by = @Initials,
				last_modified_on = getdate()
			Where commentdata_id = @Update

			Select 
				@ReturnStatus = 0,
				@ReturnMessage = 'Updated ' + convert(NVARCHAR,IsNull(@Update,''))
		End	
		Else
		Begin
			Select 
				@ReturnStatus = -1,
				@ReturnMessage = 'Nothing to update ' + convert(NVARCHAR,IsNull(@Update,''))

		End

	End

End

ErrExit:

	If @ReturnStatus is Null
	Begin
		Select 
			@ReturnStatus = -1,
			@ReturnMessage = 'Unknown Error'
	End 

	Select 
		@ReturnStatus as 'Return.Status',
		@ReturnMessage as 'Return.Message'
	For Json path, INCLUDE_NULL_VALUES 

Return

END


/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_DTData]    Script Date: 4/12/2019 15:24:50 ******/
SET ANSI_NULLS ON
