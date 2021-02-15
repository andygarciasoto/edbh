
import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getCurrentTimeOnly } from '../../Utils/Requests';
import _ from 'lodash';
import moment from 'moment';

class DatePickerCustom extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: this.props.value,
        }
        this.handleChange = this.handleChange.bind(this);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (!_.isEqual(nextProps.value, prevState.startDate)) {
            return {
                startDate: nextProps.value
            };
        } else return null;
    }

    handleChange(date) {
        const time = this.state.startDate ? moment(this.state.startDate).format('HH:mm') : undefined;
        const newDate = moment(moment(date).format('YYYY/MM/DD') + ' ' + (time ? time : getCurrentTimeOnly()));
        this.props.collectInput(new Date(newDate), 'dt');
    }

    render() {
        return (
            <DatePicker
                fixedHeight
                className={'date-picker-field'}
                selected={this.state.startDate}
                onChange={this.handleChange}
            />
        );
    }
};

export default DatePickerCustom;


