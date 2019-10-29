import React from 'react';
import logo from '../Parker_Hannifin.svg';
import { Row, Col, Button } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import { Link } from 'react-router-dom';
import '../Layout/Header.scss';
import { sendPutDataTool } from '../Utils/Requests';
import _ from 'lodash';

class Import extends React.Component {
    constructor(props) {
        super(props);
        this.state = Object.assign(this.getInitialState(props), this.getTranslations(props));
    };

    getInitialState(props) {
        return {
            file: {},
            message: '',
            isLoading: false,
            showActionMessage: false,
            error: false
        };
    }

    getTranslations(props) {
        return {
            signOutText: props.t('Sign Out'),
            dataToolText: props.t('Data Tool'),
            dataToolImportText: props.t('Data Import Tool'),
            backText: props.t('Back'),
            importText: props.t('Import'),
            importingText: props.t('Importing...'),
            successImportMessage: props.t('Configuration Imported Successfully'),
            warningImportMessage: props.t('Fail, Configuration not Imported')
        };
    }

    componentDidMount() {
        this["_isMounted"] = true;
    }

    componentWillUnmount() {
        this["_isMounted"] = false;
    }

    onFileChange = (event) => {
        var file = event.target.files[0];
        this.setState({ file: file });
    }

    goBack = () => {
        this.props.history.goBack();
    }

    onSubmit = () => {
        let _this = this;
        this.setState({ isLoading: true }, () => {
            const response = sendPutDataTool({
                file: _this.state.file
            }, '/import_asset')
            response.then((res) => {
                if (res !== 200 || !res) {
                    _this.setState({ isLoading: false, showActionMessage: true, error: false })
                } else {
                    _this.setState({ isLoading: false, showActionMessage: true, error: true })
                }
            })
        });
    }


    render() {
        return (
            <div className="wrapper-main-import" style={{ height: '100vh' }}>
                <nav className="navbar app-header" >
                    <Row className={'row'}>
                        <Col className={'col'} md={2} lg={1} style={{ paddingRight: '0px' }}><img src={logo} className="App-logo header-side" alt="logo" /></Col>
                        <Col className={'col no-padding'} md={1} lg={1} style={{ paddingLeft: '0px' }}><span className='title font-extra-bold'>{this.state.dataToolText}</span></Col>
                        <Col className={'col'} md={9} lg={10}>
                            <div className="links header-side">
                                <span className="header-item header-elem" href="#" id="log-out"><Link to="/">{this.state.signOutText} <FontAwesome name="sign-out" /></Link></span>
                            </div>
                        </Col>
                    </Row>
                </nav>
                <Button variant="outline-primary" className="query-button" onClick={this.goBack}>{this.state.backText} <FontAwesome name="fas fa-arrow-circle-left" /></Button>
                <div className="import-wrapper">
                    <h4 style={{ marginBottom: '20px' }}>{this.state.dataToolImportText}</h4>
                    <div id="UploadFile" className="">
                        <input type="file" name="Open File" id="" accept=".xlsx,.xlsm" style={{ fontWeight: 'bold' }} onChange={this.onFileChange} />
                        <div style={{ marginTop: '25px' }}>
                            <button onClick={this.onSubmit} disabled={this.state.isLoading} style={{ marginTop: "25px", marginRight: "-15px", width: "100px", height: "40px", fontSize: "16px" }}>
                                {this.state.isLoading ? this.state.importingText : this.state.importText}
                            </button>
                        </div>
                        <div style={{ marginTop: "20px", fontSize: "17px", width: "45%", color: this.state.error ? 'red' : 'green', fontWeight: 'bold' }}><p>{this.state.showActionMessage ? (this.state.error ? this.state.warningImportMessage : this.state.successImportMessage) : null}</p></div>
                    </div>
                </div>
            </div>)
    }

};

export default Import;