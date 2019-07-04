import React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import './MachinePicker.scss';

class MachinePickerCustom extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            machines: [12395, 23421, 23425, 63433],
            value: this.props.value
        } 
        this.onSelect = this.onSelect.bind(this);
    }  

    onSelect(e) {
        this.setState({ value: e });
        this.props.changeMachine(e);
        this.props.collectInput(e, 'machine');
      }

    componentWillReceiveProps(nextProps) {
        this.setState({value: nextProps.value})
    }

    render() {
        const machines = this.state.machines;
        return (
          <DropdownButton
            alignleft="true"
            title={this.state.value}
            id="dropdown-menu-align-right"
            className="machine-picker-button"
            >
            {machines.map((machine, index) => {
                return (
                    <Dropdown.Item onSelect={(e)=>this.onSelect(e)} key={index} eventKey={machine}>{machine}</Dropdown.Item>
                )}
                )
            }
        </DropdownButton>
        )
    };

}

export default MachinePickerCustom;


