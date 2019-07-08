
import React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import './ShiftPicker.scss';

class ShiftPickerCustom extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            startDate: new Date(),
            value: this.props.t(this.props.value)
        } 
        this.onSelect = this.onSelect.bind(this);
    }  

    onSelect(e) {
        this.setState({value: e})
        this.props.collectInput(e, 'shift');
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
          <Dropdown.Item eventKey="Shift 1" onSelect={(e)=>this.onSelect(e)}>{t('Shift 1')}</Dropdown.Item>
          <Dropdown.Item eventKey="Shift 2" onSelect={(e)=>this.onSelect(e)}>{t('Shift 2')}</Dropdown.Item>
          <Dropdown.Item eventKey="Shift 3" onSelect={(e)=>this.onSelect(e)}>{t('Shift 3')}</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item eventKey="All Shifts" onSelect={(e)=>this.onSelect(e)}>{t('All Shifts')}</Dropdown.Item>
        </DropdownButton>
        )
    }
};

export default ShiftPickerCustom;


