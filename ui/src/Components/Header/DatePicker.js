
import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';

class DatePickerCustom extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    handleChange = (date) => {
        const newDate = moment(date).format('YYYY/MM/DD HH:mm');
        this.props.collectInput(new Date(newDate), 'dt');
    }

    render() {
        return (
            <DatePicker
                fixedHeight
                className={'date-picker-field'}
                selected={this.props.value}
                onChange={this.handleChange}
            />
        );
    }
};

export default DatePickerCustom;


