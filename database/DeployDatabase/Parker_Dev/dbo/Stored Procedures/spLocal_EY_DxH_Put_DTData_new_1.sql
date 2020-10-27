


--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights 
-- spLocal_EY_DxH_Put_DTData
--
--  Purpose:

--	Given a dxhdata_id and downtime info, store the DTData 
--
--	Note that this does some data validation
--		Minutes must not be negative
--		Minutes must not be greater than 60
-- 
--	This code DOES NOT manage the total minutes
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
--	DTData
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20190814		C00V00 - Intial code created		
--	20190820		C00V01 - Timestamp used as entered_on for inserts		
--	20190822		C00V02 - Timestamp adjusted to UTC to be used as entered_on 
--	20191204		C00V03 - Change CommonParameters to CommonParameters
--		
-- Example Call:
-- Exec spLocal_EY_DxH_Put_DTData 3, 4, 5, '3276', Null, Null, '2019-08-09 15:08:28.220', Null
--
CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Put_DTData_new_1]
--Declare
	@DxHData_Id				Int,			-- the hour Id
	@DTReason_Id			Int,
	@DTMinutes				Float,
	@Clock_Number			Varchar(100),	-- used to look up First and Last, leave Null if you have first and last
	@First_Name				Varchar(100),	-- Leave Null if you send Clock Number
	@Last_Name				Varchar(100),	-- Leave Null if you send Clock Number
	@Timestamp				Datetime,		-- generally the current time in site timezone
	@Update					Int				-- generally Null or 0, send dtdata_id to update

AS

--Select @DxHData_Id = 3,
--	@DTReason_Id = 4, 
--	@DTMinutes = 5,
--	@Clock_Number = '3276',
--	@Timestamp = getdate()

BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;

Declare @Output table
	(
	Id							Int Identity,
	dtdata_id					Int, 
	dxhdata_id					Int, 
	dtreason_id					Int,
	dtminutes					Float,
	entered_by					Varchar(100), 
	entered_on					Datetime, 
	last_modified_by			Varchar(100), 
	last_modified_on			Datetime,
	message						Varchar(100),
	name						Varchar(100)	
	)

Declare
	@First					Varchar(50),
	@Last					Varchar(50),
	@Initials				Varchar(50),	
	@ReturnStatus			Int,
	@ReturnMessage			Varchar(1000),
	@DTData_Id				Int,
	@Existing_DTReason_Id	Int,
	@Existing_DTMinutes		Float,
	@Site_Timezone			Varchar(100),
	@Timestamp_UTC			Datetime,
	@asset_id				INT,
	@Site_Id				INT

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

If not exists 
	(
	Select dr.dtreason_id 
	From dbo.DTReason dr with (nolock),
		dbo.DxHData dxh with (nolock)
	Where dxh.dxhdata_id = @DxHData_Id
		And dxh.asset_id = dr.asset_id
		And dr.dtreason_id = IsNull(@DTReason_Id,-1)	
	)
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid DTReason_Id ' + convert(varchar,IsNull(@DTReason_Id,''))
	Goto ErrExit
End

If 
	(
	IsNull(@DTMinutes,-1) < 0
	Or
	IsNull(@DTMinutes,-1) > 60.0
	)
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid DTMinutes ' + convert(varchar,IsNull(@DTMinutes,''))
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
		@ReturnMessage = 'Invalid timestamp ' + convert(varchar,IsNull(@Timestamp,''))
		Goto ErrExit
End

If 
	(IsNull(@Update,0) <> 0) 
	And 
	(not exists (Select dtdata_id From dbo.DTData with (nolock) Where dtdata_id = IsNull(@Update,-1)))
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
			@DxHData_Id,
			@DTReason_Id,
			@DTMinutes,
			@Initials,
			@Timestamp_UTC,
			@Initials,
			getdate(),
			Null,
			@First_Name + ' ' + @Last_Name

	Insert dbo.DTData
			(dxhdata_id, dtreason_id, dtminutes, entered_by, entered_on, last_modified_by, last_modified_on, name)
		Select 
			dxhdata_id, 
			dtreason_id, 
			dtminutes, 
			entered_by, 
			entered_on, 
			last_modified_by, 
			last_modified_on,
			name
		From @Output			

		Set @DTData_Id =  SCOPE_IDENTITY()

		Select 
			@ReturnStatus = 0,
			@ReturnMessage = 'Inserted ' + convert(varchar,@DTData_Id)

End
Else
Begin
	If exists (Select dtdata_id From dbo.DTData with (nolock) Where dtdata_id = IsNull(@Update,-1))
	Begin
		Select @Existing_DTReason_Id = dtreason_id,
			@Existing_DTMinutes = dtminutes
		From dbo.DTData with (nolock) 
		Where dtdata_id = IsNull(@Update,-1)	

		If 
			(
			IsNull(@Existing_DTReason_Id,-1) <> IsNull(@DTReason_Id,-1)	
			Or
			IsNull(@Existing_DTMinutes,-1) <> IsNull(@DTMinutes,-1)	
			)
		Begin
			Update dbo.DTData
			Set dtreason_id = @DTReason_Id,
				dtminutes = @DTMinutes,
				last_modified_by = @Initials,
				last_modified_on = getdate(),
				name = @First_Name + ' ' + @Last_Name
			Where dtdata_id = @Update

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


/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Put_InterShiftData]    Script Date: 4/12/2019 15:25:17 ******/
SET ANSI_NULLS ON
