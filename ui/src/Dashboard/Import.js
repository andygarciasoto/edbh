import React from 'react';
import logo from '../Parker_Hannifin.svg';
import {Row, Col} from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import { Link } from 'react-router-dom';
import '../Layout/Header.scss';
import _ from 'lodash';

class Import extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.onFileChange = this.onFileChange.bind(this);
    };

    componentDidMount() {
        this["_isMounted"] = true;
    }

    componentWillUnmount() {
        this["_isMounted"] = false;
    }

    onFileChange(file) {
        console.log(file)
    }


render() {
    const t = this.props.t;
    return (
        <div className="wrapper-main-import" style={{height: '100vh'}}>
            <nav className="navbar app-header" >
                <Row className={'row'}>
                    <Col className={'col'} md={3} lg={3}><img src={logo} className="App-logo header-side" alt="logo" /></Col>
                    <Col className={'col'} md={9} lg={9}>
                        <div className="links header-side">
                            <span className="header-item header-elem" href="#" id="log-out"><Link to="/">{t('Sign Out')} <FontAwesome name="sign-out" /></Link></span>
                        </div>
                    </Col>
                </Row>
            </nav>
            <div className="import-wrapper">
                <h4 style={{marginBottom:'20px'}}>{t('Data Import Tool')}</h4>
            <div id="UploadFile" className="">
                <div className="">
                    <div className="">
                        <input type="file" name="Open File" id="" style={{ fontWeight: 'bold' }} onChange={this.onFileChange} />
                    </div>
                </div>
            </div>
        </div>
    </div>)
    }

};

export default Import;