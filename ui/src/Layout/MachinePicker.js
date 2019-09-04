import React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import './MachinePicker.scss';
import { getRequest } from '../Utils/Requests';

class MachinePickerCustom extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            machines: [],
            value: props.value
        }
        this.onSelect = this.onSelect.bind(this);
    }

    componentDidMount() {
        const machineArray = [];
        const machines = getRequest('/machine');
        machines.then((machinesObj => { 
            machinesObj ? machinesObj.map((item, index) => machineArray.push(item.Asset.asset_code)) : void (0) 
        }))
        this.setState({ machines: machineArray })
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ value: nextProps.value });
    }

    onSelect(e) {
        this.props.collectInput(e, 'machineValue');
    }

    render() {
        var machine = this.state.value || sessionStorage.getItem("machine");
        const t = this.props.t;
        const machines = this.state.machines;
        return (
            <DropdownButton
                alignleft="true"
                title={t(machine)}
                id="dropdown-menu-align-right"
                className="machine-picker-button machine-picker"
            >
                {machines.map((machine, index) => {
                    return (
                        <Dropdown.Item onSelect={(e) => this.onSelect(e)} key={index} eventKey={machine}>{machine}</Dropdown.Item>
                    )
                }
                )
                }
            </DropdownButton>
        )
    };

}

export default MachinePickerCustom;


