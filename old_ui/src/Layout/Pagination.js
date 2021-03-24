
import React from 'react';
import FontAwesome from 'react-fontawesome';
import Tooltip from 'react-tooltip'
import moment from 'moment';
import $ from 'jquery';
import * as qs from 'query-string';
import _ from 'lodash';


class Pagination extends React.Component {
    constructor(props) {
        super(props);
        this.state = Object.assign(this.getInitialState(props));
    }

    getInitialState(props) {
        const search = qs.parse(props.history.location.search);
        return {
            mc: search.mc || props.machineData.asset_code,
            tp: search.tp || props.machineData.automation_level,
            ln: search.ln || props.user.language,
            cs: search.cs || props.user.site,
            dt: search.dt || moment().tz(props.user.timezone),
            sf: search.sf || props.user.current_shift,
            max_regresion: props.user.max_regression,
            display_next: false,
            display_go_current_shift: false,
            display_back: false,
            display_back_current_shift: false
        };
    }

    componentWillReceiveProps(nextProps) {
        this.newPaginationLogic(nextProps);
    }

    newPaginationLogic(props) {
        let newState = this.getInitialState(props);

        const search = qs.parse(props.history.location.search);
        newState.diffDays = 0;
        newState.actual_regresion = 0;
        if (search.dt || search.sf) {
            //console.log('check selected parameters in the UI');
            let site_shifts = props.user.shifts;

            //GET SHIFT AND TME OF THE CURRENT SHIFT

            let currentSiteTime = moment(moment().tz(props.user.timezone).format('YYYY-MM-DD HH:mm:ss'));
            let indexActualShift = _.findIndex(site_shifts, shift => {
                return (currentSiteTime.isBetween(moment(shift.start_date_time_today), moment(shift.end_date_time_today)))
                    || (currentSiteTime.isBetween(moment(shift.start_date_time_yesterday), moment(shift.end_date_time_yesterday)))
                    || (currentSiteTime.isBetween(moment(shift.start_date_time_tomorrow), moment(shift.end_date_time_tomorrow)))
            });

            //GET DATETIME AND SHIFT OF SELECTED OPTION IN THE URL
            let selectedDateTime = moment(search.dt);//ONLY SELECTED DATA. WE NEED THE TME OF THE SHIFT TOO
            let indexSelectedShift = _.findIndex(site_shifts, ['shift_name', search.sf]);

            let productionDayCurrentSiteDate = currentSiteTime.isBefore(moment(site_shifts[0].start_date_time_today)) ? currentSiteTime.add(-1, 'days').format('YYYY-MM-DD') :
                (currentSiteTime.isAfter(moment(site_shifts[site_shifts.length - 1].end_date_time_today)) ? currentSiteTime.add(1, 'days').format('YYYY-MM-DD') : currentSiteTime.format('YYYY-MM-DD'));

            if (productionDayCurrentSiteDate !== selectedDateTime.format('YYYY-MM-DD') || indexActualShift !== indexSelectedShift) {
                //console.log('selected information is not the current shift');
                //logic to get the days difference between the current date and the selected date
                newState.diffDays = currentSiteTime.format('YYYY-MM-DD') === selectedDateTime.format('YYYY-MM-DD') ? 0 :
                    moment.duration(moment(selectedDateTime.format('YYYY-MM-DD')).diff(moment(currentSiteTime.format('YYYY-MM-DD')))).asDays();

                if (newState.diffDays > 0 || (newState.diffDays === 0 && indexActualShift < indexSelectedShift)) {
                    newState.display_back_current_shift = true;
                    //console.log('back to current shift');
                } else if (newState.diffDays < 0) {
                    newState.actual_regresion = indexActualShift;//calculate number of shift for current shift
                    newState.actual_regresion += (newState.diffDays + 1) * -1 * site_shifts.length;//calculate numbers of shifts between dates
                    newState.actual_regresion += site_shifts.length - indexSelectedShift;//calculate number of shifts for selected date
                    newState.display_next = true;
                    //console.log('actual_regresion: ', newState.actual_regresion);
                } else if (newState.diffDays === 0) {
                    newState.actual_regresion = indexActualShift - indexSelectedShift;
                    newState.display_next = true;
                    //console.log('regresion of shift', indexActualShift - indexSelectedShift);
                }

            } else {
                //console.log('selected date and shift is the current shift');
            }
        } else {
            //console.log('nothing to check in the UI');
        }

        newState.display_back = newState.actual_regresion < newState.max_regresion;
        newState.display_go_current_shift = newState.actual_regresion > newState.max_regresion;

        this.setState(newState);
    }

