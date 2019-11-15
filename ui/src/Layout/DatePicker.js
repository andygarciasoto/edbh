
import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getCurrentTimeOnly } from '../Utils/Requests';
import moment from 'moment';
import './DatePicker.scss';

class DatePickerCustom extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: this.props.value,
        }
        this.handleChange = this.handleChange.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ startDate: nextProps.value })
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


