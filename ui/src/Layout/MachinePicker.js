import React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import _ from 'lodash';
import './MachinePicker.scss';

class MachinePickerCustom extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            machines: [],
            value: {},
            site: props.user.site
        }
        this.onSelect = this.onSelect.bind(this);
    }

    componentDidMount() {
        let machineArray = this.getMachineArray(this.props.user.machines);
        this.setState({ machines: machineArray })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value) {
            let machineSelected = {};
            _.forEach(nextProps.user.machines, (machine) => {
                if (machine.Asset.asset_code === nextProps.value) {
                    machineSelected = machine.Asset;
                }
            });
            let machineArray = this.state.machines;
            if (nextProps.user.site !== this.state.site) {
                machineArray = this.getMachineArray(nextProps.user.machines);
            }
            this.setState({ value: machineSelected, machines: machineArray, site: nextProps.user.site });
        }
    }

    getMachineArray(machines) {
        let machineArray = [];
        _.forEach(machines, item => {
            machineArray.push({ asset_name: item.Asset.asset_name, asset_code: item.Asset.asset_code, automation_level: item.Asset.automation_level })
        });
        return machineArray;
    }

    onSelect(machine) {
        this.props.collectInput(machine.asset_code, 'mc');
        if (machine.automation_level) {
            this.props.collectInput(machine.automation_level, 'tp');
        }
    }

    render() {
        var machineSelected = this.state.value;
        if (!machineSelected.asset_name) {
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


