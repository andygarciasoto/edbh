import React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import _ from 'lodash';

class GenericSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = Object.assign(this.getInitialState(props));
    }

    getInitialState(props) {
        return {
            selectedOption: {}
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (!_.isEqual(nextProps.selectedOption, prevState.selectedOption)) {
            return {
                selectedOption: nextProps.selectedOption
            }
        } else return null;
    }

    onSelect = (option) => {
        this.props.collectInput(option, this.props.value);
    }

    render() {
        const props = this.props;
        return (
            <DropdownButton
                alignleft='true'
                title={props.t(this.state.selectedOption[props.prop_name])}
                id='dropdown-menu-align-right'
                className='machine-picker-button machine-picker'
            >
                {_.map(props.options, (option, index) => {
                    return (
                        <Dropdown.Item onSelect={() => this.onSelect(option)} key={index} eventKey={(option[props.prop])}>{option[props.prop_name]}</Dropdown.Item>
                    )
                })}
            </DropdownButton>
        )
    };

}

export default GenericSelect;


