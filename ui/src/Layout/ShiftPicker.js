
import React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { getRequest, mapShift } from '../Utils/Requests';
import moment from 'moment';
import './ShiftPicker.scss';
import _ from 'lodash';

class ShiftPickerCustom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      shifts: []
    }
    this.onSelect = this.onSelect.bind(this);
  }

  componentDidMount() {
    // const shifts = getRequest('/shifts');
    // console.log(this.props.shifts)
    // shifts.then(shiftObj => { this.setState({ shifts: shiftObj }) })
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ 
      value: nextProps.value,
      shifts: nextProps.shifts 
    })
  }

  onSelect(e) {
    let hour = '';
    const date = this.props.date;
    const shifts = _.orderBy(this.state.shifts, 'shift_code');
    if (mapShift(e) === 1) {
      hour = `${moment(shifts[0].hour, 'HH').format('HH:mm')}`;
    }
    if (mapShift(e) === 2) {
      hour = `${moment(shifts[1].hour, 'HH').format('HH:mm')}`;
    }
    if (mapShift(e) === 3) {
      hour = `${moment(shifts[2].hour, 'HH').format('HH:mm')}`;
    }
    const newDate = moment(moment(date).format('YYYY/MM/DD') + ' ' + hour);
    this.props.collectInput(new Date(newDate), 'dateValue');
    this.props.collectInput(e, 'shiftValue');
  }

  render() {
    const t = this.props.t
    return (
      <DropdownButton
        alignleft="true"
        title={this.state.value}
        id="dropdown-menu-align-right"
        className="shift-picker-button"
      >
        {
          (this.state.shifts && this.state.shifts.length > 0) ? this.state.shifts.map((shift, index) => {
            return <Dropdown.Item key={shift.shift_code} eventKey={shift.shift_name} onSelect={(e) => this.onSelect(e)}>{t(shift.shift_name)}</Dropdown.Item>
          }) : null
        }
      </DropdownButton>
    )
  }
};

export default ShiftPickerCustom;


