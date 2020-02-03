
import React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import moment from 'moment';
import './ShiftPicker.scss';

class ShiftPickerCustom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      shifts: props.user.shifts,
      site: props.user.site
    }
  }

  componentWillReceiveProps(nextProps) {
    let newShifts = nextProps.user.shifts;
    this.setState({
      value: nextProps.value,
      shifts: newShifts
    })
  }

  onSelect = (shift) => {
    let hour = moment(shift.hour, 'HH').format('HH:mm');
    const date = this.props.date;
    const newDate = moment(moment(date).format('YYYY/MM/DD') + ' ' + hour);
    this.props.collectInput(new Date(newDate), 'dt');
    this.props.collectInput(shift.shift_name, 'sf');
  }

  render() {
    const t = this.props.t;
    return (
      <DropdownButton
        alignleft="true"
        title={this.state.value}
        id="dropdown-menu-align-right"
        className="shift-picker-button"
      >
        {
          (this.state.shifts && this.state.shifts.length > 0) ? this.state.shifts.map((shift, index) => {
            return <Dropdown.Item key={shift.shift_id} eventKey={shift.shift_id} onSelect={() => this.onSelect(shift)}>{t(shift.shift_name)}</Dropdown.Item>
          }) : null
        }
      </DropdownButton>
    )
  }
};

export default ShiftPickerCustom;


