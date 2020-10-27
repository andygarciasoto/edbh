

--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Put_OperatorSignoff
--
--  Purpose:

--	Given a dxhdata_id and some way to identify operator, store the initials 
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
--	DxHData
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20190809		C00V00 - Intial code created		
--		
-- Example Call:
-- Exec spLocal_EY_DxH_Put_OperatorSignOff 3, '3276', Null, Null, '2019-08-09 15:08:28.220'
--
CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Put_OperatorSignOff_new_1]
--Declare
	@DxHData_Id				Int,			-- the hour Id
	@Clock_Number			Varchar(100),	-- used to look up First and Last, leave blank if you have first and last
	@First_Name				Varchar(100),	-- 
	@Last_Name				Varchar(100),	--
	@Timestamp				Datetime		-- generally the current time
AS

BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;

Declare @Output table
	(
	Id							Int Identity,
	dxhdata_id					Int, 
	operator_signoff			Varchar(100),	
	operator_signoff_timestamp	Datetime,
	last_modified_by			Varchar(100), 
	last_modified_on			Datetime,
	message						Varchar(100)
	)

Declare
	@First				Varchar(50),
	@Last				Varchar(50),
	@Initials			Varchar(50),	
	@ReturnStatus		Int,
	@ReturnMessage		Varchar(1000)

If not exists (Select dxhdata_id From dbo.DxHData with (nolock) Where dxhdata_id = IsNull(@DxHData_Id,-1))
Begin
	Select 
		@ReturnStatus = -1,
		@ReturnMessage = 'Invalid DxHData_Id ' + convert(varchar,IsNull(@DxHData_Id,''))
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

Insert @Output
	Select 
		@DxHData_Id,
		@Initials,
		@Timestamp,
		@Initials,
		getdate(),
		Null

Update dbo.DxHData
Set operator_signoff = o.operator_signoff,
	operator_signoff_timestamp = o.operator_signoff_timestamp, 
	last_modified_by = o.last_modified_by, 
	last_modified_on = o.last_modified_on
From dbo.DxHData dxh,
	@Output o			
Where dxh.dxhdata_id = o.dxhdata_id

Select 
	@ReturnStatus = 0,
	@ReturnMessage = 'Operator signed off ' + convert(varchar,@DxHData_Id)


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