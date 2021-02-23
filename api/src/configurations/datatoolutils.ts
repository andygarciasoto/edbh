import moment from 'moment';

export let headers = {
    Workcell: [
        { header: 'workcell_name', type: 'VARCHAR', key: 'workcell_name', width: 16 },
        { header: 'workcell_description', type: 'VARCHAR', key: 'workcell_description', width: 21 },
        { header: 'site_code', type: 'VARCHAR', key: 'site_code', width: 19 }
    ],
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
        { header: 'target_percent_of_ideal', type: 'FLOAT', key: 'target_percent_of_ideal', width: 28 },
        { header: 'is_multiple', type: 'BIT', key: 'is_multiple', width: 20 }
    ],
    AssetDisplaySystem: [
        { header: 'displaysystem_name', type: 'VARCHAR', key: 'displaysystem_name', width: 25 },
        { header: 'status', type: 'VARCHAR', key: 'status', width: 14 },
        { header: 'asset_code', type: 'VARCHAR', key: 'asset_code', width: 14 },
        { header: 'entered_by', type: 'VARCHAR', key: 'entered_by', width: 19 },
        { header: 'entered_on', type: 'DATETIME', key: 'entered_on', width: 14 },
        { header: 'last_modified_by', type: 'VARCHAR', key: 'last_modified_by', width: 19 },
        { header: 'last_modified_on', type: 'DATETIME', key: 'last_modified_on', width: 17 }
    ],
    DTReason: [
        { header: 'dtreason_code', type: 'VARCHAR', key: 'dtreason_code' },
        { header: 'dtreason_name', type: 'VARCHAR', key: 'dtreason_name', width: 34 },
        { header: 'dtreason_description', type: 'VARCHAR', key: 'dtreason_description', width: 34 },
        { header: 'dtreason_category', type: 'VARCHAR', key: 'dtreason_category', width: 19 },
        { header: 'asset_code', type: 'VARCHAR', key: 'asset_code', width: 14 },
        { header: 'reason1', type: 'VARCHAR', key: 'reason1' },
        { header: 'reason2', type: 'VARCHAR', key: 'reason2' },
        { header: 'status', type: 'VARCHAR', key: 'status' },
        { header: 'entered_by', type: 'VARCHAR', key: 'entered_by', width: 19 },
        { header: 'entered_on', type: 'DATETIME', key: 'entered_on', width: 14 },
        { header: 'last_modified_by', type: 'VARCHAR', key: 'last_modified_by', width: 19 },
        { header: 'last_modified_on', type: 'DATETIME', key: 'last_modified_on', width: 17 },
        { header: 'type', type: 'VARCHAR', key: 'type', width: 12 },
        { header: 'level', type: 'VARCHAR', key: 'level', width: 14 }
    ],
    Shift: [
        { header: 'shift_code', type: 'VARCHAR', key: 'shift_code', width: 14 },
        { header: 'shift_name', type: 'VARCHAR', key: 'shift_name', width: 16 },
        { header: 'shift_description', type: 'VARCHAR', key: 'shift_description', width: 27 },
        { header: 'shift_sequence', type: 'INT', key: 'shift_sequence', width: 14 },
        { header: 'start_time', type: 'TIME', key: 'start_time', width: 16 },
        { header: 'start_time_offset_days', type: 'INT', key: 'start_time_offset_days', width: 22 },
        { header: 'end_time', type: 'TIME', key: 'end_time', width: 27 },
        { header: 'end_time_offset_days', type: 'INT', key: 'end_time_offset_days', width: 22 },
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
    Tag: [
        { header: 'tag_code', type: 'VARCHAR', key: 'tag_code', width: 24 },
        { header: 'tag_name', type: 'VARCHAR', key: 'tag_name', width: 24 },
        { header: 'tag_description', type: 'VARCHAR', key: 'tag_description', width: 25 },
        { header: 'asset_code', type: 'VARCHAR', key: 'asset_code', width: 15 },
        { header: 'site_code', type: 'VARCHAR', key: 'site_code', width: 15 },
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
        { header: 'max_change', type: 'FLOAT', key: 'max_change', width: 20 }
    ],
    CommonParameters: [
        { header: 'site_code', type: 'VARCHAR', key: 'site_code', width: 15 },
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
        { header: 'summary_timeout', type: 'INT', key: 'summary_timeout', width: 19 },
        { header: 'break_minutes', type: 'FLOAT', key: 'break_minutes', width: 17 },
        { header: 'lunch_minutes', type: 'FLOAT', key: 'lunch_minutes', width: 17 }

    ],
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
        { header: 'site_code', type: 'VARCHAR', key: 'site_code', width: 20 },
        { header: 'status', type: 'VARCHAR', key: 'status' },
        { header: 'entered_by', type: 'VARCHAR', key: 'entered_by', width: 19 },
        { header: 'entered_on', type: 'DATETIME', key: 'entered_on', width: 14 },
        { header: 'last_modified_by', type: 'VARCHAR', key: 'last_modified_by', width: 19 },
        { header: 'last_modified_on', type: 'DATETIME', key: 'last_modified_on', width: 17 }
    ],
    TFDUsers: [
        { header: 'Badge', type: 'VARCHAR', key: 'Badge', width: 14 },
        { header: 'Username', type: 'VARCHAR', key: 'Username', width: 14 },
        { header: 'First_Name', type: 'VARCHAR', key: 'First_Name', width: 14 },
        { header: 'Last_Name', type: 'VARCHAR', key: 'Last_Name', width: 14 },
        { header: 'Role', type: 'VARCHAR', key: 'Role', width: 14 },
        { header: 'site_code', type: 'VARCHAR', key: 'site_code', width: 14 }
    ]
};

