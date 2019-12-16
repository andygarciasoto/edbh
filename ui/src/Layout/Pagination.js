
import React from 'react';
import FontAwesome from 'react-fontawesome';
import { getCurrentTime } from '../Utils/Requests';
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
        let selected_date = search.dt ? moment(search.dt).format('YYYY/MM/DD') + ' 00:00' : null;
        let current_date = moment(getCurrentTime(props.timezone)).format('YYYY/MM/DD') + ' 00:00';
        const dt = search.dt ? selected_date : current_date;
        return {
            dt,
            sf: search.sf || props.user.current_shift,
            diffDays: moment.duration(moment(dt).diff(moment(current_date))).asDays(),
            actual_regresion: 0,
            max_regresion: 3,
            display_next: false,
            display_go_current_shift: false,
            display_back: false,
            display_back_current_shift: false
        };
    }

    componentWillReceiveProps(nextProps) {
        this.loadLogicToApply(nextProps);
    }

    loadLogicToApply(props) {
        let newState = this.getInitialState(props);

        let indexSelectedShift = _.findIndex(this.props.user.shifts, ['shift_name', newState.sf]) + 1;
        let indexCurrentShift = _.findIndex(this.props.user.shifts, ['shift_name', props.user.current_shift]) + 1;

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
        object.dt = new Date(getCurrentTime());
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
        let parameters = $.param(queryItem);
        await this.props.history.push(`${this.props.history.location.pathname}?${parameters}`);
    }

    render() {
        const t = this.props.t;
        return (
            <div id='semi-button-deck' style={{ height: 47 }}>
                {this.state.display_back && !this.state.display_back_current_shift ?
                    <React.Fragment>
                        {this.state.max_regresion - this.state.actual_regresion >= 2 ?
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
                            {this.state.max_regresion - this.state.actual_regresion < 2 ?
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