import React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import _ from 'lodash';
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
        const userSite = {
            params: {
                site: this.props.user.site
            }
        }
        const machineArray = [];
        const machines = getRequest('/machine', userSite);
        machines.then((machinesObj => {
            machinesObj ?
                machinesObj.map((item, index) =>
                    machineArray.push({ asset_name: item.Asset.asset_name, asset_code: item.Asset.asset_code, automation_level: item.Asset.automation_level })
                )
                : void (0)
        }))
        this.setState({ machines: machineArray })
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ value: nextProps.value });
    }

    onSelect(e) {
        this.props.collectInput(e, 'mc');
        const obj = _.find(this.state.machines, { asset_code: e })
        if (obj.automation_level) {
            this.props.collectInput(obj.automation_level, 'tp');
        }
    }

    render() {
        var machine = this.state.value || localStorage.getItem("machine");
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
                        <Dropdown.Item onSelect={(e) => this.onSelect(e)} key={index} eventKey={(machine.asset_code)}>{machine.asset_name}</Dropdown.Item>
                    )
                }
                )
                }
            </DropdownButton>
        )
    };

}

export default MachinePickerCustom;


