import React from 'react';
import './Header.scss';
import logo from '../Parker_Hannifin.svg';
import { Container, Row, Col } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';

class Header extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
        } 
    }  

    render() {
        return (
            <nav className="navbar">
                    <Row className={'row'}>
                        <Col className={'col'} md={3} lg={3}><img src={logo} className="App-logo header-side" alt="logo"/></Col>
                        <Col className={'col'} md={9} lg={9}> 
                            <div className="links header-side">
                                {/* <a href="/html/">Another Dashboard</a> */}
                                <a href="/html/" id="log-out">Log Out <FontAwesome name="sign-out"/></a>
                            </div>
                        </Col>
                    </Row>
            </nav>
        );
    }
};

export default Header;