import _ from 'lodash';
import moment from 'moment-timezone';

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

export {
    getDtReason,
    getLevelOptions,
    getAreaAssetOptionsDC,
    getWorkcellValueOptionsDC,
    getStartEndDateTime
}