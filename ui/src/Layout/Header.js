import React from 'react';
import './Header.scss';
import logo from '../Parker_Hannifin.svg';
import { Row, Col } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import MegaMenu from './MegaMenu';
import DatePickerCustom from './DatePicker';
import ShiftPickerCustom from './ShiftPicker';
import MachinePickerCustom from './MachinePicker';
import QueryButton from './QueryButton';
import moment from 'moment';

class Header extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            megaMenuToggle: 'dropdown-content',
            machineValue: '',
            dateValue: '',
            shiftValue: '',
        } 
        this.openMenu = this.openMenu.bind(this);
        this.collectInputs = this.collectInputs.bind(this);
    }

    collectInputs(value, type) {
        if (type === 'machine') {
            this.setState({machineValue: value})
        }
        if (type === 'date') {
            this.setState({dateValue: moment(value).format('L')})
        }
        if (type === 'shift') {
            this.setState({shiftValue: value})
        }
    }

    openMenu(e) {
        this.state.megaMenuToggle === 'dropdown-content opened' ?
        this.setState({megaMenuToggle: 'dropdown-content'}) : 
        this.setState({megaMenuToggle: 'dropdown-content opened'});
    }

    render() {
        return (
            <nav className="navbar">
                    <Row className={'row'}>
                        <Col className={'col'} md={3} lg={3}><img src={logo} className="App-logo header-side" alt="logo"/></Col>
                        <Col className={'col'} md={9} lg={9}> 
                            <div className="links header-side">
                                {/* <a href="/html/">Another Dashboard</a> */}
                                <span className="header-item header-elem" href="#" id="log-out">Log Out <FontAwesome name="sign-out"/></span>
                                <span className="header-item" href="#" id="mega-menu"><span className="header-elem" onClick={(e)=>this.openMenu(e)}>Menu </span>
                                <FontAwesome onClick={(e)=>this.openMenu(e)}name="bars"/>
                                <MegaMenu toggle={this.state.megaMenuToggle}>
                                    <MachinePickerCustom collectInput={this.collectInputs}/>
                                    <DatePickerCustom collectInput={this.collectInputs}/>
                                    <ShiftPickerCustom collectInput={this.collectInputs}/>
                                    <QueryButton 
                                        machine={this.state.machineValue}
                                        date={this.state.dateValue}
                                        shift={this.state.shiftValue}
                                    />
                                </MegaMenu>
                                </span>
                            </div>
                        </Col>
                    </Row>
            </nav>
        );
    }
};

export default Header;