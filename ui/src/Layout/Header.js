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
import { Link } from 'react-router-dom';


class Header extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            megaMenuToggle: 'dropdown-content',
            machineValue: 12532,
            dateValue: new Date(),
            shiftValue: 'Select Shift',
        } 
        this.openMenu = this.openMenu.bind(this);
        this.collectInputs = this.collectInputs.bind(this);
        this.returnToParent = this.returnToParent.bind(this);
        this.onScroll = this.onScroll.bind(this);
    }

    collectInputs(value, type) {
        if (type === 'machine') {
            this.setState({machineValue: value})
        }
        if (type === 'date') {
            this.setState({dateValue: moment(value).format('YYYY/MM/DD')})
        }
        if (type === 'shift') {
            // this.setState({shiftValue: value})
            this.props.sendToMain(value);
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
        window.addEventListener('scroll', this.onScroll)
    }

    componentWillReceiveProps(nextProps) {
        this.setState({shiftValue: nextProps.t(nextProps.selectedShift)})
    }

    onScroll() {
        this.setState({megaMenuToggle: 'dropdown-content'});
    }


    render() {
        const t = this.props.t;
        return (
            <nav className="navbar">
                    <Row className={'row'}>
                        <Col className={'col'} md={3} lg={3}><img src={logo} className="App-logo header-side" alt="logo"/></Col>
                        <Col className={'col'} md={9} lg={9}> 
                            <div className="links header-side">
                                <span className="header-item header-elem" href="#" id="log-out"><Link to="/">{t('Sign Out')} <FontAwesome name="sign-out"/></Link></span>
                                <span className="header-item" href="#" id="mega-menu"><span className="header-elem" onClick={(e)=>this.openMenu(e)}>{t('Menu')}&nbsp;</span>
                                <FontAwesome onClick={(e)=>this.openMenu(e)}name="bars"/>
                                <MegaMenu toggle={this.state.megaMenuToggle} t={t}>
                                    <MachinePickerCustom collectInput={this.collectInputs} changeMachine={this.props.changeMachine} t={t} value={t('Select Machine')}/>
                                    <DatePickerCustom collectInput={this.collectInputs} changeDate={this.props.changeDate} date={this.state.dateValue}/>
                                    <ShiftPickerCustom collectInput={this.collectInputs} t={t} value={t('Select Shift')} currentShift={this.state.shiftValue} />
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