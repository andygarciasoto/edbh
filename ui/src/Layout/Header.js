import React from 'react';
import './Header.scss';
import logo from '../Parker_Hannifin.svg';
import { Row, Col } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import MegaMenu from  './MegaMenu';

class Header extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            megaMenuToggle: 'dropdown-content'
        } 
        this.openMenu = this.openMenu.bind(this);
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
                                <a className="header-item" href="#" id="log-out">Log Out <FontAwesome name="sign-out"/></a>
                                <a className="header-item" onClick={(e)=>this.openMenu(e)} href="#" id="mega-menu">Menu <FontAwesome onClick={(e)=>this.openMenu(e)}name="bars"/>
                                <MegaMenu toggle={this.state.megaMenuToggle} />
                                </a>
                            </div>
                        </Col>
                    </Row>
            </nav>
        );
    }
};

export default Header;