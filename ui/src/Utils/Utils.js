import _ from 'lodash';
import moment from 'moment-timezone';

function assignValuesToUser(user, newAttributes) {
    user.id = newAttributes.id;
    user.first_name = newAttributes.first_name;
    user.last_name = newAttributes.last_name;
    user.username = newAttributes.username;
    user.role = newAttributes.role;
    user.assing_role = newAttributes.assing_role;
    user.badge = newAttributes.badge;
    user.site = newAttributes.site;
    user.max_regression = newAttributes.max_regression;
    user.site_name = newAttributes.site_name;
    user.timezone = newAttributes.timezone;
    user.current_shift = newAttributes.shift_name;
    user.shift_id = newAttributes.shift_id;
    user.language = newAttributes.language;
    user.date_of_shift = newAttributes.date_of_shift;
    user.current_date_time = newAttributes.current_date_time;
    user.vertical_shift_id = newAttributes.vertical_shift_id;
    user.break_minutes = newAttributes.break_minutes;
    user.lunch_minutes = newAttributes.lunch_minutes;
    user.permissions = newAttributes.permissions;
    user.sites = newAttributes.sites;
    user.escalation_name = newAttributes.escalation_name;
    user.escalation_level = newAttributes.escalation_level;
    user.escalation_hours = newAttributes.escalation_hours;
    return user;
}

function assignSiteConfiguration(user, newAttributes) {
    user.shifts = newAttributes.shifts;
    user.site_assets = newAttributes.site_assets;
    user.machines = newAttributes.machines;
    user.uoms = newAttributes.uoms;
    user.workcell = newAttributes.workcell;
    user.escalations = newAttributes.escalations;
    return user;
}

function getDtReason(reasons) {
    _.forEach(reasons, reason => {
        reason.label = reason.dtreason_name;
        reason.value = reason.dtreason_id;
    });
    return reasons;
}

function getLevelOptions() {
    return [
        { label: 'Site', value: 'Site' },
        { label: 'Area', value: 'Area' },
        { label: 'Value Stream', value: 'value_stream' },
        { label: 'Workcell', value: 'workcell_name' }
    ];
}

function getAreaAssetOptionsDC(user) {
    return _.map(_.filter(user.site_assets, { asset_level: 'Area' }), asset => {
        asset.value = asset.asset_id;
        asset.label = asset.asset_name;
        return asset;
    });
}

function getWorkcellValueOptionsDC(selectionValue, user) {
    return _.orderBy(_.map(_.uniqBy(user.site_assets, selectionValue), asset => {
        asset.value = asset[selectionValue];
        asset.label = asset[selectionValue];
        return asset;
    }), 'value');
}

function getStartEndDateTime(production_day, shift_name, user, useCurrentHour) {
    let dates = { start_date_time: '', end_date_time: '' };
    const selectedShift = _.find(user.shifts, { shift_name: shift_name });
    dates.start_date_time = moment(production_day).add(selectedShift.start_time_offset_days, 'days').add(selectedShift.hour, 'hours').format('YYYY/MM/DD HH:mm');
    if (production_day === moment(user.date_of_shift).format('YYYY/MM/DD HH:mm') && shift_name === user.current_shift) {
        dates.end_date_time = useCurrentHour ? (moment().tz(user.timezone).add(1, 'hours').format('YYYY/MM/DD HH') + ':00') :
            moment(dates.start_date_time).add(selectedShift.duration_in_hours, 'hours').format('YYYY/MM/DD HH:mm');
    } else {
        dates.end_date_time = moment(dates.start_date_time).add(selectedShift.duration_in_hours, 'hours').format('YYYY/MM/DD HH:mm');
    }
    return dates;
}

function GetShiftProductionDayFromSiteAndDate(user) {
    let data = { production_day: null, current_datetime: null, shift_id: null, shift_name: null, shift_code: null, start_shift: null, end_shift: null };

    data.current_datetime = moment.tz(user.timezone);
    data.production_day = moment.tz(data.current_datetime.format('YYYY-MM-DD') + ' 00:00', user.timezone);

    const first_shift = user.shifts[0];
    const last_shift = user.shifts[user.shifts.length - 1];
    let first_shift_start_time = moment.tz(data.production_day, user.timezone).add(first_shift.start_time_offset_days, 'days').add(first_shift.hour, 'hours');
    let last_shift_end_time = moment.tz(data.production_day, user.timezone).add(last_shift.end_time_offset_days, 'days').add(last_shift.end_hour, 'hours');

    if (data.current_datetime.isBefore(first_shift_start_time)) {
        data.production_day.add(-1, 'days');
    } else if (data.current_datetime.isSameOrAfter(last_shift_end_time)) {
        data.production_day.add(1, 'days');
    }

    _.forEach(user.shifts, (shift) => {
        const start_shift = moment.tz(data.production_day, user.timezone).add(shift.start_time_offset_days, 'days').add(shift.hour, 'hours');
        const end_shift = moment.tz(data.production_day, user.timezone).add(shift.end_time_offset_days, 'days').add(shift.end_hour, 'hours');
        if (data.current_datetime.isSameOrAfter(start_shift) && data.current_datetime.isBefore(end_shift)) {
            data.shift_id = shift.shift_id;
            data.shift_name = shift.shift_name;
            data.shift_code = shift.shift_code;
            data.start_shift = start_shift;
            data.end_shift = end_shift;
            return;
        }
    });

    return data;

}

export {
    assignValuesToUser,
    assignSiteConfiguration,
    getDtReason,
    getLevelOptions,
    getAreaAssetOptionsDC,
    getWorkcellValueOptionsDC,
    getStartEndDateTime,
    GetShiftProductionDayFromSiteAndDate
}