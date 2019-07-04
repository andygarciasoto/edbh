import React from 'react';
import './Header.scss';
import logo from '../Parker_Hannifin.svg';
import { Row, Col } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import MegaMenu from './MegaMenu';
import DatePickerCustom from './DatePicker';
import ShiftPickerCustom from './ShiftPicker';
import MachinePickerCustom from './MachinePicker';
import LanguagePickerCustom from './LanguagePicker';
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
        this.returnToParent = this.returnToParent.bind(this);
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

    openMenu() {
        this.state.megaMenuToggle === 'dropdown-content opened' ?
        this.setState({megaMenuToggle: 'dropdown-content'}) : 
        this.setState({megaMenuToggle: 'dropdown-content opened'});
    }

    returnToParent(data) {
        this.props.toParent(data);
    }

    componentDidMount() {
        // i18next.changeLanguage('es', ()=>console.log('changed the language')) // -> returns a Promise
    }

    render() {
        const t = this.props.t;
        return (
            <nav className="navbar">
                    <Row className={'row'}>
                        <Col className={'col'} md={3} lg={3}><img src={logo} className="App-logo header-side" alt="logo"/></Col>
                        <Col className={'col'} md={9} lg={9}> 
                            <div className="links header-side">
                                <span className="header-item header-elem" href="#" id="log-out">{t('Log Out')} <FontAwesome name="sign-out"/></span>
                                <span className="header-item" href="#" id="mega-menu"><span className="header-elem" onClick={(e)=>this.openMenu(e)}>{t('Menu')}&nbsp;</span>
                                <FontAwesome onClick={(e)=>this.openMenu(e)}name="bars"/>
                                <MegaMenu toggle={this.state.megaMenuToggle} t={t}>
                                    <MachinePickerCustom collectInput={this.collectInputs} changeMachine={this.props.changeMachine}value={t('Select Machine')}/>
                                    <DatePickerCustom collectInput={this.collectInputs} changeDate={this.props.changeDate}/>
                                    <ShiftPickerCustom collectInput={this.collectInputs} t={t} value={t('Select Shift')}/>
                                    <LanguagePickerCustom changeDateLanguage={this.props.changeDateLanguage} openMenu={this.openMenu} value={t('Select Language')}/>
                                    <QueryButton 
                                        machine={this.state.machineValue}
                                        date={this.state.dateValue}
                                        shift={this.state.shiftValue}
                                        toParent={this.returnToParent}
                                        openMenu={this.openMenu}
                                        t={t}
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