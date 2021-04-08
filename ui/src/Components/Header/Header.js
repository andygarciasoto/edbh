import React from 'react';
import { Navbar, Nav, Dropdown } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome';
import logo from '../../resources/Parker_Hannifin.svg';
import MegaMenu from './MegaMenu';
import MachinePickerCustom from './MachinePicker';
import DatePickerCustom from './DatePicker';
import ShiftPickerCustom from './ShiftPicker';
import LanguagePickerCustom from './LanguagePicker';
import GenericSelect from './GenericSelect';
import QueryButton from './QueryButton';
import * as qs from 'query-string';
import moment from 'moment';
import i18next from 'i18next';
import _ from 'lodash';
import { getCurrentTime, validPermission, validMenuOption } from '../../Utils/Requests';
import {
    getLevelOptions,
    getAreaAssetOptionsDC,
    getWorkcellOptionsDC,
    getWorkcellValueOptionsDC
} from '../../Utils/Utils';
import configuration from '../../config.json';
import '../../sass/Header.scss';


class Header extends React.Component {

    constructor(props) {
        super(props);
        this.state = Object.assign(this.getInitialState(props), this.getDCFilters(props));
        if (this.state.ln) {
            this.changeLanguageBrowser();
        }
    }

    getInitialState(props) {
        const search = qs.parse(props.history.location.search);
        return {
            search,
            megaMenuToggle: 'dropdown-content',
            mc: search.mc || props.machineData.asset_code,
            tp: search.tp || props.machineData.automation_level,
            dt: search.dt ? new Date(moment(search.dt).format('YYYY/MM/DD HH:mm')) : (props.user.date_of_shift ? new Date(props.user.date_of_shift) : new Date(getCurrentTime(props.user.timezone))),
            sf: search.sf || props.user.current_shift,
            ln: search.ln || props.user.language,
            cs: search.cs || props.user.site,
            sldc: search.sldc || 'Site',
            sadc: search.sadc || ''
        };
    }

    getDCFilters(props) {
        const search = qs.parse(props.history.location.search);
        const sldc = search.sldc || 'Site';
        const levelOptionsDC = getLevelOptions();
        const assetOptionsDC = getAreaAssetOptionsDC(props.user);
        const workcellOptionsDC = getWorkcellOptionsDC(props.user);
        const valueStreamOptionsDC = getWorkcellValueOptionsDC('value_stream', props.user);
        const sadc = search.sadc || '';
        const selectedAssetDC = sadc !== '' ?
            (_.find(sldc === 'Area' ? assetOptionsDC : (sldc === 'workcell_name' ? workcellOptionsDC : valueStreamOptionsDC),
                item => { return String(item.value) === sadc; }))
            : { label: 'No Data', value: 'No Data' };
        return {
            selectedLevelDC: _.find(levelOptionsDC, { value: sldc }),
            levelOptionsDC,
            selectedAssetDC,
            assetOptionsDC,
            workcellOptionsDC,
            valueStreamOptionsDC
        }
    }

