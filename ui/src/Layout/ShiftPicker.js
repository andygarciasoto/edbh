
import React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import './ShiftPicker.scss';

class ShiftPickerCustom extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            startDate: new Date(),
            value: 'Select Shift'
        } 
        this.onSelect = this.onSelect.bind(this);
    }  

    onSelect(e) {
        this.props.collectInput(e, 'shift');
      }

    componentWillReceiveProps(nextProps) {
      this.setState({value: nextProps.currentShift})
    }
 

    render() {
      const t = this.props.t
        return (
          <DropdownButton
            alignleft="true"
            title={t(this.state.value)}
            id="dropdown-menu-align-right"
            className="shift-picker-button"
          >
          <Dropdown.Item eventKey="First Shift" onSelect={(e)=>this.onSelect(e)}>{t('First Shift')}</Dropdown.Item>
          <Dropdown.Item eventKey="Second Shift" onSelect={(e)=>this.onSelect(e)}>{t('Second Shift')}</Dropdown.Item>
          <Dropdown.Item eventKey="Third Shift" onSelect={(e)=>this.onSelect(e)}>{t('Third Shift')}</Dropdown.Item>
          {/* <Dropdown.Divider />
          <Dropdown.Item eventKey="All Shifts" onSelect={(e)=>this.onSelect(e)}>{t('All Shifts')}</Dropdown.Item> */}
        </DropdownButton>
        )
    }
};

export default ShiftPickerCustom;


