import React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import _ from 'lodash';

class MachinePickerCustom extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            machines: this.getMachineArray(props),
            value: {},
            site: props.user.site
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value) {
            let machineSelected = {};
            const machineArray = this.getMachineArray(nextProps);
            machineSelected = _.find(machineArray, ['asset_code', nextProps.value]);
            machineSelected = machineSelected ? machineSelected : {};
            this.setState({ value: machineSelected, machines: machineArray, site: nextProps.user.site });
        }
    }

    getMachineArray(props) {
        let machines = props.history.location.pathname === '/summary' ? props.user.workcell : props.user.machines;
        let machineArray = [];
        _.forEach(machines, item => {
            machineArray.push({ asset_name: item.asset_name, asset_code: item.asset_code, automation_level: item.automation_level })
        });
        return machineArray;
    }

    onSelect = (machine) => {
        this.props.collectInput(machine.asset_code, 'mc');
        if (machine.automation_level) {
            this.props.collectInput(machine.automation_level, 'tp');
        }
    }

    render() {
        var machineSelected = this.state.value;
        if (!machineSelected || !machineSelected.asset_name) {
            machineSelected.asset_name = 'No Data';
        }
        const t = this.props.t;
        const machines = this.state.machines;
        return (
            <DropdownButton
                alignleft="true"
                title={t(machineSelected.asset_name)}
                id="dropdown-menu-align-right"
                className="machine-picker-button machine-picker"
            >
                {machines.map((machine, index) => {
                    return (
                        <Dropdown.Item onSelect={() => this.onSelect(machine)} key={index} eventKey={(machine.asset_code)}>{machine.asset_name}</Dropdown.Item>
                    )
                }
                )
                }
            </DropdownButton>
        )
    };

}

export default MachinePickerCustom;


