
import React from 'react';
import i18next from 'i18next';
import FontAwesome from 'react-fontawesome';
import { mapShift, formatDate, getCurrentTime, mapShiftReverse } from '../Utils/Requests';
import Tooltip from 'react-tooltip'
import moment from 'moment';
import $ from 'jquery';
import config from '../config.json';

class Pagination extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            shift: this.props.selectedShift,
            date: this.props.selectedDate,
            machine: this.props.selectedMachine,
            timezone: this.props.timezone || config["timezone"],
            disabled_fields: false,
        }
        this.onSelect = this.onSelect.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            date: formatDate(nextProps.selectedDate).split("-").join(""),
            shift: nextProps.selectedShift
        })
        const today = moment(getCurrentTime())
        const yesterday = moment(getCurrentTime()).add(-1, 'days');
        if (moment(nextProps.selectedDate).isSame(today, 'days') || moment(nextProps.selectedDate).isSame(yesterday, 'days')) {
            this.setState({disabled_fields: false})
        } else {
            this.setState({disabled_fields: true})
        }

    }

    getActualShiftFromActualDate() {
        let getDate = moment().tz(this.state.timezone);
        let currentHour = moment().tz(this.state.timezone).hours();
        let actualDate = moment(getDate).format(`YYYY-MM-DD ${currentHour}:mm`);
        let actualShift = 0;
        if (actualDate >= moment(actualDate).format('YYYY-MM-DD') + ' 07:00' && actualDate < moment(actualDate).format('YYYY-MM-DD') + ' 15:00') {
            actualShift = 1;
        } else if (actualDate > moment(actualDate).format('YYYY-MM-DD') + ' 15:00' && actualDate < moment(actualDate).format('YYYY-MM-DD') + ' 23:00') {
            actualShift = 2;
        } else {
            actualShift = 3;
        }
        return actualShift;
    }

    onSelect(e) {
        //Get the correct date and shift of the application.
        let actualDate = moment().tz(this.state.timezone);
        let actualShift = this.getActualShiftFromActualDate();
        //Get the actual selection of date and Shift from the UI.
        let actualDateSelection = moment(this.state.date);
        let actualShiftSelection = mapShift(this.state.shift);

        let { search } = this.props;
        let queryItem = Object.assign({}, search);

        let currentShift = mapShift(this.state.shift);
        let currentDate = this.state.date;
        let yesterday = moment(currentDate).add(-1, 'days').format('YYYY-MM-DD HH:mm:ss');
        let newDate;
        let newShift; 

        if (e === 'next') {
            if (actualDate < actualDateSelection) {
                return;
            } else if (actualDate.format('YYYYMMDD') === actualDateSelection.format('YYYYMMDD')) {
                if (actualShift === actualShiftSelection) {
                    return;
                }
            }
        }

        if (e === 'double-next') {
            if (actualDate < actualDateSelection) {
                return;
            }
        }

        let diffDays = actualDateSelection.diff(actualDate, 'days');
        if (e === 'back') {
            if (diffDays === -1) {
                if (actualShift === 1 && actualShiftSelection <= 2) {
                    return;
                }
                if (actualShift === 2 && actualShiftSelection <= 3) {
                    return;
                }
                if (actualShift === 3 && actualShiftSelection === 1) {
                    return;
                }
            } else {
                if (diffDays < -1) {
                    return;
                }
            }
        }

        if (e === 'double-back') {
            if (diffDays < 0) {
                return;
            }
        }
            if (moment(currentDate) === moment().tz(this.state.timezone)) {
            return;
        }

        if (currentShift === 3 && e === 'next') {
            newDate = moment(currentDate).add(1, 'days');
            newShift = 1;
            queryItem["dt"] = newDate.format('YYYY/MM/DD');
            queryItem["sf"] = mapShiftReverse(newShift);
            let parameters = $.param(queryItem);
            this.props.history.push(`${this.props.history.location.pathname}?${parameters}`);
            return;
        }
        if (e === 'next') {
            newDate = moment(currentDate);
            queryItem["dt"] = newDate.format('YYYY/MM/DD');
            queryItem["sf"] = mapShiftReverse(currentShift + 1);
            let parameters = $.param(queryItem);
            this.props.history.push(`${this.props.history.location.pathname}?${parameters}`);
        }

        if (e === 'double-next') {
            newDate = moment().tz(this.state.timezone);
            queryItem["dt"] = newDate.format('YYYY/MM/DD');
            queryItem["sf"] = mapShiftReverse(this.getActualShiftFromActualDate());
            let parameters = $.param(queryItem);
            this.props.history.push(`${this.props.history.location.pathname}?${parameters}`);
            this.setState({disabled_fields: false})
            return;
        }

        if (e === 'double-back') {
            newDate = currentShift <= 2 ? moment(yesterday) : moment(currentDate);
            newShift = currentShift === 3 ? 1 : currentShift === 2 ? 3 : 2;
            queryItem["dt"] = newDate.format('YYYY/MM/DD');
            queryItem["sf"] = mapShiftReverse(newShift);
            let parameters = $.param(queryItem);
            this.props.history.push(`${this.props.history.location.pathname}?${parameters}`);
            return;
        }

        if (currentShift === 1 && e === 'back') {
            newDate = moment(yesterday);
            newShift = 3;
            queryItem["dt"] = newDate.format('YYYY/MM/DD');
            queryItem["sf"] = mapShiftReverse(newShift);
            let parameters = $.param(queryItem);
            this.props.history.push(`${this.props.history.location.pathname}?${parameters}`);
            return;
        }
        if (e === 'back' && (currentShift === 2 || currentShift === 3)) {
            newDate = moment(currentDate);
            queryItem["dt"] = newDate.format('YYYY/MM/DD');
            queryItem["sf"] = mapShiftReverse(currentShift - 1);
            let parameters = $.param(queryItem);
            this.props.history.push(`${this.props.history.location.pathname}?${parameters}`);
            return;
        }

    }

    render() {
        const t = this.props.t;
        const showClass = this.state.disabled_fields ? {visibility: 'hidden'} : {};
        return (
            <div id="semi-button-deck">
                <FontAwesome 
                    name="angle-double-left"
                    data-tip='shift' 
                    data-for='last-shift' 
                    className={`icon-arrow`}
                    onClick={() => this.onSelect('double-back')} 
                    style={showClass}
                />
                <span 
                    className={`semi-button-shift-change-left`}
                    onClick={() => this.onSelect('back')}
                    style={showClass}
                    >
                    <FontAwesome 
                    name="caret-left fa-2" 
                    className="icon-arrow" 
                    style={showClass}
                    />
                    <span id="previous-shift">{t('Previous Shift')}</span>
                </span>
                <span className="semi-button-shift-change-right">
                    <span 
                        id="current-shift" 
                        onClick={() => this.onSelect('next')}
                        style={showClass}
                        >{t('Next Shift')}
                    </span>
                    <FontAwesome 
                        name="caret-right fa-2" 
                        className="icon-arrow" 
                        style={showClass}
                        onClick={() => this.onSelect('next')} />
                    {!this.state.disabled_fields ? <FontAwesome 
                        data-tip='shift' 
                        data-for='current-shift' 
                        name="angle-double-right fa-2" 
                        className="icon-arrow" 
                        onClick={() => this.onSelect('double-next')}
                    /> : 
                    <React.Fragment><span 
                        id="current-shift" 
                        onClick={() => this.onSelect('double-next')}
                        >{t('Go Back To Current Shift')}
                    </span>
                    <FontAwesome 
                        data-tip='shift' 
                        data-for='current-shift' 
                        name="angle-double-right fa-2" 
                        className="icon-arrow" 
                        onClick={() => this.onSelect('double-next')}
                    /></React.Fragment> }
                    <Tooltip id='current-shift'>{'Back to Current Shift'}</Tooltip>
                    <Tooltip id='last-shift'>{'Go back Two Shifts'}</Tooltip>
                </span>
            </div>
        )
    }
};

export default Pagination;