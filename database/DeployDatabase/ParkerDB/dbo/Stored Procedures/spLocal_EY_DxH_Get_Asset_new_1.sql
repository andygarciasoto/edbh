
--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_Asset
--
--  Purpose:

--	Provide Asset info for displays
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
--	20190903		C00V00 - Intial code created		
--  20191203		C00V01 - Change Asset_Code for Asset_Id
--		
-- Example Call:
-- exec spLocal_EY_DxH_Get_Asset 'Cell','Partially_Manual_Scan_Order', 1
--
CREATE   PROCEDURE [dbo].[spLocal_EY_DxH_Get_Asset_new_1]
--Declare
	@Level				Varchar(100),	--All, Site, Area, or Cell. Most of the time send Cell 
	@Automation_Level	Varchar(100),	--All, Automated, Partially_Manual_Scan_Order, Manual
	@Site				Int				--Asset_id of the Site
AS

BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;

Declare @Output table
	(
	Id						Int Identity,
	asset_id				Int, 
	asset_code				Varchar(100),
	asset_name				Varchar(200),
	asset_description		Varchar(256),
	asset_level				Varchar(100),
	site_code				Varchar(100),
	parent_asset_code		Varchar(100),
	value_stream			Varchar(100),
	automation_level		Varchar(100),
	include_in_escalation	bit,
	grouping1				Varchar(100),
	grouping2				Varchar(100),
	grouping3				Varchar(100),
	grouping4				Varchar(100),
	grouping5				Varchar(100),
	message					Varchar(100)
	)

Declare
	@ReturnMessage			Varchar(100),
	@json_out				nVarchar(max),
	@site_code				Varchar(100)

Set @site_code = (Select site_code from dbo.Asset where asset_id = @Site)

If IsNull(@Level,'All') not in ('All','Site','Area','Cell')
Begin
	Select 
		@ReturnMessage = 'Invalid Level ' + convert(varchar,IsNull(@Level,''))
	Goto ErrExit

End

If IsNull(@Level,'All') = 'All'
Begin
	Set @Level = Null 
End

If IsNull(@Automation_Level,'All') not in ('All','Automated','Partially_Manual_Scan_Order','Manual')
Begin
	Select 
		@ReturnMessage = 'Invalid Automation Level ' + convert(varchar,IsNull(@Automation_Level,''))
	Goto ErrExit

End

If IsNull(@Automation_Level,'All') = 'All'
Begin
	Set @Automation_Level = Null 
End


Insert @Output
	Select 
		asset_id,
		asset_code,
		asset_name,
		asset_description,
		asset_level,
		site_code,
		parent_asset_code,
		value_stream,
		automation_level,
		include_in_escalation,
		grouping1,
		grouping2,
		grouping3,
		grouping4,
		grouping5,
		Null
	From dbo.Asset with (nolock)
	Where status = 'Active'
		And site_code = @site_code
		And IsNull(asset_level,'') = IsNull(@Level,IsNull(asset_level,''))
		And IsNull(automation_level,'') = IsNull(@Automation_Level,IsNull(automation_level,''))

ErrExit:

If not exists (Select Id From @Output)
Begin
	If IsNull(@ReturnMessage,'') <> ''
	Begin
		Insert @Output (asset_level,automation_level,message)
			Select
				@Level,
				@Automation_Level,
				@ReturnMessage 
	End
	Else
	Begin
		Insert @Output (asset_level,automation_level,message)
			Select
				@Level,
				@Automation_Level,
				'No Data' 
	End
End	

Select @json_out = 
	(
	Select 
		asset_id				as 'Asset.asset_id',			
		asset_code				as 'Asset.asset_code',
		asset_name				as 'Asset.asset_name',
		asset_description		as 'Asset.asset_descriptiomn',
		asset_level				as 'Asset.asset_level',
		site_code				as 'Asset.site_code',
		parent_asset_code		as 'Asset.parent_asset_code',
		value_stream			as 'Asset.value_stream',
		automation_level		as 'Asset.automation_level',
		include_in_escalation	as 'Asset.include_in_escalation',
		grouping1				as 'Asset.grouping1',
		grouping2				as 'Asset.grouping2',
		grouping3				as 'Asset.grouping3',
		grouping4				as 'Asset.grouping4',
		grouping5				as 'Asset.grouping5',
		message					as 'Asset.message'	
	From @Output o 
	Order By 
		o.asset_code
	For Json path, INCLUDE_NULL_VALUES
	)

Select @json_out as 'Asset'

--Select * From @Output

Return

END


/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_Asset_By_Code]    Script Date: 4/12/2019 15:15:06 ******/
SET ANSI_NULLS ON