    componentDidMount() {
        window.addEventListener('scroll', this.onScroll);
        if (Number(this.state.cs) !== Number(this.props.user.site)) {
            let actualSite = _.find(this.props.user.sites, ['Site', parseInt(this.state.cs)]);
            this.changeUserInformation(actualSite);
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const search = qs.parse(nextProps.history.location.search);
        const mc = search.mc || nextProps.machineData.asset_code;
        const tp = search.tp || nextProps.machineData.automation_level;
        const dt = search.dt ? new Date(moment(search.dt).format('YYYY/MM/DD HH:mm')) :
            (nextProps.user.date_of_shift ? new Date(nextProps.user.date_of_shift) :
                new Date(getCurrentTime(nextProps.user.timezone)));
        const sf = search.sf || nextProps.user.current_shift;
        const ln = search.ln || nextProps.user.language;
        const cs = search.cs || nextProps.user.site;
        if (!_.isEqual(search, prevState.search)) {
            return {
                search,
                mc,
                tp,
                dt,
                sf,
                ln,
                cs
            };
        }
        return null;
    }

    redirectTo = (page) => {
        let search = this.props.history.location.search;
        if (page !== 'dashboard' || page !== 'summary') {
            const newUrl = configuration['root'] + `/${page}${search}`;
            window.location.href = newUrl;
        } else {
            this.props.history.push(`${page}?${search}`);
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

    collectLevelChange = (value, type) => {
        this.setState({
            [type]: value,
            selectedAssetDC: { label: 'No Data', value: 'No Data' }
        });
    }

    changeLanguageBrowser = () => {
        let currentLanguage = this.state.ln.toLowerCase();
        currentLanguage = currentLanguage.replace('-', '_');
        i18next.changeLanguage(currentLanguage);
    }

    getSiteOptions() {
        let options = [];
        _.forEach(this.props.user.sites, site => {
            options.push(<Dropdown.Item id={'siteOption-' + site.asset_code} onClick={() => this.changeSite(site)} key={site.Site}>{site.asset_name}</Dropdown.Item>);
        });
        return options;
    }

    changeSite(site) {
        if (Number(this.state.cs) !== Number(site.asset_id)) {
            const search = qs.parse(this.props.history.location.search);
            const ln = search.ln || this.props.user.language;
            const newUrl = configuration['root'] + `${this.props.history.location.pathname}?cs=${site.asset_id}${ln ? ('&ln=' + ln) : ''}`;
            window.location.href = newUrl;

        }
    }

    logOff = () => {

        const user = this.props.user;
        const asset = _.find(user.machines, { asset_code: this.state.mc });

        if (user.role === 'Operator' && asset && asset.is_multiple) {
            this.props.displayModalLogOff(true);
        } else {
            console.log('Success LogOff');
            // remove stored data
            localStorage.removeItem('accessToken');
            localStorage.removeItem('st');
            // Redirect to login
            window.location.replace(configuration['root']);
        }
    }

    render() {

        const customToogle = React.forwardRef(({ children, onClick }, ref) => (
            <a className='nav-link' href='/' ref={ref} onClick={e => { e.preventDefault(); onClick(e); }}>{children}&nbsp;<FontAwesome name='bars' /></a>
        ));

        const customToogleSite = React.forwardRef(({ children, onClick }, ref) => (
            <a className='nav-link' href='/' ref={ref} onClick={e => { e.preventDefault(); onClick(e); }}>{children}&nbsp;<FontAwesome name="building" /></a>
        ));

        const actualView = this.props.history.location.pathname;
        const selectionValue = this.state.selectedLevelDC.value;
        const selectedAssetOptions = selectionValue === 'Area' ? this.state.assetOptionsDC :
            (selectionValue === 'workcell_name' ? this.state.workcellOptionsDC : this.state.valueStreamOptionsDC);

        return (
            <Navbar expand="lg">
                <Navbar.Brand><img src={logo} className="App-logo-header header-side" alt="logo" /></Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse className="justify-content-end">
                    {validPermission(this.props.user, 'site-menu', 'read') ?
                        <Dropdown id='siteDropdownId' className='customToogleSite'>
                            <Dropdown.Toggle as={customToogleSite}>
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
                            <Nav.Link id='megaMenuId' onClick={(e) => this.openMenu(e)}>{this.props.t('Parameters')} <FontAwesome name="filter" />
                            </Nav.Link>
                            <MegaMenu toggle={this.state.megaMenuToggle} t={this.props.t} history={this.props.history} selectedLevelDC={this.state.selectedLevelDC}>
                                {validMenuOption('megamenu-level-option', actualView) ?
                                    <GenericSelect
                                        selectedOption={this.state.selectedLevelDC}
                                        collectInput={this.collectLevelChange}
                                        t={this.props.t}
                                        value={'selectedLevelDC'}
                                        prop={'value'}
                                        prop_name={'label'}
                                        options={this.state.levelOptionsDC}
                                        key={0} />
                                    : null}
                                {validPermission(this.props.user, 'megamenu-machine-option', 'read') && validMenuOption('megamenu-machine-option', actualView) ?
                                    <MachinePickerCustom
                                        id='assetHeaderButton'
                                        collectInput={this.collectInputs}
                                        t={this.props.t}
                                        user={this.props.user}
                                        value={this.state.mc}
                                        history={this.props.history}
                                        key={1} />
                                    : null}
                                {validPermission(this.props.user, 'megamenu-date-option', 'read') && validMenuOption('megamenu-date-option', actualView) ?
                                    <DatePickerCustom
                                        collectInput={this.collectInputs}
                                        value={this.state.dt}
                                        key={2}
                                    />
                                    : null}
                                {validPermission(this.props.user, 'megamenu-shift-option', 'read') && validMenuOption('megamenu-shift-option', actualView) ?
                                    <ShiftPickerCustom
                                        collectInput={this.collectInputs}
                                        t={this.props.t}
                                        value={this.state.sf}
                                        date={this.state.dt}
                                        user={this.props.user}
                                        key={3}
                                    />
                                    : null}
                                {validPermission(this.props.user, 'megamenu-language-option', 'read') && validMenuOption('megamenu-language-option', actualView) ?
                                    <LanguagePickerCustom
                                        collectInput={this.collectInputs}
                                        value={this.state.ln}
                                        key={4}
                                    />
                                    : null}
                                {validMenuOption('megamenu-area-option', actualView) && selectionValue !== 'Site' ?
                                    <GenericSelect
                                        selectedOption={this.state.selectedAssetDC}
                                        collectInput={this.collectInputs}
                                        t={this.props.t}
                                        value={'selectedAssetDC'}
                                        prop={'value'}
                                        prop_name={'label'}
                                        options={selectedAssetOptions}
                                        key={5} />
                                    : null}
                                <QueryButton
                                    machine={this.state.mc}
                                    date={this.state.dt}
                                    shift={this.state.sf}
                                    machine_type={this.state.tp}
                                    language={this.state.ln}
                                    site={this.state.cs}
                                    selectedLevelDC={validMenuOption('megamenu-level-option', actualView) ? selectionValue : null}
                                    selectedAssetDC={this.state.selectedAssetDC}
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
                            <Nav.Link onClick={() => this.props.displayOrderModal(true)}>{this.props.t('New Order')} <FontAwesome name="file-text" />
                            </Nav.Link>
                            : null : null
                    }
                    {validPermission(this.props.user, 'menu', 'read') ?
                        <Dropdown id='menuOptionsId' className='customToogle'>
                            <Dropdown.Toggle as={customToogle}>
                                {this.props.t('Menu')}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {this.props.history.location.pathname !== '/dashboard' && validPermission(this.props.user, 'menu-dashboard', 'read') ? <Dropdown.Item onClick={() => this.redirectTo('dashboard')}>{this.props.t('Dashboard')}</Dropdown.Item> : null}
                                {this.props.history.location.pathname !== '/import' && validPermission(this.props.user, 'menu-import', 'read') ? <Dropdown.Item onClick={() => this.redirectTo('import')}>{this.props.t('Site Administration')}</Dropdown.Item> : null}
                                {this.props.history.location.pathname !== '/summary' && validPermission(this.props.user, 'menu-summary', 'read') ? <Dropdown.Item onClick={() => this.redirectTo('summary')}>{this.props.t('Summary Dashoard')}</Dropdown.Item> : null}
                                {this.props.history.location.pathname !== '/digitalcups' && validPermission(this.props.user, 'menu-digitalcups', 'read') ? <Dropdown.Item onClick={() => this.redirectTo('digitalcups')}>{this.props.t('Digital Cups')}</Dropdown.Item> : null}
                            </Dropdown.Menu>
                        </Dropdown>
                        : null}
                    <Nav.Link id='LogoutLink' onClick={() => this.logOff()}>{this.props.t('Sign Out')} <FontAwesome name="sign-out" /></Nav.Link>
                </Navbar.Collapse>
            </Navbar>
        )
    }
}

export default Header;