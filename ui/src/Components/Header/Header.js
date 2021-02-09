import React from 'react';
import { Navbar, Nav, Dropdown } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome';
import logo from '../../resources/Parker_Hannifin.svg';
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
import { getCurrentShift, getResponseFromGeneric, assignValuesToUser, getCurrentTime, validPermission } from '../../Utils/Requests';
import { API } from '../../Utils/Constants';
import $ from 'jquery';
import configuration from '../../config.json';
import '../../sass/Header.scss';


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
        let { search } = qs.parse(this.props.history.location.search);
        let queryItem = Object.assign({}, search);
        if (page !== 'dashboard' || page !== 'summary') {
            const newUrl = configuration['root'] + `/${page}${this.props.history.location.search}`;
            window.location.href = newUrl;
        } else {
            queryItem["mc"] = this.state.mc;
            queryItem["dt"] = moment(this.state.dt).format('YYYY/MM/DD HH:mm');
            queryItem["sf"] = this.state.sf;
            queryItem["ln"] = this.state.ln;
            queryItem["tp"] = this.state.tp;
            queryItem["cs"] = this.state.cs;
            let parameters = $.param(queryItem);
            this.props.history.push(`${page}?${parameters}`);
        }
    }

    openMenu = (e) => {
        validPermission(this.props.user, 'megamenu', 'read') ?
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
            site_id: newSite.Site,
            badge: newSite.Badge,
            site: newSite.Site,
            clock_number: newSite.Badge
        };

        let res = await getResponseFromGeneric('get', API, '/find_user_information', {}, parameters, {}) || [];
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

    logOff = async () => {

        const user = this.props.user;

        if (user.role === 'Operator') {
            this.props.displayModalLogOff(true);
        } else {

            const data = {
                badge: user.clock_number,
                first_name: user.first_name,
                last_name: user.last_name,
                asset_id: 230,
                timestamp: getCurrentTime(user.timezone),
                reason: 'Check-Out',
                status: 'Inactive',
                site_id: user.site,
                break_minutes: 0,
                lunch_minutes: 0
            };

            let res = await getResponseFromGeneric('put', API, '/new_scan', {}, {}, data);
            if (res.status !== 200) {
                console.log('Error when try to logOff');
            } else {
                console.log('Success LogOff');
                // remove stored data
                localStorage.removeItem('accessToken');
                localStorage.removeItem('st');
                // Redirect to login
                window.location.replace(configuration['root']);
            }
        }
    }

    render() {

        const customToogle = React.forwardRef(({ children, onClick }, ref) => (
            <a className='nav-link' href='/' ref={ref} onClick={e => { e.preventDefault(); onClick(e); }}>{children}&nbsp;<FontAwesome name='bars' /></a>
        ));

        const customToogleSite = React.forwardRef(({ children, onClick }, ref) => (
            <a className='nav-link' href='/' ref={ref} onClick={e => { e.preventDefault(); onClick(e); }}>{children}&nbsp;<FontAwesome name="building" /></a>
        ));

        return (
            <Navbar expand="lg">
                <Navbar.Brand><img src={logo} className="App-logo-header header-side" alt="logo" /></Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse className="justify-content-end">
                    {validPermission(this.props.user, 'site-menu', 'read') ?
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
                        : null}
                    {validPermission(this.props.user, 'megamenu', 'read') ?
                        <span>
                            <Nav.Link onClick={(e) => this.openMenu(e)}>{this.props.t('Parameters')} <FontAwesome name="filter" />
                            </Nav.Link>
                            <MegaMenu toggle={this.state.megaMenuToggle} t={this.props.t} history={this.props.history}>
                                {validPermission(this.props.user, 'megamenu-machine-option', 'read') ?
                                    <MachinePickerCustom
                                        collectInput={this.collectInputs}
                                        t={this.props.t}
                                        user={this.props.user}
                                        value={this.state.mc}
                                        history={this.props.history}
                                        key={0} />
                                    : null}
                                {validPermission(this.props.user, 'megamenu-date-option', 'read') ?
                                    <DatePickerCustom
                                        collectInput={this.collectInputs}
                                        value={this.state.dt}
                                        key={1}
                                    />
                                    : null}
                                {validPermission(this.props.user, 'megamenu-shift-option', 'read') && this.props.history.location.pathname !== '/summary' ?
                                    <ShiftPickerCustom
                                        collectInput={this.collectInputs}
                                        t={this.props.t}
                                        value={this.state.sf}
                                        date={this.state.dt}
                                        user={this.props.user}
                                        key={2}
                                    />
                                    : null}
                                {validPermission(this.props.user, 'megamenu-language-option', 'read') ?
                                    <LanguagePickerCustom
                                        collectInput={this.collectInputs}
                                        value={this.state.ln}
                                        key={3}
                                    />
                                    : null}
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
                                    changeLanguageBrowser={this.changeLanguageBrowser}
                                />
                            </MegaMenu>
                        </span>
                        : null}
                    {validPermission(this.props.user, 'neworder', 'read') ?
                        ((this.state.tp) && (this.state.tp) !== '' && (this.state.tp === 'Manual' || this.state.tp === 'Partially_Manual_Scan_Order')) ?
                            <Nav.Link onClick={() => this.props.openModal(true)}>{this.props.t('New Order')} <FontAwesome name="file-text" />
                            </Nav.Link>
                            : null : null
                    }
                    {validPermission(this.props.user, 'menu', 'read') ?
                        <Dropdown className="customToogle">
                            <Dropdown.Toggle as={customToogle} id="dropdown-basic">
                                {this.props.t('Menu')}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {this.props.history.location.pathname !== '/dashboard' && validPermission(this.props.user, 'menu-dashboard', 'read') ? <Dropdown.Item onClick={() => this.redirectTo('dashboard')}>{this.props.t('Dashboard')}</Dropdown.Item> : null}
                                {this.props.history.location.pathname !== '/import' && validPermission(this.props.user, 'menu-import', 'read') ? <Dropdown.Item onClick={() => this.redirectTo('import')}>{this.props.t('Import/Export')}</Dropdown.Item> : null}
                                {this.props.history.location.pathname !== '/summary' && validPermission(this.props.user, 'menu-summary', 'read') ? <Dropdown.Item onClick={() => this.redirectTo('summary')}>{this.props.t('Summary Dashoard')}</Dropdown.Item> : null}
                                {this.props.history.location.pathname !== '/digitalcups' && validPermission(this.props.user, 'menu-digitalcups', 'read') ? <Dropdown.Item onClick={() => this.redirectTo('digitalcups')}>{this.props.t('Digital Cups')}</Dropdown.Item> : null}
                            </Dropdown.Menu>
                        </Dropdown>
                        : null}
                    <Nav.Link onClick={() => this.props.displayModalLogOff(true)}>{this.props.t('Sign Out')} <FontAwesome name="sign-out" /></Nav.Link>
                </Navbar.Collapse>
            </Navbar>
        )
    }
}

export default Header;