export function getParametersOfTable(tableName, siteId) {
    let parametersObject = {
        extraColumns: '',
        joinSentence: '',
        matchParameters: '',
        updateSentence: '',
        insertSentence: '',
    };
    switch (tableName) {
        case 'Workcell':
            parametersObject.extraColumns = ', a.asset_id AS site_id';
            parametersObject.joinSentence = `JOIN dbo.Asset a ON s.site_code = a.asset_code AND a.asset_level = 'Site'`;
            parametersObject.matchParameters = `s.workcell_name = t.workcell_name AND s.site_id = t.site_id`;
            parametersObject.updateSentence = `t.[workcell_name] = s.[workcell_name], t.[workcell_description] = s.[workcell_description], 
                t.[last_modified_by] = 'Administration Tool', t.[last_modified_on] = GETDATE()`;
            parametersObject.insertSentence = `([workcell_name], [workcell_description], [site_id], [entered_by], [last_modified_by]) 
                VALUES (s.[workcell_name], s.[workcell_description], s.[site_id], 'Administration Tool', 'Administration Tool')`;
            break;
        case 'Asset':
            parametersObject.extraColumns = ', w.workcell_id';
            parametersObject.joinSentence = `LEFT JOIN dbo.Workcell w ON s.grouping1 = w.workcell_name`;
            parametersObject.matchParameters = 's.asset_code = t.asset_code AND s.site_code = t.site_code AND s.asset_name = t.asset_name';
            parametersObject.updateSentence = `t.[asset_name] = s.[asset_name], t.[asset_description] = s.[asset_description], 
                t.[asset_level] = s.[asset_level], t.[parent_asset_code] = s.[parent_asset_code], t.[value_stream] = s.[value_stream], 
                t.[automation_level] = s.[automation_level], t.[include_in_escalation] = s.[include_in_escalation], t.[grouping1] = s.[workcell_id], 
                t.[grouping2] = s.[grouping2], t.[grouping3] = s.[grouping3], t.[grouping4] = s.[grouping4], t.[grouping5] = s.[grouping5], 
                t.[status] = s.[status], t.[last_modified_by] = 'Administration Tool', t.[last_modified_on] = GETDATE(), 
                t.[target_percent_of_ideal] = s.[target_percent_of_ideal], t.[is_multiple] = s.[is_multiple]`;
            parametersObject.insertSentence = `([asset_code], [asset_name], [asset_description], [asset_level], [site_code], [parent_asset_code], 
                [value_stream], [automation_level], [include_in_escalation], [grouping1], [grouping2], [grouping3], [grouping4], [grouping5], [status], 
                [entered_by], [last_modified_by], [target_percent_of_ideal],[is_multiple]) VALUES (s.[asset_code], 
                    s.[asset_name], s.[asset_description], s.[asset_level], s.[site_code], s.[parent_asset_code], s.[value_stream], s.[automation_level], 
                    s.[include_in_escalation], s.[workcell_id], s.[grouping2], s.[grouping3], s.[grouping4], s.[grouping5], s.[status], 'Administration Tool', 
                    'Administration Tool', s.[target_percent_of_ideal], s.[is_multiple])`;
            break;
        case 'AssetDisplaySystem':
            parametersObject.extraColumns = ', a.asset_id';
            parametersObject.joinSentence = `JOIN dbo.Asset a ON s.asset_code = a.asset_code`;
            parametersObject.matchParameters = 's.asset_id = t.asset_id';
            parametersObject.updateSentence = `t.[displaysystem_name] = s.[displaysystem_name], t.[status] = s.[status], t.[entered_by] = s.[entered_by], 
                t.[last_modified_by] = s.[last_modified_by], t.[last_modified_on] = s.[last_modified_on]`;
            parametersObject.insertSentence = `([displaysystem_name], [status], [entered_by], [entered_on], [last_modified_by], [last_modified_on], 
                [asset_id]) VALUES (s.[displaysystem_name], s.[status], s.[entered_by], s.[entered_on], s.[last_modified_by], s.[last_modified_on], 
                s.[asset_id])`
            break;
        case 'DTReason':
            parametersObject.extraColumns = ', h.asset_id';
            parametersObject.joinSentence = `JOIN dbo.Asset a ON s.asset_code = a.asset_code OUTER APPLY [dbo].[AssetsResolverFromId] 
                (a.asset_id, CASE WHEN (a.asset_level='Area' or a.asset_level='Site') then 3 else 0 end ) as H`;
            parametersObject.matchParameters = 's.dtreason_code = t.dtreason_code AND s.asset_id = t.asset_id';
            parametersObject.updateSentence = `t.[dtreason_name] = s.[dtreason_name], t.[dtreason_description] = s.[dtreason_description], 
                t.[dtreason_category] = s.[dtreason_category], t.[reason1] = s.[reason1], t.[reason2] = s.[reason2], t.[status] = s.[status], 
                t.[entered_by] = s.[entered_by], t.[last_modified_by] = s.[last_modified_by], t.[last_modified_on] = s.[last_modified_on], 
                t.[type] = s.[type], t.[level] = s.[level]`;
            parametersObject.insertSentence = `([dtreason_code], [dtreason_name], [dtreason_description], [dtreason_category], [level], [reason1], 
                [reason2], [status], [entered_by], [entered_on], [last_modified_by], [last_modified_on], [asset_id], [type]) VALUES (s.[dtreason_code], 
                s.[dtreason_name], s.[dtreason_description], s.[dtreason_category], s.[level], s.[reason1], s.[reason2], s.[status], s.[entered_by], 
                s.[entered_on], s.[last_modified_by], s.[last_modified_on], s.[asset_id], s.[type])`;
            break;
        case 'Shift':
            parametersObject.extraColumns = ', a.asset_id';
            parametersObject.joinSentence = `JOIN dbo.Asset a ON s.asset_code = a.asset_code WHERE a.asset_level = 'Site'`;
            parametersObject.matchParameters = 's.shift_code = t.shift_code AND s.asset_id = t.asset_id';
            parametersObject.updateSentence = `t.[shift_name] = s.[shift_name], t.[shift_description] = s.[shift_description], 
                t.[shift_sequence] = s.[shift_sequence], t.[start_time] = s.[start_time], t.[start_time_offset_days] = s.[start_time_offset_days], 
                t.[end_time] = s.[end_time], t.[end_time_offset_days] = s.[end_time_offset_days], t.[duration_in_minutes] = s.[duration_in_minutes], 
                t.[valid_from] = s.[valid_from], t.[valid_to] = s.[valid_to], t.[team_code] = s.[team_code],
                t.[is_first_shift_of_day] = s.[is_first_shift_of_day], t.[status] = s.[status], t.[entered_by] = s.[entered_by], 
                t.[last_modified_by] = s.[last_modified_by], t.[last_modified_on] = s.[last_modified_on]`;
            parametersObject.insertSentence = `([shift_code], [shift_name], [shift_description], [shift_sequence], [start_time], [start_time_offset_days], 
                [end_time], [end_time_offset_days], [duration_in_minutes], [valid_from], [valid_to], [team_code], [is_first_shift_of_day], [status], 
                [entered_by], [entered_on], [last_modified_by], [last_modified_on], [asset_id]) VALUES (s.[shift_code], s.[shift_name], 
                s.[shift_description], s.[shift_sequence], s.[start_time], s.[start_time_offset_days], s.[end_time], s.[end_time_offset_days], 
                s.[duration_in_minutes], s.[valid_from], s.[valid_to], s.[team_code], s.[is_first_shift_of_day], s.[status], s.[entered_by], 
                s.[entered_on], s.[last_modified_by], s.[last_modified_on], s.[asset_id])`;
            break;
        case 'UOM':
            parametersObject.extraColumns = ', a.asset_id AS site_id';
            parametersObject.joinSentence = `JOIN dbo.Asset a ON s.site_code = a.asset_code AND a.asset_level = 'Site'`;
            parametersObject.matchParameters = 's.UOM_code = t.UOM_code AND s.site_id = t.site_id';
            parametersObject.updateSentence = `t.[UOM_name] = s.[UOM_name], t.[UOM_description] = s.[UOM_description], t.[status] = s.[status], 
                t.[entered_by] = s.[entered_by], t.[last_modified_by] = s.[last_modified_by], t.[last_modified_on] = s.[last_modified_on], 
                t.[decimals] = s.[decimals], t.[site_id] = s.[site_id]`;
            parametersObject.insertSentence = `([UOM_code], [UOM_name], [UOM_description], [status], [entered_by], [entered_on], [last_modified_by], 
                [last_modified_on], [site_id], [decimals]) VALUES (s.[UOM_code], s.[UOM_name], s.[UOM_description], s.[status], s.[entered_by], 
                s.[entered_on], s.[last_modified_by], s.[last_modified_on], s.[site_id], s.[decimals])`;
            break;
        case 'Tag':
            parametersObject.extraColumns = ', a.asset_id, aas.asset_id AS site_id';
            parametersObject.joinSentence = `JOIN dbo.Asset a ON s.asset_code = a.asset_code JOIN dbo.Asset aas ON s.site_code = aas.asset_code AND 
                aas.asset_level = 'Site'`;
            parametersObject.matchParameters = 's.asset_id = t.asset_id AND s.site_id = t.site_id';
            parametersObject.updateSentence = `t.[tag_code] = s.[tag_code], t.[tag_name] = s.[tag_name], t.[tag_description] = s.[tag_description], 
                t.[tag_group] = s.[tag_group], t.[datatype] = s.[datatype], t.[tag_type] = s.[tag_type], t.[UOM_code] = s.[UOM_code], 
                t.[rollover_point] = s.[rollover_point], t.[aggregation] = s.[aggregation], t.[status] = s.[status], t.[entered_by] = s.[entered_by], 
                t.[last_modified_by] = s.[last_modified_by], t.[last_modified_on] = s.[last_modified_on], t.[max_change] = s.[max_change]`;
            parametersObject.insertSentence = `([tag_code], [tag_name], [tag_description], [tag_group], [datatype], [tag_type], [UOM_code], 
                [rollover_point], [aggregation], [status], [entered_by], [entered_on], [last_modified_by], [last_modified_on], [site_id], [asset_id], 
                [max_change]) VALUES (s.[tag_code], s.[tag_name], s.[tag_description], s.[tag_group], s.[datatype], s.[tag_type], s.[UOM_code], 
                s.[rollover_point], s.[aggregation], s.[status], s.[entered_by], s.[entered_on], s.[last_modified_by], s.[last_modified_on], s.[site_id], 
                s.[asset_id], s.[max_change])`;
            break;
        case 'CommonParameters':
            parametersObject.extraColumns = ', a.asset_id as site_id';
            parametersObject.joinSentence = `JOIN dbo.Asset a ON s.site_code = a.asset_code AND a.asset_level = 'Site'`;
            parametersObject.matchParameters = 's.site_id = t.site_id';
            parametersObject.updateSentence = `t.site_id = s.site_id, t.[site_name] = s.[site_name], 
                t.[production_day_offset_minutes] = s.[production_day_offset_minutes], t.[site_timezone] = s.[site_timezone], 
                t.[ui_timezone] = s.[ui_timezone], t.[escalation_level1_minutes] = s.[escalation_level1_minutes], 
                t.[escalation_level2_minutes] = s.[escalation_level2_minutes], t.[default_target_percent_of_ideal] = s.[default_target_percent_of_ideal], 
                t.[default_setup_minutes] = s.[default_setup_minutes], t.[default_routed_cycle_time] = s.[default_routed_cycle_time], 
                t.[setup_lookback_minutes] = s.[setup_lookback_minutes], t.[language] = s.[language], t.[status] = s.[status], 
                t.[entered_by] = s.[entered_by], t.[last_modified_by] = s.[last_modified_by], t.[last_modified_on] = s.[last_modified_on], 
                t.[summary_timeout] = s.[summary_timeout], t.[break_minutes] = s.[break_minutes], t.[lunch_minutes] = s.[lunch_minutes]`;
            parametersObject.insertSentence = `([site_id], [site_name], [production_day_offset_minutes], [site_timezone], [ui_timezone], 
                [escalation_level1_minutes], [escalation_level2_minutes], [default_target_percent_of_ideal], [default_setup_minutes], 
                [default_routed_cycle_time], [setup_lookback_minutes], [language], [status], [entered_by], [entered_on], [last_modified_by], 
                [last_modified_on]) VALUES (s.[site_id], s.[site_name], s.[production_day_offset_minutes], s.[site_timezone], s.[ui_timezone], 
                s.[escalation_level1_minutes], s.[escalation_level2_minutes], s.[default_target_percent_of_ideal], s.[default_setup_minutes], 
                s.[default_routed_cycle_time], s.[setup_lookback_minutes], s.[language], s.[status], s.[entered_by], s.[entered_on], 
                s.[last_modified_by], s.[last_modified_on], s.[summary_timeout], s.[break_minutes], s.[lunch_minutes])`;
            break;
        case 'Unavailable':
            parametersObject.extraColumns = ', a.asset_id, aas.asset_id AS site_id';
            parametersObject.joinSentence = `JOIN dbo.Asset a ON s.asset_code = a.asset_code JOIN dbo.Asset aas ON s.site_code = aas.asset_code AND 
                aas.asset_level = 'Site'`;
            parametersObject.matchParameters = 's.unavailable_code = t.unavailable_code AND s.asset_id = t.asset_id AND s.site_id = t.site_id';
            parametersObject.updateSentence = `t.[unavailable_name] = s.[unavailable_name], t.[unavailable_description] = s.[unavailable_description], 
                t.[start_time] = s.[start_time], t.[end_time] = s.[end_time], t.[duration_in_minutes] = s.[duration_in_minutes], 
                t.[valid_from] = s.[valid_from], t.[valid_to] = s.[valid_to], t.[status] = s.[status], t.[entered_by] = s.[entered_by], 
                t.[last_modified_by] = s.[last_modified_by], t.[last_modified_on] = s.[last_modified_on]`;
            parametersObject.insertSentence = `([unavailable_code], [unavailable_name], [unavailable_description], [start_time], [end_time], 
                [duration_in_minutes], [valid_from], [valid_to], [status], [entered_by], [entered_on], [last_modified_by], [last_modified_on], [site_id], 
                [asset_id]) VALUES (s.[unavailable_code], s.[unavailable_name], s.[unavailable_description], s.[start_time], s.[end_time], 
                s.[duration_in_minutes], s.[valid_from], s.[valid_to], s.[status], s.[entered_by], s.[entered_on], s.[last_modified_by], 
                s.[last_modified_on], s.[site_id], s.[asset_id])`;
            break;
        case 'TFDUsers':
            parametersObject.extraColumns = ', a.asset_id as Site';
            parametersObject.joinSentence = `JOIN dbo.Asset a ON s.site_code = a.asset_code AND a.asset_level = 'Site'`;
            parametersObject.matchParameters = 's.Badge = t.Badge AND s.Site = t.Site';
            parametersObject.updateSentence = `t.[Badge] = s.[Badge], t.[Username] = s.[Username], t.[First_Name] = s.[First_Name], 
                t.[Last_Name] = s.[Last_Name], t.[Role] = s.[Role]`;
            parametersObject.insertSentence = `([Badge], [Username], [First_Name], [Last_Name], [Role], [Site]) VALUES (s.[Badge], s.[Username], 
                s.[First_Name], s.[Last_Name], s.[Role], s.[Site])`;
            break;
    }
    return parametersObject;
}

export function getValuesFromHeaderTable(headers, header, value) {
    let newValue: any = '';
    if (value != null) {
        switch (header.type) {
            case 'VARCHAR':
                newValue = `N'${value}'`;
                break;
            case 'DATETIME':
                value = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
                newValue = `'${value}'`;
                break;
            case 'TIME':
                value = new Date(value).toISOString();
                value = value.substring(11, 19);
                newValue = `'${value}'`;
                break;
            case 'BIT':
                newValue = value ? 1 : 0;
                break;
            default:
                newValue = value;
        }
    } else {
        newValue = null;
    }
    newValue += (headers[headers.length - 1].header === header.header) ? '' : ',';
    return newValue;
}