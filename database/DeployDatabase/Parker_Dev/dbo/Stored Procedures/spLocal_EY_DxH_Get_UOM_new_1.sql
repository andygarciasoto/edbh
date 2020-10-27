


--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_UOM
--
--  Purpose:

--	Provide the info for displaying UOM
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
--	
---
-- Modification Change History:
--------------------------------------------------------------------------------
--	20190827		C00V00 - Intial code created		
--		
-- Example Call:
-- exec spLocal_EY_DxH_Get_UOM 
--
CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Get_UOM_new_1]
--Declare
AS


BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;

Declare @Output table
	(
	Id							Int Identity,
	UOM_id						Int, 
	UOM_code					Varchar(100),
	UOM_name					Varchar(200),
	UOM_description				Varchar(100),
	site_id						INT,
	message						Varchar(100)
	)

Declare
	@ReturnMessage				Varchar(100),
	@json_out					nVarchar(max)

	Insert @Output
		Select 
			UOM_id,
			UOM_code,
			UOM_name,
			UOM_description,
			site_id,
			Null
		From dbo.UOM with (nolock)
		Where status = 'Active'

ErrExit:

If not exists (Select Id From @Output)
Begin
	If IsNull(@ReturnMessage,'') <> ''
	Begin
		Insert @Output (message)
			Select
				@ReturnMessage 
	End
	Else
	Begin
		Insert @Output (message)
			Select
				'No Data' 
	End
End	

Select @json_out = 
	(
	Select 
		UOM_id			as 'UOM.UOM_id',			
		UOM_code		as 'UOM.UOM_code',
		UOM_name		as 'UOM.UOM_name',
		UOM_description	as 'UOM.UOM_description',
		site_id			as 'UOM.site_id',
		message			as 'UOM.message'	
	From @Output o 
	Order By 
		o.UOM_code
	For Json path, INCLUDE_NULL_VALUES
	)

Select @json_out as 'UOM'

--Select * From @Output

Return

END