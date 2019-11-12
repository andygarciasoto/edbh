import React from 'react';
import './Header.scss';
import logo from '../Parker_Hannifin.svg';
import { Nav, Navbar, Row, Dropdown } from 'react-bootstrap';
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
import $ from 'jquery';


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

    redirectTo = (page) => {
        let { search } = this.props;
        let queryItem = Object.assign({}, search);
        queryItem["mc"] = this.state.machine;
        queryItem["dt"] = moment(this.state.date).format('YYYY/MM/DD HH:mm');
        queryItem["sf"] = this.state.shift;
        queryItem["ln"] = this.state.language;
        queryItem["tp"] = this.state.machine_type;
        let parameters = $.param(queryItem);
        this.props.history.push(`${page}?${parameters}`);
    }

    render() {

        const customToogle = React.forwardRef(({ children, onClick }, ref) => (
            <a className='nav-link' href='#' ref={ref} onClick={e => { e.preventDefault(); onClick(e); }}>{children}&nbsp;<FontAwesome name='bars' /></a>
        ));

        const t = this.props.t;
        const station = localStorage.getItem('machine_name');
        const loginUrl = `/?st=${station}`
        return (
            <Navbar>
                <Row>
                    <Navbar.Brand><img src={logo} className="App-logo header-side" alt="logo" /></Navbar.Brand>

                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse className="justify-content-end">
                        {isComponentValid(this.props.user.role, 'megamenu') ?
                            <span className="header-item" href="#" id="mega-menu"><span className="header-elem" onClick={(e) => this.openMenu(e)}>{t('Parameters')}&nbsp;</span>
                                <FontAwesome
                                    onClick={(e) => this.openMenu(e)}
                                    name="filter" />
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
                        {isComponentValid(this.props.user.role, 'import') ?
                            <Dropdown className="customToogle">
                                <Dropdown.Toggle as={customToogle} id="dropdown-basic">
                                    {t('Menu')}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {/* <Dropdown.Item onClick={() => this.redirectTo('dashboard')}>{t('Dashboard')}</Dropdown.Item> */}
                                    <Dropdown.Item onClick={() => this.redirectTo('import')}>{t('Import')}</Dropdown.Item>
                                    {/* <Dropdown.Item onClick={() => this.redirectTo('admin_dashboard')}>{t('Admin Dashoard')}</Dropdown.Item> */}
                                </Dropdown.Menu>
                            </Dropdown>
                            : null}
                        <Nav.Link href={loginUrl}>{t('Sign Out')} <FontAwesome name="sign-out" /></Nav.Link>
                    </Navbar.Collapse>
                </Row>
            </Navbar>
        );
    }
};

export default Header;