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
import moment from 'moment';
import QueryButton from './QueryButton';
import { isComponentValid } from '../Utils/Requests';
import { Link } from 'react-router-dom';


class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            megaMenuToggle: 'dropdown-content',
            machineValue: props.selectedMachine || props.t('Select Machine'),
            machineType: props.machineType,
            dateValue: new Date(moment(props.selectedDate).format('YYYY/MM/DD HH:mm')),
            shiftValue: props.selectedShift || props.t('Select Shift'),
            languageValue: props.selectedLanguage || props.t('Select Language'),
            newOrder_value: ''
        }
        this.openMenu = this.openMenu.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.signOut = this.signOut.bind(this);
    }

    collectInputs = (value, type) => {
        this.setState({ [type]: value });
    }

    openMenu() {
        this.state.megaMenuToggle === 'dropdown-content' ?
        this.props.sendMenuToggle(true) :
        this.props.sendMenuToggle(false);
        
        isComponentValid(this.props.user.role, 'megamenu') ?
            this.state.megaMenuToggle === 'dropdown-content opened' ?
                this.setState({ megaMenuToggle: 'dropdown-content' }) :
                this.setState({ megaMenuToggle: 'dropdown-content opened' }) : void (0);
    }

    componentDidMount() {
        window.addEventListener('scroll', this.onScroll)
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            machineValue: nextProps.selectedMachine || nextProps.t('Select Machine'),
            dateValue: new Date(new Date(moment(nextProps.selectedDate).format('YYYY/MM/DD HH:mm'))),
            shiftValue: nextProps.selectedShift || nextProps.t('Select Shift'),
            languageValue: nextProps.selectedLanguage || nextProps.t('Select Language'),
            machineType: nextProps.machineType
        })
    }

    onScroll() {
        this.setState({ megaMenuToggle: 'dropdown-content' });
    }

    signOut() {
        // localStorage.setItem('accessToken', undefined);
    }

    render() {
        const t = this.props.t;
        const station = localStorage.getItem('machine_name');
        const loginUrl = `/?st=${station}`
        return (
            <nav className="navbar">
                <Row className={'row'}>
                    <Col className={'col'} md={3} lg={3}><img src={logo} className="App-logo header-side" alt="logo" /></Col>
                    <Col className={'col'} md={9} lg={9}>
                        <div className="links header-side">
                            <span className="header-item header-elem" href="#" id="log-out" onClick={this.signOut}><Link to={loginUrl}>{t('Sign Out')} <FontAwesome name="sign-out" /></Link></span>
                            {isComponentValid(this.props.user.role, 'megamenu') ? 
                            <span className="header-item" href="#" id="mega-menu"><span className="header-elem" onClick={(e) => this.openMenu(e)}>{t('Menu')}&nbsp;</span>
                                <FontAwesome
                                    onClick={(e) => this.openMenu(e)}
                                    name="bars" />
                                <MegaMenu toggle={this.state.megaMenuToggle} t={t}>
                                    <MachinePickerCustom
                                        collectInput={this.collectInputs}
                                        t={t}
                                        user={this.props.user}
                                        value={this.state.machineValue} />
                                    <DatePickerCustom
                                        collectInput={this.collectInputs}
                                        value={this.state.dateValue}
                                        search={this.props.search}
                                         />
                                    <ShiftPickerCustom
                                        collectInput={this.collectInputs}
                                        t={t}
                                        value={this.state.shiftValue}
                                        date={this.state.dateValue}
                                        commonParams={this.props.commonParams}
                                        shifts={this.props.shifts}
                                        />
                                    <LanguagePickerCustom
                                        collectInput={this.collectInputs}
                                        value={this.state.languageValue} />
                                    <QueryButton
                                        machine={this.state.machineValue}
                                        date={this.state.dateValue}
                                        shift={this.state.shiftValue}
                                        machine_type={this.state.machineType}
                                        language={this.state.languageValue}
                                        changeLanguageBrowser={this.props.changeLanguageBrowser}
                                        openMenu={this.openMenu}
                                        search={this.props.search}
                                        history={this.props.history}
                                        t={t}
                                        clearExpanded={this.props.clearExpanded}
                                    />
                                </MegaMenu>
                            </span>
                             : null}
                             {isComponentValid(this.props.user.role, 'neworder') ? 
                             ((this.state.machineType) && (this.state.machineType) !== '' && (this.state.machineType !== 'Automated')) ?
                                <span
                                className="header-item"
                                href="#"
                                id="mega-menu">
                                <span className="header-elem"
                                    value={this.state.newOrder_value}
                                    onClick={(e) => this.props.openModal('order')}>
                                    {t('New Order')}&nbsp;</span>
                                <FontAwesome
                                    onClick={(e) => this.props.openModal('order')}
                                    name="file-text" /></span> : null : null
                                }
                        </div>
                    </Col>
                </Row>
            </nav>
        );
    }
};

export default Header;