    loadLogicToApply(props) {
        let newState = this.getInitialState(props);

        this.newPaginationLogic(props);

        let indexSelectedShift = -1;
        let indexCurrentShift = -1;
        if (newState.sf === props.user.current_shift) {
            indexSelectedShift = _.findIndex(props.user.shifts, ['shift_name', newState.sf]) + 1;
            indexCurrentShift = indexSelectedShift;
        } else {
            indexSelectedShift = _.findIndex(props.user.shifts, ['shift_name', newState.sf]) + 1;
            indexCurrentShift = _.findIndex(props.user.shifts, ['shift_name', props.user.current_shift]) + 1;
        }

        let currentShiftDate = moment(props.user.date_of_shift);//current datetime to get the current shift

        // _.forEach(props.user.shifts, (shift, index) => {
        //     if ((currentShiftDate.isSameOrAfter(moment(shift.start_date_time_today)) && currentShiftDate.isBefore(moment(shift.end_date_time_today))) ||
        //         (currentShiftDate.isSameOrAfter(moment(shift.start_date_time_yesterday)) && currentShiftDate.isBefore(moment(shift.end_date_time_yesterday))) ||
        //         (currentShiftDate.isSameOrAfter(moment(shift.start_date_time_tomorrow)) && currentShiftDate.isBefore(moment(shift.end_date_time_tomorrow)))) {
        //         indexCurrentShift = index + 1;
        //     }
        // });

        let lastShiftDate = moment(props.user.shifts[props.user.shifts.length - 1].end_date_time_today);
        let firstShiftDateTomorrow = moment(props.user.shifts[0].start_date_time_tomorrow);
        if (newState.diffDays === 0) {
            if (currentShiftDate.isSameOrAfter(lastShiftDate)) {
                newState.diffDays = -1;
                indexCurrentShift = 1;
            } else if (currentShiftDate.isSameOrAfter(moment(props.user.shifts[props.user.shifts.length - 1].start_date_time_yesterday)) &&
                currentShiftDate.isBefore(moment(props.user.shifts[props.user.shifts.length - 1].end_date_time_yesterday))) {
            } else if (currentShiftDate.isBefore(moment(props.user.shifts[0].start_date_time_today))) {
                newState.diffDays = 0;
                indexCurrentShift = 1;
            }
        }

        if (newState.diffDays === 1) {
            if (currentShiftDate.isSameOrAfter(lastShiftDate) && currentShiftDate.isBefore(firstShiftDateTomorrow)) {
                newState.diffDays = 0;
                indexCurrentShift = 1;
            }
        }

        if (newState.diffDays === 0) {
            if (indexSelectedShift < indexCurrentShift) {
                newState.display_next = true;
                newState.actual_regresion = indexCurrentShift - indexSelectedShift;
            } else if (indexSelectedShift > indexCurrentShift) {
                newState.display_back_current_shift = true;
            }
        } else if (newState.diffDays > 0) {
            newState.display_back_current_shift = true;
        } else if (newState.diffDays < 0) {
            newState.display_next = true;
            newState.actual_regresion = newState.diffDays === -1 ? 0 : ((newState.diffDays + 1) * -1 * props.user.shifts.length);//calculate numbers of shifts between dates
            newState.actual_regresion += ((props.user.shifts.length + 1) - indexSelectedShift);//calculate number of shifts for selected date
            newState.actual_regresion += indexCurrentShift - 1;//calculate number of shift for current shift
        }

        newState.display_back = newState.actual_regresion < newState.max_regresion;
        newState.display_go_current_shift = newState.actual_regresion > newState.max_regresion;

        this.setState(newState);
    }

    returnToCurrentShift() {
        let object = {};
        object.dt = new Date(this.props.user.date_of_shift);
        object.sf = this.props.user.current_shift;
        this.applyToQueryOptions(object);
    }

