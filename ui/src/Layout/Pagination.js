
import React from 'react';
import i18next from 'i18next';
import FontAwesome from 'react-fontawesome';
import { mapShift, formatDate, getCurrentTime } from '../Utils/Requests';
import Tooltip from 'react-tooltip'
import moment from 'moment';

class Pagination extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            shift: this.props.selectedShift,
            date: this.props.selectedDate
        }
        this.onSelect = this.onSelect.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            date: formatDate(nextProps.selectedDate).split("-").join(""),
            shift: nextProps.selectedShift
        })
    }

    onSelect(e) {
        let currentShift = mapShift(this.state.shift);
        let currentDate = this.state.date;
        let yesterday = moment(currentDate).add(-1, 'days').format('YYYY-MM-DD HH:mm:ss');
        let newDate;
        let newShift;

        if (moment(currentDate) === moment()) {
            return;
        }
        if (currentShift === 1 && e === 'double-back') {
            newDate = yesterday;
            newShift = 2;
            this.props.getDashboardData([this.props.selectedMachine, newDate, newShift]);
            return;
        }
        if (currentShift === 2 && e === 'double-back') {
            newDate = yesterday;
            newShift = 3;
            this.props.getDashboardData([this.props.selectedMachine, newDate, newShift]);
            return;
        }
        if (currentShift === 1 && e === 'back') {
            newDate = yesterday;
            newShift = 3;
            this.props.getDashboardData([this.props.selectedMachine, newDate, newShift]);
            return;
        }
        if (currentShift === 3 && e === 'next') {
            newDate = moment(currentDate).add(1, 'days');
            newShift = 1;
            this.props.getDashboardData([this.props.selectedMachine, newDate, newShift]);
            return;
        }
        if (e === 'double-next') {
            newDate = getCurrentTime();
            this.props.getDashboardData([this.props.selectedMachine, newDate, 1]);
            return;
        }
        if (e === 'next') {
            newDate = getCurrentTime();
            this.props.getDashboardData([this.props.selectedMachine, newDate, currentShift+1]);
        }
        if ((e === 'back' && currentShift === 2) || (e === 'back' && currentShift === 3)) {
            this.props.getDashboardData([this.props.selectedMachine, currentDate, currentShift-1]);
        }
        if (e === 'double-back') {
            this.props.getDashboardData([this.props.selectedMachine, currentDate, currentShift-2]);
        }
    }

    render() {
        const t = this.props.t;
        return (
            <div id="semi-button-deck">
                <FontAwesome name="angle-double-left"  data-tip='shift' data-for='last-shift' className="icon-arrow" onClick={() => this.onSelect('double-back')} />
                <span className="semi-button-shift-change-left" onClick={() => this.onSelect('back')}>
                    <FontAwesome name="caret-left fa-2" className="icon-arrow" />
                    <span id="previous-shift">{t('Previous Shift')}</span>
                </span>
                <span className="semi-button-shift-change-right" onClick={() => this.onSelect('next')}>
                    <span id="current-shift">{t('Next Shift')}</span>
                    <FontAwesome name="caret-right fa-2" className="icon-arrow" />
                    <FontAwesome data-tip='shift' data-for='current-shift' name="angle-double-right fa-2" className="icon-arrow" />
                    <Tooltip id='current-shift'>{'Back to Current Shift'}</Tooltip>
                    <Tooltip id='last-shift'>{'Go back Two Shifts'}</Tooltip>
                </span>
            </div>
        )
    }
};

export default Pagination;