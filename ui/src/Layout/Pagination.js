
import React from 'react';
import i18next from 'i18next';
import FontAwesome from 'react-fontawesome';
import { mapShift, formatDate } from '../Utils/Requests';
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
        let currentYear = currentDate.slice(0, 4);
        let currentMonth = currentDate.slice(4, 6);
        let currentDay = Number(currentDate.slice(6, 8));
        if (e === 'double-back') {
            currentShift = currentShift - 2;
            if (currentShift === -2) {
                currentShift = -1;
            }
        } else if (e === 'back') {
            currentShift = currentShift - 1;
            if (currentShift === -2) {
                currentShift = -1;
            }
            if (currentShift <= 0) {
                currentDay = currentDay - 1;
                currentShift = 3;
            }
        } else if (e === 'next') {
            if (currentShift >= 3) {
                currentShift = 1;
                return;
            } else {
                currentShift = currentShift + 1;
            }
        }
        this.setState({ shift: currentShift })
        // ---------------------------------
        if (currentDay < 1) {
            currentDay = 31
        }
        if (currentDay > 31) {
            currentDay = 1
        }
        if (currentDay < 10) {
            currentDay = "0" + currentDay.toString();
        }
        const newDate = currentYear + currentMonth + currentDay;
        this.setState({ date: newDate });
        this.props.fetchData([this.props.selectedMachine, newDate, currentShift]);
    }

    render() {
        const t = this.props.t;
        return (
            <div id="semi-button-deck">
                <FontAwesome name="angle-double-left" className="icon-arrow" onClick={() => this.onSelect('double-back')} />
                <span className="semi-button-shift-change-left" onClick={() => this.onSelect('back')}>
                    <FontAwesome name="caret-left fa-2" className="icon-arrow" />
                    <span id="previous-shift">{t('Previous Shift')}</span>
                </span>
                <span className="semi-button-shift-change-right" onClick={() => this.onSelect('next')}>
                    <span id="current-shift">{t('Next Shift')}</span>
                    <FontAwesome name="caret-right fa-2" className="icon-arrow" />
                    <FontAwesome name="angle-double-right fa-2" className="icon-arrow" />
                </span>
            </div>
        )
    }
};

export default Pagination;