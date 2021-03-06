
import React from 'react';
import FontAwesome from 'react-fontawesome';
import Tooltip from 'react-tooltip'
import moment from 'moment';
import $ from 'jquery';
import * as qs from 'query-string';
import _ from 'lodash';
import { GetShiftProductionDayFromSiteAndDate } from '../../Utils/Utils';
import '../../sass/Pagination.scss';


class Pagination extends React.Component {
    constructor(props) {
        super(props);
        this.state = Object.assign(this.getInitialState(props));
    }

    getInitialState(props) {
        return {
            dt: props.selectedDate,
            sf: props.selectedShift,
            max_regresion: props.user.max_regression,
            display_next: false,
            display_go_current_shift: false,
            display_back: false,
            display_back_current_shift: false
        };
    }

    componentDidMount() {
        this.fetchData(this.props);
        try {
            this.props.socket.on('message', response => {
                if (response.message) {
                    this.fetchData(this.props);
                }
            });
        } catch (e) { console.log(e) }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (!_.isEqual(nextProps.selectedDate, prevState.dt) || !_.isEqual(nextProps.selectedShift, prevState.sf)) {
            return {
                dt: nextProps.selectedDate,
                sf: nextProps.selectedShift,
                max_regresion: nextProps.user.max_regression,
                display_next: false,
                display_go_current_shift: false,
                display_back: false,
                display_back_current_shift: false
            }
        } else return null;
    }

    componentDidUpdate(prevProps, prevState) {
        if (!_.isEqual(this.state.dt, prevState.dt) || !_.isEqual(this.state.sf, prevState.sf)) {
            this.fetchData(this.props);
        }
    }

    fetchData(props) {
        let newState = this.state;

        newState.diffDays = 0;
        newState.actual_regresion = 0;
        const { production_day, current_datetime, shift_id } = GetShiftProductionDayFromSiteAndDate(props.user);
        const indexCurrentShift = _.findIndex(props.user.shifts, { shift_id: shift_id });

        const selectedDateTime = moment(newState.dt);//ONLY SELECTED DATA. WE NEED THE TME OF THE SHIFT TOO
        const indexSelectedShift = _.findIndex(props.user.shifts, { shift_name: newState.sf });

        if (production_day.format('YYYY/MM/DD') !== selectedDateTime.format('YYYY/MM/DD') || indexCurrentShift !== indexSelectedShift) {
            //console.log('selected information is not the current shift');
            //logic to get the days difference between the current date and the selected date
            newState.diffDays = current_datetime.format('YYYY/MM/DD') === selectedDateTime.format('YYYY/MM/DD') ? 0 :
                moment.duration(moment(selectedDateTime.format('YYYY/MM/DD')).diff(moment(current_datetime.format('YYYY/MM/DD')))).asDays();

            if (newState.diffDays > 0 || (newState.diffDays === 0 && indexCurrentShift < indexSelectedShift)) {
                newState.display_back_current_shift = true;
                //console.log('back to current shift');
            } else if (newState.diffDays < 0) {
                newState.actual_regresion = indexCurrentShift;//calculate number of shift for current shift
                newState.actual_regresion += (newState.diffDays + 1) * -1 * props.user.shifts.length;//calculate numbers of shifts between dates
                newState.actual_regresion += props.user.shifts.length - indexSelectedShift;//calculate number of shifts for selected date
                newState.display_next = true;
                //console.log('actual_regresion: ', newState.actual_regresion);
            } else if (newState.diffDays === 0) {
                newState.actual_regresion = indexCurrentShift - indexSelectedShift;
                newState.display_next = true;
                //console.log('regresion of shift', indexActualShift - indexSelectedShift);
            }
        }

        newState.display_back = newState.actual_regresion < newState.max_regresion;
        newState.display_go_current_shift = newState.actual_regresion > newState.max_regresion;

        this.setState(newState);
    }

    returnToCurrentShift() {
        const { production_day, shift_name } = GetShiftProductionDayFromSiteAndDate(this.props.user);
        this.applyToQueryOptions({ dt: production_day, sf: shift_name });
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
        let search = qs.parse(this.props.history.location.search);
        search.dt = moment(object.dt).format('YYYY/MM/DD HH:mm');
        search.sf = object.sf;
        let parameters = $.param(search);
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
                                id='iconDoubleLeftJump'
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
                            <span id="next-shift" onClick={() => this.goNextShift(1)}>{t('Next Shift')}</span>
                            <FontAwesome
                                name="caret-right fa-2"
                                className="icon-arrow"
                                onClick={() => this.goNextShift(1)} />
                            {this.state.max_regresion - this.state.actual_regresion <= (this.state.max_regresion - 2) ?
                                <FontAwesome
                                    id='iconDoubleRightJump'
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