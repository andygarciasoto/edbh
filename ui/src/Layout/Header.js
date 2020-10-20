import React from 'react';
import './Header.scss';
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
import _ from 'lodash';
import { getCurrentShift, getResponseFromGeneric, assignValuesToUser } from '../Utils/Requests';
import { API } from '../Utils/Constants';


class Header extends React.Component {

    constructor(props) {
        super(props);
        this.state = Object.assign(this.getInitialState(props));
        if (this.state.ln) {
            this.changeLanguageBrowser();
        }
    }

    getInitialState(props) {
        let search = qs.parse(props.history.location.search);
        return {
            megaMenuToggle: 'dropdown-content',
            mc: search.mc || props.machineData.asset_code,
            tp: search.tp || props.machineData.automation_level,
            dt: search.dt ? new Date(moment(search.dt).format('YYYY/MM/DD HH:mm')) : (props.user.date_of_shift ? new Date(props.user.date_of_shift) : new Date(getCurrentTime(props.user.timezone))),
            sf: search.sf || props.user.current_shift,
            ln: search.ln || props.user.language,
            cs: search.cs || props.user.site
        };
    }

    componentDidMount() {
        window.addEventListener('scroll', this.onScroll);
        if (Number(this.state.cs) !== Number(this.props.user.site)) {
            let actualSite = _.find(this.props.user.sites, ['Site', parseInt(this.state.cs)]);
            this.changeUserInformation(actualSite);
        }
    }

    componentWillReceiveProps(nextProps) {
        let search = qs.parse(nextProps.history.location.search);
        this.setState({
            mc: search.mc || nextProps.machineData.asset_code,
            tp: search.tp || nextProps.machineData.automation_level,
            dt: search.dt ? new Date(moment(search.dt).format('YYYY/MM/DD HH:mm')) : (nextProps.user.date_of_shift ? new Date(nextProps.user.date_of_shift) : new Date(getCurrentTime(nextProps.user.timezone))),
            sf: search.sf || nextProps.user.current_shift,
            ln: search.ln || nextProps.user.language,
            cs: search.cs || nextProps.user.site
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

    getSiteOptions() {
        let options = [];
        _.forEach(this.props.user.sites, site => {
            options.push(<Dropdown.Item onClick={() => this.changeSite(site)} key={site.Site}>{site.asset_name}</Dropdown.Item>);
        });

        return options;
    }

    changeSite(site) {
        if (Number(this.state.cs) !== Number(site.asset_id)) {
            this.setState({ cs: site.asset_id }, () => { this.changeUserInformation(site) });

        }
    }

    async changeUserInformation(newSite) {
        let user = this.props.user;

        const parameters = {
            site: newSite.Site,
            user_id: newSite.id
        };

        let res = await getResponseFromGeneric('get', API, '/user_info_login_by_site', {}, parameters, {}) || [];
        let newUserValues = res[0] || {};
        user = assignValuesToUser(user, newUserValues);

        user.shifts = await getResponseFromGeneric('get', API, '/shifts', {}, parameters, {}) || [];
        user.machines = await getResponseFromGeneric('get', API, '/machine', {}, parameters, {}) || [];
        user.uoms = await getResponseFromGeneric('get', API, '/uom_by_site', {}, parameters, {}) || [];

        if (!user.shift_id) {
            let currentShiftInfo = getCurrentShift(user.shifts, user.current_date_time);
            user.date_of_shift = currentShiftInfo.date_of_shift;
            user.current_shift = currentShiftInfo.current_shift;
            user.shift_id = currentShiftInfo.shift_id;
        }

        let search = qs.parse(this.props.history.location.search);
        let ln = search.ln;

        this.props.changeCurrentUser(user);
        await this.props.history.push(`${this.props.history.location.pathname}?cs=${newSite.asset_id}${ln ? ('&&ln=' + ln) : ''}`);
    }

    render() {

        const customToogle = React.forwardRef(({ children, onClick }, ref) => (
            <a className='nav-link' href='/' ref={ref} onClick={e => { e.preventDefault(); onClick(e); }}>{children}&nbsp;<FontAwesome name='bars' /></a>
        ));

        const customToogleSite = React.forwardRef(({ children, onClick }, ref) => (
            <a className='nav-link' href='/' ref={ref} onClick={e => { e.preventDefault(); onClick(e); }}>{children}&nbsp;<FontAwesome name="building" /></a>
        ));

        const station = localStorage.getItem('st');
        const loginUrl = `/?st=${station}`;

        return (
            <Navbar>
                <Row>
                    <Navbar.Brand><img src={logo} className="App-logo header-side" alt="logo" /></Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse className="justify-content-end">
                        <Dropdown className="customToogleSite">
                            <Dropdown.Toggle as={customToogleSite} id="dropdown-basic">
                                {this.props.t('Site') + ': ' + _.find(this.props.user.sites, ['Site', parseInt(this.state.cs)]).asset_name}
                            </Dropdown.Toggle>
                            {this.props.user.sites.length > 1 ?
                                <Dropdown.Menu>
                                    {this.getSiteOptions()}
                                </Dropdown.Menu>
                                : null}
                        </Dropdown>
                        {isComponentValid(this.props.user.role, 'megamenu') ?
                            <span>
                                <Nav.Link onClick={(e) => this.openMenu(e)}>{this.props.t('Parameters')} <FontAwesome name="filter" />
                                </Nav.Link>
                                <MegaMenu toggle={this.state.megaMenuToggle} t={this.props.t} history={this.props.history}>
                                    <MachinePickerCustom
                                        collectInput={this.collectInputs}
                                        t={this.props.t}
                                        user={this.props.user}
                                        value={this.state.mc}
                                        history={this.props.history} />
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
                                        site={this.state.cs}
                                        openMenu={this.openMenu}
                                        history={this.props.history}
                                        t={this.props.t}
                                        changeLanguageBrowser={this.changeLanguageBrowser} />
                                </MegaMenu>
                            </span>
                            : null}
                        {isComponentValid(this.props.user.role, 'neworder') && this.props.history.location.pathname !== '/summary' ?
                            ((this.state.tp) && (this.state.tp) !== '' && (this.state.tp === 'Manual')) ?
                                <Nav.Link onClick={() => this.props.openModal(true)}>{this.props.t('New Order')} <FontAwesome name="file-text" />
                                </Nav.Link>
                                : null : null
                        }
                        {isComponentValid(this.props.user.role, 'menu') ?
                            <Dropdown className="customToogle">
                                <Dropdown.Toggle as={customToogle} id="dropdown-basic">
                                    {this.props.t('Menu')}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {this.props.history.location.pathname !== '/dashboard' && isComponentValid(this.props.user.role, 'menu-dashbaord') ? <Dropdown.Item onClick={() => this.redirectTo('dashboard')}>{this.props.t('Dashboard')}</Dropdown.Item> : null}
                                    {this.props.history.location.pathname !== '/import' && isComponentValid(this.props.user.role, 'menu-import') ? <Dropdown.Item onClick={() => this.redirectTo('import')}>{this.props.t('Import/Export')}</Dropdown.Item> : null}
                                    {this.props.history.location.pathname !== '/summary' && isComponentValid(this.props.user.role, 'menu-summary') ? <Dropdown.Item onClick={() => this.redirectTo('summary')}>{this.props.t('Summary Dashoard')}</Dropdown.Item> : null}
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

export default Header;