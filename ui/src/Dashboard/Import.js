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
                <Row></Row>
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