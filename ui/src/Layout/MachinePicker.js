import React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import './MachinePicker.scss';
import { getRequest} from '../Utils/Requests';

class MachinePickerCustom extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            machines: [],
            value: this.props.t(this.props.value)
        } 
        this.onSelect = this.onSelect.bind(this);
    }  

    componentDidMount() {
        const machineArray = [];
        const machines = getRequest('/machine');
        machines.then((machinesObj => { machinesObj ? machinesObj.map((item, index) => machineArray.push(item.asset_code)) : void(0)}))
        this.setState({machines: machineArray})
    }

    onSelect(e) {
        this.setState({ value: e });
        this.props.changeMachine(e);
        this.props.collectInput(e, 'machine');
        localStorage.setItem('machine', e);
      }

    render() {
        var machine = window.localStorage.getItem("machine");
        const t = this.props.t;
        const machines = this.state.machines;
        return (
          <DropdownButton
            alignleft="true"
            title={t(machine != null ? machine : this.state.value)}
            id="dropdown-menu-align-right"
            className="machine-picker-button machine-picker"
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


