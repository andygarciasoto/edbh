
import React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import './ShiftPicker.scss';

class ShiftPickerCustom extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            startDate: new Date(),
            value: this.props.value
        } 
        this.onSelect = this.onSelect.bind(this);
    }  

    componentWillReceiveProps(nextProps) {
        this.setState({value: nextProps.value})
    }

    onSelect(e) {
        this.setState({value: e})
        this.props.collectInput(e, 'shift');
      }

    render() {
        return (
          <DropdownButton
            alignleft="true"
            title={this.state.value}
            id="dropdown-menu-align-right"
            className="shift-picker-button"
          >
          <Dropdown.Item eventKey="Shift 1" onSelect={(e)=>this.onSelect(e)}>Shift 1</Dropdown.Item>
          <Dropdown.Item eventKey="Shift 2" onSelect={(e)=>this.onSelect(e)}>Shift 2</Dropdown.Item>
          <Dropdown.Item eventKey="Shift 3" onSelect={(e)=>this.onSelect(e)}>Shift 3</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item eventKey="All Shifts" onSelect={(e)=>this.onSelect(e)}>All Shifts</Dropdown.Item>
        </DropdownButton>
        )
    }
};

export default ShiftPickerCustom;


