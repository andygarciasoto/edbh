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
import { isComponentValid } from '../Utils/Requests';
import { Link } from 'react-router-dom';


class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            megaMenuToggle: 'dropdown-content',
            machineValue: props.selectedMachine || props.t('Select Machine'),
            dateValue: new Date(props.selectedDate),
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
            dateValue: new Date(nextProps.selectedDate),
            shiftValue: nextProps.selectedShift || nextProps.t('Select Shift'),
            languageValue: nextProps.selectedLanguage || nextProps.t('Select Language'),
        })
    }

    onScroll() {
        this.setState({ megaMenuToggle: 'dropdown-content' });
    }

    render() {
        const t = this.props.t;
        return (
            <nav className="navbar">
                <Row className={'row'}>
                    <Col className={'col'} md={3} lg={3}><img src={logo} className="App-logo header-side" alt="logo" /></Col>
                    <Col className={'col'} md={9} lg={9}>
                        <div className="links header-side">
                            <span className="header-item header-elem" href="#" id="log-out"><Link to="/">{t('Sign Out')} <FontAwesome name="sign-out" /></Link></span>
                            <span className="header-item" href="#" id="mega-menu"><span className="header-elem" onClick={(e) => this.openMenu(e)}>{t('Menu')}&nbsp;</span>
                                <FontAwesome
                                    onClick={(e) => this.openMenu(e)}
                                    name="bars" />
                                <MegaMenu toggle={this.state.megaMenuToggle} t={t}>
                                    <MachinePickerCustom
                                        collectInput={this.collectInputs}
                                        t={t}
                                        value={this.state.machineValue} />
                                    <DatePickerCustom
                                        collectInput={this.collectInputs}
                                        value={this.state.dateValue} />
                                    <ShiftPickerCustom
                                        collectInput={this.collectInputs}
                                        t={t}
                                        value={this.state.shiftValue} />
                                    <LanguagePickerCustom
                                        collectInput={this.collectInputs}
                                        value={this.state.languageValue} />
                                    <QueryButton
                                        machine={this.state.machineValue}
                                        date={this.state.dateValue}
                                        shift={this.state.shiftValue}
                                        language={this.state.languageValue}
                                        changeLanguageBrowser={this.props.changeLanguageBrowser}
                                        openMenu={this.openMenu}
                                        search={this.props.search}
                                        history={this.props.history}
                                        t={t}
                                    />
                                </MegaMenu>
                            </span>
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
                                    name="file-text" /></span>
                        </div>
                    </Col>
                </Row>
            </nav>
        );
    }
};

export default Header;