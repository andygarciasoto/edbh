module.exports = Object.freeze({
    DTReason: [
        { header: 'dtreason_code', key: 'dtreason_code' },
        { header: 'dtreason_name', key: 'dtreason_name', width: 34 },
        { header: 'dtreason_description', key: 'dtreason_description', width: 34 },
        { header: 'dtreason_category', key: 'dtreason_category', width: 19 },
        { header: 'asset_code', key: 'asset_code', width: 12 },
        { header: 'reason1', key: 'reason1' },
        { header: 'reason2', key: 'reason2' },
        { header: 'status', key: 'status' },
        { header: 'entered_by', key: 'entered_by', width: 19 },
        { header: 'entered_on', key: 'entered_on', width: 14 },
        { header: 'last_modified_by', key: 'last_modified_by', width: 19 },
        { header: 'last_modified_on', key: 'last_modified_on', width: 17 }
    ],
    DTReasonSQL: (site_id) => {
        return `SELECT [DTReason].[dtreason_code],[DTReason].[dtreason_name],[DTReason].[dtreason_description],[DTReason].[dtreason_category],
        [Asset].[asset_code],[DTReason].[reason1],[DTReason].[reason2],[DTReason].[status],[DTReason].[entered_by],[DTReason].[entered_on],
        [DTReason].[last_modified_by],[DTReason].[last_modified_on] FROM [dbo].[DTReason] JOIN [dbo].[Asset] ON [DTReason].[asset_id] = [Asset].[asset_id]
        WHERE [Asset].[site_code] = (SELECT asset_code FROM [dbo].[Asset] WHERE asset_id = ${site_id});`;
    },
    Asset: [
        { header: 'asset_code', key: 'asset_code', width: 16 },
        { header: 'asset_name', key: 'asset_name', width: 16 },
        { header: 'asset_description', key: 'asset_description', width: 27 },
        { header: 'asset_level', key: 'asset_level', width: 12 },
        { header: 'site_code', key: 'site_code', width: 16 },
        { header: 'parent_asset_code', key: 'parent_asset_code', width: 20 },
        { header: 'value_stream', key: 'value_stream', width: 15 },
        { header: 'automation_level', key: 'automation_level', width: 28 },
        { header: 'include_in_escalation', key: 'include_in_escalation', width: 21 },
        { header: 'grouping1', key: 'grouping1', width: 10 },
        { header: 'grouping2', key: 'grouping2', width: 10 },
        { header: 'grouping3', key: 'grouping3', width: 10 },
        { header: 'grouping4', key: 'grouping4', width: 10 },
        { header: 'grouping5', key: 'grouping5', width: 10 },
        { header: 'status', key: 'status' },
        { header: 'entered_by', key: 'entered_by', width: 19 },
        { header: 'entered_on', key: 'entered_on', width: 14 },
        { header: 'last_modified_by', key: 'last_modified_by', width: 19 },
        { header: 'last_modified_on', key: 'last_modified_on', width: 17 }
    ],
    AssetSQL: (site_id) => {
        return `SELECT [asset_code],[asset_name],[asset_description],[asset_level],[site_code],[parent_asset_code],[value_stream],[automation_level],
        [include_in_escalation],[grouping1],[grouping2],[grouping3],[grouping4],[grouping5],[status],[entered_by],[entered_on],[last_modified_by],
        [last_modified_on] FROM [dbo].[Asset] WHERE [site_code] = (SELECT asset_code FROM [dbo].[Asset] WHERE asset_id = ${site_id});`
    },
    Shift: [
        { header: 'shift_code', key: 'shift_code', width: 14 },
        { header: 'shift_name', key: 'shift_name', width: 16 },
        { header: 'shift_description', key: 'shift_description', width: 27 },
        { header: 'shift_sequence', key: 'shift_sequence', width: 14 },
        { header: 'start_time', key: 'start_time', width: 16 },
        { header: 'end_time', key: 'end_time', width: 27 },
        { header: 'duration_in_minutes', key: 'duration_in_minutes', width: 22 },
        { header: 'valid_from', key: 'valid_from', width: 16 },
        { header: 'valid_to', key: 'valid_to', width: 27 },
        { header: 'asset_code', key: 'asset_code', width: 14 },
        { header: 'team_code', key: 'team_code', width: 16 },
        { header: 'asset_description', key: 'asset_description', width: 27 },
        { header: 'is_first_shift_of_day', key: 'is_first_shift_of_day', width: 20 },
        { header: 'status', key: 'status' },
        { header: 'entered_by', key: 'entered_by', width: 19 },
        { header: 'entered_on', key: 'entered_on', width: 14 },
        { header: 'last_modified_by', key: 'last_modified_by', width: 19 },
        { header: 'last_modified_on', key: 'last_modified_on', width: 17 }
    ],
    ShiftSQL: (site_id) => {
        return `SELECT [Shift].[shift_code],[Shift].[shift_name],[Shift].[shift_description],[Shift].[shift_sequence],[Shift].[start_time],[Shift].[end_time],
        [Shift].[duration_in_minutes],[Shift].[valid_from],[Shift].[valid_to],[Asset].[asset_code],[Shift].[team_code],[Shift].[is_first_shift_of_day],
        [Shift].[status],[Shift].[entered_by],[Shift].[entered_on],[Shift].[last_modified_by],[Shift].[last_modified_on]
        FROM [dbo].[Shift] JOIN [dbo].[Asset] ON [Asset].[asset_id] = [Shift].[asset_id] WHERE [Asset].[asset_id] = ${site_id};`
    },
    Tag: [
        { header: 'tag_code', key: 'tag_code', width: 24 },
        { header: 'tag_name', key: 'tag_name', width: 24 },
        { header: 'tag_description', key: 'tag_description', width: 25 },
        { header: 'asset_code', key: 'asset_code', width: 15 },
        { header: 'tag_group', key: 'tag_group', width: 16 },
        { header: 'datatype', key: 'datatype', width: 13 },
        { header: 'tag_type', key: 'tag_type', width: 11 },
        { header: 'UOM_code', key: 'UOM_code', width: 14 },
        { header: 'rollover_point', key: 'rollover_point', width: 20 },
        { header: 'aggregation', key: 'aggregation', width: 15 },
        { header: 'status', key: 'status' },
        { header: 'entered_by', key: 'entered_by', width: 19 },
        { header: 'entered_on', key: 'entered_on', width: 14 },
        { header: 'last_modified_by', key: 'last_modified_by', width: 19 },
        { header: 'last_modified_on', key: 'last_modified_on', width: 17 }
    ],
    TagSQL: (site_id) => {
        return `SELECT [Tag].[tag_code],[Tag].[tag_name],[Tag].[tag_description],[Asset].[asset_code],[Tag].[tag_group],[Tag].[datatype],[Tag].[tag_type],
        [Tag].[UOM_code],[Tag].[rollover_point],[Tag].[aggregation],[Tag].[status],[Tag].[entered_by],[Tag].[entered_on],[Tag].[last_modified_by],
        [Tag].[last_modified_on] FROM [dbo].[Tag] JOIN [dbo].[Asset] ON [Tag].[asset_id] = [Asset].[asset_id] WHERE [Asset].[site_code] = (SELECT asset_code FROM [dbo].[Asset] WHERE asset_id = ${site_id});`
    },
    CommonParameters: [
        { header: 'asset_code', key: 'asset_code', width: 15 },
        { header: 'site_name', key: 'site_name', width: 15 },
        { header: 'production_day_offset_minutes', key: 'production_day_offset_minutes', width: 31 },
        { header: 'site_timezone', key: 'site_timezone', width: 24 },
        { header: 'ui_timezone', key: 'ui_timezone', width: 24 },
        { header: 'escalation_level1_minutes', key: 'escalation_level1_minutes', width: 26 },
        { header: 'escalation_level2_minutes', key: 'escalation_level2_minutes', width: 26 },
        { header: 'default_target_percent_of_ideal', key: 'default_target_percent_of_ideal', width: 32 },
        { header: 'default_setup_minutes', key: 'default_setup_minutes', width: 23 },
        { header: 'default_routed_cycle_time', key: 'default_routed_cycle_time', width: 26 },
        { header: 'setup_lookback_minutes', key: 'setup_lookback_minutes', width: 25 },
        { header: 'inactive_timeout_minutes', key: 'inactive_timeout_minutes', width: 26 },
        { header: 'language', key: 'language', width: 13 },
        { header: 'status', key: 'status' },
        { header: 'entered_by', key: 'entered_by', width: 19 },
        { header: 'entered_on', key: 'entered_on', width: 14 },
        { header: 'last_modified_by', key: 'last_modified_by', width: 19 },
        { header: 'last_modified_on', key: 'last_modified_on', width: 17 }
    ],
    CommonParametersSQL: (site_id) => {
        return `SELECT [Asset].[asset_code],[CommonParametersTest].[site_name],[CommonParametersTest].[production_day_offset_minutes],[CommonParametersTest].[site_timezone],
        [CommonParametersTest].[ui_timezone],[CommonParametersTest].[escalation_level1_minutes],[CommonParametersTest].[escalation_level2_minutes],
        [CommonParametersTest].[default_target_percent_of_ideal],[CommonParametersTest].[default_setup_minutes],[CommonParametersTest].[default_routed_cycle_time],
        [CommonParametersTest].[setup_lookback_minutes],[CommonParametersTest].[inactive_timeout_minutes],[CommonParametersTest].[language],[CommonParametersTest].[status],
        [CommonParametersTest].[entered_by],[CommonParametersTest].[entered_on],[CommonParametersTest].[last_modified_by],[CommonParametersTest].[last_modified_on]
        FROM [dbo].[CommonParametersTest] JOIN [dbo].[Asset] ON [CommonParametersTest].[site_id] = [Asset].[asset_id] WHERE [Asset].[asset_id] = ${site_id};`;
    },
    UOM: [
        { header: 'UOM_code', key: 'UOM_code', width: 14 },
        { header: 'UOM_name', key: 'UOM_name', width: 16 },
        { header: 'UOM_description', key: 'UOM_description', width: 27 },
        { header: 'site_code', key: 'site_code', width: 14 },
        { header: 'status', key: 'status' },
        { header: 'entered_by', key: 'entered_by', width: 19 },
        { header: 'entered_on', key: 'entered_on', width: 14 },
        { header: 'last_modified_by', key: 'last_modified_by', width: 19 },
        { header: 'last_modified_on', key: 'last_modified_on', width: 17 }
    ],
    UOMSQL: (site_id) => {
        return `SELECT [UOM].[UOM_code],[UOM].[UOM_name],[UOM].[UOM_description],[Asset].[site_code],[UOM].[status],[UOM].[entered_by],[UOM].[entered_on],[UOM].[last_modified_by],
        [UOM].[last_modified_on] FROM [dbo].[UOM] JOIN [dbo].[Asset] ON [Asset].[asset_id] = [UOM].[site_id] WHERE [Asset].[asset_id] = ${site_id};`;
    },
    Unavailable: [
        { header: 'unavailable_code', key: 'unavailable_code', width: 24 },
        { header: 'unavailable_name', key: 'unavailable_name', width: 21 },
        { header: 'unavailable_description', key: 'unavailable_description', width: 27 },
        { header: 'start_time', key: 'start_time', width: 16 },
        { header: 'end_time', key: 'end_time', width: 27 },
        { header: 'duration_in_minutes', key: 'duration_in_minutes', width: 21 },
        { header: 'valid_from', key: 'valid_from', width: 16 },
        { header: 'valid_to', key: 'valid_to', width: 27 },
        { header: 'asset_code', key: 'asset_code', width: 14 },
        { header: 'status', key: 'status' },
        { header: 'entered_by', key: 'entered_by', width: 19 },
        { header: 'entered_on', key: 'entered_on', width: 14 },
        { header: 'last_modified_by', key: 'last_modified_by', width: 19 },
        { header: 'last_modified_on', key: 'last_modified_on', width: 17 }
    ],
    UnavailableSQL: (site_id) => {
        return `SELECT [Unavailable].[unavailable_code],[Unavailable].[unavailable_name],[Unavailable].[unavailable_description],[Unavailable].[start_time],
        [Unavailable].[end_time],[Unavailable].[duration_in_minutes],[Unavailable].[valid_from],[Unavailable].[valid_to],[Asset].[asset_code],
        [Unavailable].[status],[Unavailable].[entered_by],[Unavailable].[entered_on],[Unavailable].[last_modified_by],[Unavailable].[last_modified_on]
        FROM [dbo].[Unavailable] JOIN [dbo].[Asset] ON [Unavailable].[asset_id] = [Asset].[asset_id] WHERE [Asset].[asset_id] = ${site_id};`;
    },
    TFDUsers: [
        { header: 'Badge', key: 'Badge', width: 14 },
        { header: 'Username', key: 'Username', width: 14 },
        { header: 'First_Name', key: 'First_Name', width: 14 },
        { header: 'Role', key: 'Role', width: 14 },
        { header: 'asset_code', key: 'asset_code', width: 14 }
    ],
    TFDUsersSQL: (site_id) => {
        return `SELECT [Badge],[Username],[First_Name],[Last_Name],[Role],[Asset].[asset_code] FROM [dbo].[TFDUsers] JOIN [dbo].[Asset] 
        ON [TFDUsers].[Site] = [Asset].[asset_id] WHERE [Asset].[asset_id] = ${site_id};`;
    }
})