import React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import _ from 'lodash';

class MachinePickerCustom extends React.Component {
    constructor(props) {
        super(props);
        this.state = Object.assign(this.getInitialState(props));
    }

    getInitialState(props) {
        let machineSelected = {};
        const machineArray = this.getMachineArray(props);
        machineSelected = _.find(machineArray, ['asset_code', props.value]);
        machineSelected = machineSelected ? machineSelected : {};
        return {
            mc: props.value,
            value: machineSelected,
            machines: machineArray,
            site: props.user.site
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (!_.isEqual(nextProps.value, prevState.mc)) {
            return {
                mc: nextProps.value,
                site: nextProps.user.site
            };
        } else return null;
    }

    componentDidUpdate(prevProps, prevState) {
        if (!_.isEqual(this.state.mc, prevState.mc)) {
            let machineSelected = {};
            const machineArray = this.getMachineArray(this.props);
            machineSelected = _.find(machineArray, ['asset_code', this.state.mc]);
            machineSelected = machineSelected ? machineSelected : {};
            this.setState({
                value: machineSelected,
                machines: machineArray
            })
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


