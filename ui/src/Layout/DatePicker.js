
import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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
        this.props.collectInput(date, 'dateValue');
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


