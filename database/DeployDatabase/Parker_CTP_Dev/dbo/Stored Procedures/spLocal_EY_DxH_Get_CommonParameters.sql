

--
-- Copyright © 2019 Ernst & Young LLP
-- All Rights Reserved
-- spLocal_EY_DxH_Get_CommonParameters
--
--  Purpose:

--	Provide the CommonParameter info
--
--	If no input value given for parameter, all CommonParameters are returned
--	If a specific parameter is given as input, only that parameter is returned
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
--	20190906		C00V00 - Intial code created		
--	20191129		C00V01 - Change to CommonParametersTest new requirement
--
-- Example Call:
-- exec spLocal_EY_DxH_Get_CommonParameters 1
--
CREATE PROCEDURE [dbo].[spLocal_EY_DxH_Get_CommonParameters]
--Declare
	@Site_Id			INT
AS


BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;

Declare @Output table
	(
	Id								Int Identity,
	parameter_id					Int, 
	site_id							Int,
	site_name						NVARCHAR(100),
	production_day_offset_minutes	FLOAT,
	site_timezone					NVARCHAR(100),
	ui_timezone						NVARCHAR(100),
	escalation_level1_minutes		FLOAT,
	escalation_level2_minutes		FLOAT,
	default_target_percent_of_ideal FLOAT,
	default_setup_minutes			FLOAT,
	default_routed_cycle_time		FLOAT,
	setup_lookback_minutes			FLOAT,
	inactive_timeout_minutes		FLOAT,
	language						NVARCHAR(100),
	message							Varchar(100)
	)

Declare
	@ReturnMessage				Varchar(100),
	@json_out					nVarchar(max)

If 
	(
	IsNull(@Site_Id,'') <> ''
	And
	not exists (Select site_id From dbo.CommonParameters with (nolock) Where site_id = IsNull(@Site_Id,0) AND status = 'Active')
	)
Begin
	Select 
		@ReturnMessage = 'Invalid Site Id ' + convert(varchar,IsNull(@Site_Id,''))
	Goto ErrExit
End

	Insert @Output
		Select 
			parameter_id,
			site_id,
			site_name,
			production_day_offset_minutes,
			site_timezone,
			ui_timezone,
			escalation_level1_minutes,
			escalation_level2_minutes,
			default_target_percent_of_ideal,
			default_setup_minutes,
			default_routed_cycle_time,
			setup_lookback_minutes,
			inactive_timeout_minutes,
			language,
			Null
		From dbo.CommonParameters with (nolock)
		Where site_id = IsNull(@Site_Id,site_id) AND status = 'Active'

ErrExit:

If not exists (Select Id From @Output)
Begin
	If IsNull(@ReturnMessage,'') <> ''
	Begin
		Insert @Output (site_id,message)
			Select
				@Site_Id,
				@ReturnMessage 
	End
	Else
	Begin
		Insert @Output (site_id,message)
			Select
				@Site_Id,
				'No Data' 
	End
End	

Select @json_out = 
	(
	Select 
		parameter_id						as 'CommonParameters.parameter_id',
		site_id								as 'CommonParameters.site_id',
		site_name							as 'CommonParameters.site_name',
		production_day_offset_minutes		as 'CommonParameters.production_day_offset_minutes',
		site_timezone						as 'CommonParameters.site_timezone',
		ui_timezone							as 'CommonParameters.ui_timezone',
		escalation_level1_minutes			as 'CommonParameters.escalation_level1_minutes',
		escalation_level2_minutes			as 'CommonParameters.escalation_level2_minutes',
		default_target_percent_of_ideal		as 'CommonParameters.default_target_percent_of_ideal',
		default_setup_minutes				as 'CommonParameters.default_setup_minutes',
		default_routed_cycle_time			as 'CommonParameters.default_routed_cycle_time',
		setup_lookback_minutes				as 'CommonParameters.setup_lookback_minutes',
		inactive_timeout_minutes			as 'CommonParameters.inactive_timeout_minutes',
		language							as 'CommonParameters.language',
		message								as 'CommonParameters.message'	
	From @Output o 
	Order By 
		o.parameter_id
	For Json path, INCLUDE_NULL_VALUES
	)

Select @json_out as 'CommonParameters'

--Select * From @Output

Return

END


/****** Object:  StoredProcedure [dbo].[spLocal_EY_DxH_Get_DTReason]    Script Date: 4/12/2019 15:16:22 ******/
SET ANSI_NULLS ON
