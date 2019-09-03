
import React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { getRequest } from '../Utils/Requests';
import './ShiftPicker.scss';

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
    const shifts = getRequest('/shifts');
    shifts.then(shiftObj => { this.setState({ shifts: shiftObj }) })
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value })
  }

  onSelect(e) {
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


