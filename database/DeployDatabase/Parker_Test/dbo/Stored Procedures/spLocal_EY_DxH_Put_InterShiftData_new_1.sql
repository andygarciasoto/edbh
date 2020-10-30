
--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Put_InterShiftData
--
--  Purpose:

--	Given a dxhdata_id and needed intershift info, store the intershift data
--
--	If the @Update field is Null or 0, then it is a new insert
--	If the @Update field is Not Null and Not 0, it is an update 
--		and the value is the intershiftdata_id to update
--
--	Returns a status and a message
--		 0 is pass
--		-1 is fail
--
--	DxHData_Id is more related to an hour but it is easy to get the needed shift info from that		
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
--	InterShiftData
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20190809		C00V00 - Intial code created		
--	20190818		C00V01 - Validated Timestamp and used it as entered_on for inserts		
--	20190822		C00V02 - Timestamp adjusted to UTC to be used as entered_on
--	20191204		C00V03 - Change CommonParameters to CommonParameters
--		
-- Example Call:
-- Exec spLocal_EY_DxH_Put_InterShiftData 3, 'shifting gears', '2477', Null, Null, '2019-08-09 15:08:28.220', 0

--
CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Put_InterShiftData_new_1]
--Declare
	@DxHData_Id				Int,			-- any hour Id of the shift associated with this data
	@Comment				Varchar(256),	-- the main info for the display
	@Clock_Number			Varchar(100),	-- used to look up First and Last, leave Null if you have first and last
	@First_Name				Varchar(100),	-- Leave Null if you send Clock Number
	@Last_Name				Varchar(100),	-- Leave Null if you send Clock Number
	@Timestamp				Datetime,		-- generally current time in site timezone
	@Update					Int				-- generally null or 0, send the intershift_id for update
AS

BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;

Declare @Output table
	(
	Id							Int Identity,
	intershift_id				Int, 
	asset_id					INT,
	production_day				Datetime,
	shift_code					Varchar(100),
	comment						Varchar(256), 
	first_name					Varchar(100), 
	last_name					Varchar(100), 
	entered_by					Varchar(100), 
	entered_on					Datetime, 
	last_modified_by			Varchar(100), 
	last_modified_on			Datetime,
	dxhdata_id					Int, 
	message						Varchar(100)
	)

Declare
	@First				Varchar(50),
	@Last				Varchar(50),
	@Initials			Varchar(50),	
	@InterShift_Id		Int,
	@Existing_Comment	Varchar(256),
	@ReturnStatus		Int,
	@ReturnMessage		Varchar(1000),
	@Site_Timezone		Varchar(100),
	@Timestamp_UTC		Datetime,
	@asset_id			INT,
	@Site_Id			INT

SET @asset_id = (SELECT asset_id 
                  FROM dbo.DxHData
                 WHERE dxhdata_id = @DxHData_Id);

SELECT @Site_Id = asset_id
FROM [dbo].[Asset] WHERE asset_level = 'Site' AND site_code = (SELECT site_code FROM [dbo].[Asset] WHERE asset_id=@asset_id);


Select @Site_Timezone = site_timezone
From dbo.CommonParameters cpt with (nolock)
Where site_id = @Site_Id AND status = 'Active';

Select @Timestamp_UTC = @Timestamp at time zone @Site_Timezone at time zone 'UTC'

If not exists (Select dxhdata_id From dbo.DxHData with (nolock) Where dxhdata_id = IsNull(@DxHData_Id,-1))
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid DxHData_Id ' + convert(varchar,IsNull(@DxHData_Id,''))
	Goto ErrExit
End

If IsNull(@Comment,'') = ''
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Comment ' + convert(varchar,IsNull(@Comment,''))
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
		@ReturnMessage = 'Invalid First Name ' + convert(varchar,IsNull(@First_Name,''))
		Goto ErrExit
End

If IsNull(@Last_Name,'') = ''
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Last Name ' + convert(varchar,IsNull(@Last_Name,''))
		Goto ErrExit

End

Select @Initials = convert(varchar,left(@First_Name,1)) +  convert(varchar,left(@last_Name,1))

If IsDate(@Timestamp) <> 1 
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Timestamp ' + convert(varchar,IsNull(@Timestamp,''))
		Goto ErrExit
End

If 
	(IsNull(@Update,0) <> 0) 
	And 
	(not exists (Select intershift_id From dbo.InterShiftData with (nolock) Where intershift_id = IsNull(@Update,-1)))
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid Update ' + convert(varchar,IsNull(@Update,''))
		Goto ErrExit
End

If IsNull(@Update,0) = 0
Begin
	Insert @Output
		Select 
			Null,
			asset_id,
			production_day,
			shift_code,
			@Comment,
			@First_Name,
			@Last_Name,
			@Initials,
			@Timestamp_UTC,
			@Initials,
			getdate(),
			@DxHData_Id,
			Null
		From dbo.DxHData with (nolock)
		Where dxhdata_id = @DxHData_Id

	Insert dbo.InterShiftData
		Select 
			production_day,
			shift_code,
			comment, 
			first_name, 
			last_name, 
			entered_by, 
			entered_on, 
			last_modified_by, 
			last_modified_on,
			asset_id
		From @Output			

		Set @InterShift_Id =  SCOPE_IDENTITY()

		Select 
			@ReturnStatus = 0,
			@ReturnMessage = 'Inserted ' + convert(varchar,@InterShift_Id)

End
Else
Begin
	If exists (Select intershift_id From dbo.InterShiftData with (nolock) Where intershift_id = IsNull(@Update,-1))
	Begin
		Select @Existing_Comment = comment
		From dbo.InterShiftData with (nolock) 
		Where intershift_id = IsNull(@Update,-1)	

		If IsNull(@Existing_Comment,'') <> IsNull(@Comment,'')	
		Begin
			Update dbo.InterShiftData
			Set comment = @Comment,
				first_name = @First_Name,
				last_name = @Last_Name,
				last_modified_by = @Initials,
				last_modified_on = getdate()
			Where intershift_id = @Update

			Select 
				@ReturnStatus = 0,
				@ReturnMessage = 'Updated ' + convert(varchar,IsNull(@Update,''))
		End	
		Else
		Begin
			Select 
				@ReturnStatus = -1,
				@ReturnMessage = 'Nothing to update ' + convert(varchar,IsNull(@Update,''))

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


/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_OperatorSignOff]    Script Date: 4/12/2019 15:25:41 ******/
SET ANSI_NULLS ON