    goNextShift(jump) {
        let object = {};
        let dt = this.state.dt;
        let indexSelectedShift = _.findIndex(this.props.user.shifts, ['shift_name', this.state.sf]) + 1;

        if ((indexSelectedShift + jump) > this.props.user.shifts.length) {
            object.dt = new Date(moment(dt).add(1, 'days').format('YYYY/MM/DD HH:mm'));
            object.sf = this.props.user.shifts[(indexSelectedShift + jump) - (this.props.user.shifts.length) - 1].shift_name;
        } else {
            object.dt = new Date(this.state.dt);
            object.sf = this.props.user.shifts[(indexSelectedShift - 1) + jump].shift_name;
        }

        this.applyToQueryOptions(object);
    }

    goBackShift(jump) {
        let object = {};
        let dt = this.state.dt;
        let indexSelectedShift = _.findIndex(this.props.user.shifts, ['shift_name', this.state.sf]);

        if (indexSelectedShift - jump < 0) {
            object.dt = new Date(moment(dt).add(-1, 'days').format('YYYY/MM/DD HH:mm'));
            object.sf = this.props.user.shifts[(indexSelectedShift - jump) + this.props.user.shifts.length].shift_name;
        } else {
            object.dt = new Date(this.state.dt);
            object.sf = this.props.user.shifts[indexSelectedShift - jump].shift_name;
        }

        this.applyToQueryOptions(object);
    }

    async applyToQueryOptions(object) {
        let { search } = qs.parse(this.props.history.location.search);
        let queryItem = Object.assign({}, search);
        queryItem["dt"] = moment(object.dt).format('YYYY/MM/DD HH:mm');
        queryItem["sf"] = object.sf;
        queryItem["mc"] = this.state.mc;
        queryItem["ln"] = this.state.ln;
        queryItem["tp"] = this.state.tp;
        let parameters = $.param(queryItem);
        await this.props.history.push(`${this.props.history.location.pathname}?${parameters}`);
    }

    render() {
        const t = this.props.t;
        return (
            <div id='semi-button-deck' style={{ height: 47 }}>
                {this.state.display_back && !this.state.display_back_current_shift ?
                    <React.Fragment>
                        {this.state.max_regresion - this.state.actual_regresion >= this.state.max_regresion ?
                            < FontAwesome
                                name="angle-double-left"
                                data-tip='shift'
                                data-for='last-shift'
                                className={`icon-arrow`}
                                onClick={() => this.goBackShift(2)}
                            />
                            : null}
                        <FontAwesome
                            name="caret-left fa-2"
                            className="icon-arrow"
                            onClick={() => this.goBackShift(1)}
                        />
                        <span id="previous-shift" onClick={() => this.goBackShift(1)}>{t('Previous Shift')}</span>
                    </React.Fragment>
                    : null}
                {this.state.display_back_current_shift ?
                    <React.Fragment>
                        <FontAwesome
                            name="angle-double-left"
                            data-tip='shift'
                            data-for='last-shift'
                            className={`icon-arrow`}
                            onClick={() => this.returnToCurrentShift()}
                        />
                        <span id="previous-shift" onClick={() => this.returnToCurrentShift()}>{t('Go Back To Current Shift')}</span>
                    </React.Fragment>
                    : null}
                <div className='float-right'>
                    {this.state.display_next && !this.state.display_go_current_shift ?
                        <React.Fragment>
                            <span id="current-shift" onClick={() => this.goNextShift(1)}>{t('Next Shift')}</span>
                            <FontAwesome
                                name="caret-right fa-2"
                                className="icon-arrow"
                                onClick={() => this.goNextShift(1)} />
                            {this.state.max_regresion - this.state.actual_regresion <= (this.state.max_regresion - 2) ?
                                <FontAwesome
                                    data-tip='shift'
                                    data-for='current-shift'
                                    name="angle-double-right fa-2"
                                    className="icon-arrow"
                                    onClick={() => this.goNextShift(2)}
                                />
                                : null}
                        </React.Fragment>
                        : null}
                    {this.state.display_go_current_shift ?
                        <React.Fragment>
                            <span id="current-shift" onClick={() => this.returnToCurrentShift()}>{t('Go To Current Shift')}</span>
                            <FontAwesome
                                data-tip='shift'
                                data-for='current-shift'
                                name="angle-double-right fa-2"
                                className="icon-arrow"
                                onClick={() => this.returnToCurrentShift()}
                            />
                        </React.Fragment>
                        : null}
                </div>
                <Tooltip id='current-shift'>{'Go To Current Shift'}</Tooltip>
                <Tooltip id='last-shift'>{'Go back Two Shifts'}</Tooltip>
            </div>
        )
    }
};

export default Pagination;