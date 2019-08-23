
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
        sessionStorage.setItem('date', date);
      }

    render() {
        var date = sessionStorage.getItem("date");
        if (date !== null){
            date = new Date(date);
        }
        return (
            <DatePicker
                fixedHeight
                className={'date-picker-field'}
                selected={date != null ? date : this.state.startDate }
                onChange={this.handleChange}
            />
        );
    }
};

export default DatePickerCustom;


