
import React from 'react';
import DatePicker from  'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DatePicker.scss';
import moment from 'moment';

class DatePickerCustom extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            startDate: this.props.date,
        } 
        this.handleChange = this.handleChange.bind(this);
    }  

    handleChange(date) {
        this.setState({
          startDate: date
        });
        this.props.changeDate(date);
        this.props.collectInput(date, 'date');
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


