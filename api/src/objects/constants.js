var sqlQuery = require('../objects/sqlConnection');

module.exports = Object.freeze({
    getPromise: (sqlSentence, table) => {
        return new Promise((resolve, reject) => {
            sqlQuery(sqlSentence,
                (err, response) => {
                    if (err) {
                        console.log(err);
                        return reject(err);
                    }
                    resolve({ 'response': response, 'table': table });
                })
        });
    },
    Asset: [
        { header: 'asset_code', type: 'VARCHAR', key: 'asset_code', width: 16 },
        { header: 'asset_name', type: 'VARCHAR', key: 'asset_name', width: 16 },
        { header: 'asset_description', type: 'VARCHAR', key: 'asset_description', width: 27 },
        { header: 'asset_level', type: 'VARCHAR', key: 'asset_level', width: 12 },
        { header: 'site_code', type: 'VARCHAR', key: 'site_code', width: 16 },
        { header: 'parent_asset_code', type: 'VARCHAR', key: 'parent_asset_code', width: 20 },
        { header: 'value_stream', type: 'VARCHAR', key: 'value_stream', width: 15 },
        { header: 'automation_level', type: 'VARCHAR', key: 'automation_level', width: 28 },
        { header: 'include_in_escalation', type: 'BIT', key: 'include_in_escalation', width: 21 },
        { header: 'grouping1', type: 'VARCHAR', key: 'grouping1', width: 10 },
        { header: 'grouping2', type: 'VARCHAR', key: 'grouping2', width: 10 },
        { header: 'grouping3', type: 'VARCHAR', key: 'grouping3', width: 10 },
        { header: 'grouping4', type: 'VARCHAR', key: 'grouping4', width: 10 },
        { header: 'grouping5', type: 'VARCHAR', key: 'grouping5', width: 10 },
        { header: 'status', type: 'VARCHAR', key: 'status' },
        { header: 'entered_by', type: 'VARCHAR', key: 'entered_by', width: 19 },
        { header: 'entered_on', type: 'DATETIME', key: 'entered_on', width: 14 },
        { header: 'last_modified_by', type: 'VARCHAR', key: 'last_modified_by', width: 19 },
        { header: 'last_modified_on', type: 'DATETIME', key: 'last_modified_on', width: 17 },
        { header: 'target_percent_of_ideal', type: 'FLOAT', key: 'target_percent_of_ideal', width: 28 }
    ],
    AssetSQL: (site_id) => {
        return `SELECT [asset_code],[asset_name],[asset_description],[asset_level],[site_code],[parent_asset_code],[value_stream],[automation_level],
        [include_in_escalation],[grouping1],[grouping2],[grouping3],[grouping4],[grouping5],[status],[entered_by],[entered_on],[last_modified_by],
        [last_modified_on],[target_percent_of_ideal] FROM [dbo].[Asset] WHERE [site_code] = (SELECT asset_code FROM [dbo].[Asset] WHERE asset_id = ${site_id});`
    },
    DTReason: [
        { header: 'dtreason_code', type: 'VARCHAR', key: 'dtreason_code' },
        { header: 'dtreason_name', type: 'VARCHAR', key: 'dtreason_name', width: 34 },
        { header: 'dtreason_description', type: 'VARCHAR', key: 'dtreason_description', width: 34 },
        { header: 'dtreason_category', type: 'VARCHAR', key: 'dtreason_category', width: 19 },
        { header: 'asset_code', type: 'VARCHAR', key: 'asset_code', width: 12 },
        { header: 'reason1', type: 'VARCHAR', key: 'reason1' },
        { header: 'reason2', type: 'VARCHAR', key: 'reason2' },
        { header: 'status', type: 'VARCHAR', key: 'status' },
        { header: 'entered_by', type: 'VARCHAR', key: 'entered_by', width: 19 },
        { header: 'entered_on', type: 'DATETIME', key: 'entered_on', width: 14 },
        { header: 'last_modified_by', type: 'VARCHAR', key: 'last_modified_by', width: 19 },
        { header: 'last_modified_on', type: 'DATETIME', key: 'last_modified_on', width: 17 }
    ],
    DTReasonSQL: (site_id) => {
        return `SELECT [DTReason].[dtreason_code],[DTReason].[dtreason_name],[DTReason].[dtreason_description],[DTReason].[dtreason_category],
        [Asset].[asset_code],[DTReason].[reason1],[DTReason].[reason2],[DTReason].[status],[DTReason].[entered_by],[DTReason].[entered_on],
        [DTReason].[last_modified_by],[DTReason].[last_modified_on] FROM [dbo].[DTReason] JOIN [dbo].[Asset] ON [DTReason].[asset_id] = [Asset].[asset_id]
        WHERE [Asset].[site_code] = (SELECT asset_code FROM [dbo].[Asset] WHERE asset_id = ${site_id});`;
    },
    Shift: [
        { header: 'shift_code', type: 'VARCHAR', key: 'shift_code', width: 14 },
        { header: 'shift_name', type: 'VARCHAR', key: 'shift_name', width: 16 },
        { header: 'shift_description', type: 'VARCHAR', key: 'shift_description', width: 27 },
        { header: 'shift_sequence', type: 'INT', key: 'shift_sequence', width: 14 },
        { header: 'start_time', type: 'TIME', key: 'start_time', width: 16 },
        { header: 'end_time', type: 'TIME', key: 'end_time', width: 27 },
        { header: 'duration_in_minutes', type: 'INT', key: 'duration_in_minutes', width: 22 },
        { header: 'valid_from', type: 'DATETIME', key: 'valid_from', width: 16 },
        { header: 'valid_to', type: 'DATETIME', key: 'valid_to', width: 27 },
        { header: 'asset_code', type: 'VARCHAR', key: 'asset_code', width: 14 },
        { header: 'team_code', type: 'VARCHAR', key: 'team_code', width: 16 },
        { header: 'is_first_shift_of_day', type: 'BIT', key: 'is_first_shift_of_day', width: 20 },
        { header: 'status', type: 'VARCHAR', key: 'status' },
        { header: 'entered_by', type: 'VARCHAR', key: 'entered_by', width: 19 },
        { header: 'entered_on', type: 'DATETIME', key: 'entered_on', width: 14 },
        { header: 'last_modified_by', type: 'VARCHAR', key: 'last_modified_by', width: 19 },
        { header: 'last_modified_on', type: 'DATETIME', key: 'last_modified_on', width: 17 }
    ],
    ShiftSQL: (site_id) => {
        return `SELECT [Shift].[shift_code],[Shift].[shift_name],[Shift].[shift_description],[Shift].[shift_sequence],[Shift].[start_time],[Shift].[end_time],
        [Shift].[duration_in_minutes],[Shift].[valid_from],[Shift].[valid_to],[Asset].[asset_code],[Shift].[team_code],[Shift].[is_first_shift_of_day],
        [Shift].[status],[Shift].[entered_by],[Shift].[entered_on],[Shift].[last_modified_by],[Shift].[last_modified_on]
        FROM [dbo].[Shift] JOIN [dbo].[Asset] ON [Asset].[asset_id] = [Shift].[asset_id] WHERE [Asset].[asset_id] = ${site_id};`
    },
    Tag: [
        { header: 'tag_code', type: 'VARCHAR', key: 'tag_code', width: 24 },
        { header: 'tag_name', type: 'VARCHAR', key: 'tag_name', width: 24 },
        { header: 'tag_description', type: 'VARCHAR', key: 'tag_description', width: 25 },
        { header: 'asset_code', type: 'VARCHAR', key: 'asset_code', width: 15 },
        { header: 'tag_group', type: 'VARCHAR', key: 'tag_group', width: 16 },
        { header: 'datatype', type: 'VARCHAR', key: 'datatype', width: 13 },
        { header: 'tag_type', type: 'VARCHAR', key: 'tag_type', width: 11 },
        { header: 'UOM_code', type: 'VARCHAR', key: 'UOM_code', width: 14 },
        { header: 'rollover_point', type: 'FLOAT', key: 'rollover_point', width: 20 },
        { header: 'aggregation', type: 'VARCHAR', key: 'aggregation', width: 15 },
        { header: 'status', type: 'VARCHAR', key: 'status' },
        { header: 'entered_by', type: 'VARCHAR', key: 'entered_by', width: 19 },
        { header: 'entered_on', type: 'DATETIME', key: 'entered_on', width: 14 },
        { header: 'last_modified_by', type: 'VARCHAR', key: 'last_modified_by', width: 19 },
        { header: 'last_modified_on', type: 'DATETIME', key: 'last_modified_on', width: 17 },
        { header: 'max_change', type: 'FLOAT', key: 'max_change', width: 20 },
        { header: 'site_id', type: 'FLOAT', key: 'site_id', width: 20 }
    ],
    TagSQL: (site_id) => {
        return `SELECT [Tag].[tag_code],[Tag].[tag_name],[Tag].[tag_description],[Asset].[asset_code],[Tag].[tag_group],[Tag].[datatype],[Tag].[tag_type],
        [Tag].[UOM_code],[Tag].[rollover_point],[Tag].[aggregation],[Tag].[status],[Tag].[entered_by],[Tag].[entered_on],[Tag].[last_modified_by],
        [Tag].[last_modified_on],[Tag].[max_change] FROM [dbo].[Tag] JOIN [dbo].[Asset] ON [Tag].[asset_id] = [Asset].[asset_id] WHERE [Asset].[site_code] = (SELECT asset_code FROM [dbo].[Asset] WHERE asset_id = ${site_id});`
    },
    CommonParameters: [
        { header: 'asset_code', type: 'VARCHAR', key: 'asset_code', width: 15 },
        { header: 'site_name', type: 'VARCHAR', key: 'site_name', width: 15 },
        { header: 'production_day_offset_minutes', type: 'FLOAT', key: 'production_day_offset_minutes', width: 31 },
        { header: 'site_timezone', type: 'VARCHAR', key: 'site_timezone', width: 24 },
        { header: 'ui_timezone', type: 'VARCHAR', key: 'ui_timezone', width: 24 },
        { header: 'escalation_level1_minutes', type: 'FLOAT', key: 'escalation_level1_minutes', width: 26 },
        { header: 'escalation_level2_minutes', type: 'FLOAT', key: 'escalation_level2_minutes', width: 26 },
        { header: 'default_target_percent_of_ideal', type: 'FLOAT', key: 'default_target_percent_of_ideal', width: 32 },
        { header: 'default_setup_minutes', type: 'FLOAT', key: 'default_setup_minutes', width: 23 },
        { header: 'default_routed_cycle_time', type: 'FLOAT', key: 'default_routed_cycle_time', width: 26 },
        { header: 'setup_lookback_minutes', type: 'FLOAT', key: 'setup_lookback_minutes', width: 25 },
        { header: 'language', type: 'VARCHAR', key: 'language', width: 13 },
        { header: 'status', type: 'VARCHAR', key: 'status' },
        { header: 'entered_by', type: 'VARCHAR', key: 'entered_by', width: 19 },
        { header: 'entered_on', type: 'DATETIME', key: 'entered_on', width: 14 },
        { header: 'last_modified_by', type: 'VARCHAR', key: 'last_modified_by', width: 19 },
        { header: 'last_modified_on', type: 'DATETIME', key: 'last_modified_on', width: 17 }
    ],
    CommonParametersSQL: (site_id) => {
        return `SELECT [Asset].[asset_code],[CommonParameters].[site_name],[CommonParameters].[production_day_offset_minutes],[CommonParameters].[site_timezone],
        [CommonParameters].[ui_timezone],[CommonParameters].[escalation_level1_minutes],[CommonParameters].[escalation_level2_minutes],
        [CommonParameters].[default_target_percent_of_ideal],[CommonParameters].[default_setup_minutes],[CommonParameters].[default_routed_cycle_time],
        [CommonParameters].[setup_lookback_minutes],[CommonParameters].[language],[CommonParameters].[status],
        [CommonParameters].[entered_by],[CommonParameters].[entered_on],[CommonParameters].[last_modified_by],[CommonParameters].[last_modified_on]
        FROM [dbo].[CommonParameters] JOIN [dbo].[Asset] ON [CommonParameters].[site_id] = [Asset].[asset_id] WHERE [Asset].[asset_id] = ${site_id};`;
    },
    UOM: [
        { header: 'UOM_code', type: 'VARCHAR', key: 'UOM_code', width: 14 },
        { header: 'UOM_name', type: 'VARCHAR', key: 'UOM_name', width: 16 },
        { header: 'UOM_description', type: 'VARCHAR', key: 'UOM_description', width: 27 },
        { header: 'site_code', type: 'VARCHAR', key: 'site_code', width: 14 },
        { header: 'status', type: 'VARCHAR', key: 'status' },
        { header: 'decimals', type: 'BIT', key: 'decimals' },
        { header: 'entered_by', type: 'VARCHAR', key: 'entered_by', width: 19 },
        { header: 'entered_on', type: 'DATETIME', key: 'entered_on', width: 14 },
        { header: 'last_modified_by', type: 'VARCHAR', key: 'last_modified_by', width: 19 },
        { header: 'last_modified_on', type: 'DATETIME', key: 'last_modified_on', width: 17 }
    ],
    UOMSQL: (site_id) => {
        return `SELECT [UOM].[UOM_code],[UOM].[UOM_name],[UOM].[UOM_description],[Asset].[site_code],[UOM].[status], [UOM].[decimals],[UOM].[entered_by],[UOM].[entered_on],[UOM].[last_modified_by],
        [UOM].[last_modified_on] FROM [dbo].[UOM] JOIN [dbo].[Asset] ON [Asset].[asset_id] = [UOM].[site_id] WHERE [Asset].[asset_id] = ${site_id};`;
    },
    Unavailable: [
        { header: 'unavailable_code', type: 'VARCHAR', key: 'unavailable_code', width: 24 },
        { header: 'unavailable_name', type: 'VARCHAR', key: 'unavailable_name', width: 21 },
        { header: 'unavailable_description', type: 'VARCHAR', key: 'unavailable_description', width: 27 },
        { header: 'start_time', type: 'TIME', key: 'start_time', width: 16 },
        { header: 'end_time', type: 'TIME', key: 'end_time', width: 27 },
        { header: 'duration_in_minutes', type: 'INT', key: 'duration_in_minutes', width: 21 },
        { header: 'valid_from', type: 'DATETIME', key: 'valid_from', width: 16 },
        { header: 'valid_to', type: 'DATETIME', key: 'valid_to', width: 27 },
        { header: 'asset_code', type: 'VARCHAR', key: 'asset_code', width: 14 },
        { header: 'status', type: 'VARCHAR', key: 'status' },
        { header: 'entered_by', type: 'VARCHAR', key: 'entered_by', width: 19 },
        { header: 'entered_on', type: 'DATETIME', key: 'entered_on', width: 14 },
        { header: 'last_modified_by', type: 'VARCHAR', key: 'last_modified_by', width: 19 },
        { header: 'last_modified_on', type: 'DATETIME', key: 'last_modified_on', width: 17 },
        { header: 'site_id', type: 'FLOAT', key: 'site_id', width: 20 }
    ],
    UnavailableSQL: (site_id) => {
        return `SELECT [Unavailable].[unavailable_code],[Unavailable].[unavailable_name],[Unavailable].[unavailable_description],[Unavailable].[start_time],
        [Unavailable].[end_time],[Unavailable].[duration_in_minutes],[Unavailable].[valid_from],[Unavailable].[valid_to],[Asset].[asset_code],
        [Unavailable].[status],[Unavailable].[entered_by],[Unavailable].[entered_on],[Unavailable].[last_modified_by],[Unavailable].[last_modified_on]
        FROM [dbo].[Unavailable] JOIN [dbo].[Asset] ON [Unavailable].[asset_id] = [Asset].[asset_id] WHERE [Unavailable].[site_id] = ${site_id};`;
    },
    TFDUsers: [
        { header: 'Badge', type: 'VARCHAR', key: 'Badge', width: 14 },
        { header: 'Username', type: 'VARCHAR', key: 'Username', width: 14 },
        { header: 'First_Name', type: 'VARCHAR', key: 'First_Name', width: 14 },
        { header: 'Last_Name', type: 'VARCHAR', key: 'Last_Name', width: 14 },
        { header: 'Role', type: 'VARCHAR', key: 'Role', width: 14 },
        { header: 'asset_code', type: 'VARCHAR', key: 'asset_code', width: 14 },
        { header: 'Site', type: 'FLOAT', key: 'Site', width: 20 }
    ],
    TFDUsersSQL: (site_id) => {
        return `SELECT [Badge],[Username],[First_Name],[Last_Name],[Role],[Asset].[asset_code] FROM [dbo].[TFDUsers] JOIN [dbo].[Asset] 
        ON [TFDUsers].[Site] = [Asset].[asset_id] WHERE [Asset].[asset_id] = ${site_id};`;
    }
})