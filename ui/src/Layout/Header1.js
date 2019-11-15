import React from 'react';
import './Header1.scss';
import { Navbar, Nav, Dropdown, Row } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome';
import logo from '../Parker_Hannifin.svg';
import { isComponentValid, getCurrentTime } from '../Utils/Requests';
import MegaMenu from './MegaMenu';
import MachinePickerCustom from './MachinePicker';
import DatePickerCustom from './DatePicker';
import ShiftPickerCustom from './ShiftPicker';
import LanguagePickerCustom from './LanguagePicker';
import QueryButton from './QueryButton';
import * as qs from 'query-string';
import moment from 'moment';
import i18next from 'i18next';
import config from '../config.json';

class Header1 extends React.Component {

    constructor(props) {
        super(props);
        this.state = Object.assign(this.getInitialState(props));
        if (this.state.ln) {
            this.changeLanguageBrowser();
        }
    }

    getInitialState(props) {
        let search = qs.parse(props.history.location.search);
        var hour = moment(getCurrentTime()).hours();
        let shiftByHour;
        if (hour >= 7 && hour < 15) {
            shiftByHour = '1st Shift';
        } else if (hour >= 15 && hour < 23) {
            shiftByHour = '2nd Shift';
        } else {
            shiftByHour = '3rd Shift';
        }
        return {
            megaMenuToggle: 'dropdown-content',
            mc: search.mc,
            tp: search.tp,
            dt: search.dt ? new Date(moment(search.dt).format('YYYY/MM/DD HH:mm')) : new Date(getCurrentTime()),
            sf: search.sf || shiftByHour,
            ln: search.ln || config['language']
        };
    }

    componentDidMount() {
        window.addEventListener('scroll', this.onScroll);
    }

    componentWillReceiveProps(nextProps) {
        let search = qs.parse(nextProps.history.location.search);
        var hour = moment(getCurrentTime()).hours();
        let shiftByHour;
        if (hour >= 7 && hour < 15) {
            shiftByHour = '1st Shift';
        } else if (hour >= 15 && hour < 23) {
            shiftByHour = '2nd Shift';
        } else {
            shiftByHour = '3rd Shift';
        }
        this.setState({
            mc: search.mc,
            tp: search.tp,
            dt: search.dt ? new Date(moment(search.dt).format('YYYY/MM/DD HH:mm')) : new Date(getCurrentTime()),
            sf: search.sf || shiftByHour,
            ln: search.ln || config['language']
        });
    }

    redirectTo = (page) => {
        this.props.history.push(`${page}${this.props.history.location.search}`);
    }

    openMenu = (e) => {
        isComponentValid(this.props.user.role, 'megamenu') ?
            this.state.megaMenuToggle === 'dropdown-content opened' ?
                this.setState({ megaMenuToggle: 'dropdown-content' }) :
                this.setState({ megaMenuToggle: 'dropdown-content opened' }) : void (0);
    }

    onScroll = () => {
        this.setState({ megaMenuToggle: 'dropdown-content' });
    }

    collectInputs = (value, type) => {
        this.setState({ [type]: value });
    }

    changeLanguageBrowser = () => {
        let currentLanguage = this.state.ln.toLowerCase();
        currentLanguage = currentLanguage.replace('-', '_');
        i18next.changeLanguage(currentLanguage);
    }

    render() {

        const customToogle = React.forwardRef(({ children, onClick }, ref) => (
            <a className='nav-link' href='#' ref={ref} onClick={e => { e.preventDefault(); onClick(e); }}>{children}&nbsp;<FontAwesome name='bars' /></a>
        ));

        const station = localStorage.getItem('machine_name');
        const loginUrl = `/?st=${station}`;

        return (
            <Navbar>
                <Row>
                    <Navbar.Brand><img src={logo} className="App-logo header-side" alt="logo" /></Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse className="justify-content-end">
                        {isComponentValid(this.props.user.role, 'megamenu') ?
                            <span>
                                <Nav.Link onClick={(e) => this.openMenu(e)}>{this.props.t('Parameters')} <FontAwesome name="filter" />
                                </Nav.Link>
                                <MegaMenu toggle={this.state.megaMenuToggle} t={this.props.t} history={this.props.history}>
                                    <MachinePickerCustom
                                        collectInput={this.collectInputs}
                                        t={this.props.t}
                                        user={this.props.user}
                                        value={this.state.mc} />
                                    <DatePickerCustom
                                        collectInput={this.collectInputs}
                                        value={this.state.dt}
                                    />
                                    {this.props.history.location.pathname !== '/summary' ?
                                        <ShiftPickerCustom
                                            collectInput={this.collectInputs}
                                            t={this.props.t}
                                            value={this.state.sf}
                                            date={this.state.dt}
                                            user={this.props.user}
                                        />
                                        : null}
                                    <LanguagePickerCustom
                                        collectInput={this.collectInputs}
                                        value={this.state.ln} />
                                    <QueryButton
                                        machine={this.state.mc}
                                        date={this.state.dt}
                                        shift={this.state.sf}
                                        machine_type={this.state.tp}
                                        language={this.state.ln}
                                        openMenu={this.openMenu}
                                        history={this.props.history}
                                        t={this.props.t}
                                        changeLanguageBrowser={this.changeLanguageBrowser} />
                                </MegaMenu>
                            </span>
                            : null}
                        {isComponentValid(this.props.user.role, 'menu') ?
                            <Dropdown className="customToogle">
                                <Dropdown.Toggle as={customToogle} id="dropdown-basic">
                                    {this.props.t('Menu')}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {this.props.history.location.pathname !== '/dashboard' ? <Dropdown.Item onClick={() => this.redirectTo('dashboard')}>{this.props.t('Dashboard')}</Dropdown.Item> : null}
                                    {this.props.history.location.pathname !== '/import' ? <Dropdown.Item onClick={() => this.redirectTo('import')}>{this.props.t('Import')}</Dropdown.Item> : null}
                                    {this.props.history.location.pathname !== '/summary' ? <Dropdown.Item onClick={() => this.redirectTo('summary')}>{this.props.t('Summary Dashoard')}</Dropdown.Item> : null}
                                </Dropdown.Menu>
                            </Dropdown>
                            : null}
                        <Nav.Link href={loginUrl}>{this.props.t('Sign Out')} <FontAwesome name="sign-out" /></Nav.Link>
                    </Navbar.Collapse>
                </Row>
            </Navbar>
        )
    }
}

export default Header1;