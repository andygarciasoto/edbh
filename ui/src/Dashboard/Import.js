import React from 'react';
import { Row, Col, Tabs, Tab } from 'react-bootstrap';
import '../Layout/Header.scss';
import { sendPutDataTool } from '../Utils/Requests';
import { DATATOOL } from '../Utils/Constants';
import { saveAs } from 'file-saver';
import Spinner from '../Spinner';

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
            isExporting: false,
            showActionMessage: false,
            error: false
        };
    }

    getTranslations(props) {
        return {
            signOutText: props.t('Sign Out'),
            dataToolText: props.t('Data Tool'),
            backText: props.t('Back'),
            importText: props.t('Import'),
            importingText: props.t('Importing...'),
            successImportMessage: props.t('Configuration Imported Successfully'),
            warningImportMessage: props.t('Fail, Configuration not Imported'),
            exportText: props.t('Export Excel'),
            exportingText: props.t('Exporting...')
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
        this.setState({ file });
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

    exportEvent = async () => {
        let _this = this;
        this.setState({ isExporting: true }, () => {
            fetch(`${DATATOOL}/export_data?content_type=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet&site_name=${this.props.user.site_name}`)
                .then(response => response.blob())
                .then(blob => {
                    saveAs(blob, 'Result.xlsx');
                    _this.setState({ isExporting: false });
                });
        })
    }


    render() {
        return (
            <div className="wrapper-main-import" style={{ height: '100vh' }}>
                <Row></Row>
                <div className="import-wrapper">
                    <Tabs defaultActiveKey='import' id='uncontrolled-tab-example'>
                        <Tab eventKey='import' title='Import'>
                            <Col>
                                <h4>Import Section</h4>
                                <p>This section is to import a new configuration to the application. Always the data will be import it using the site of the user that made the request. This keeps the security of the information and changes only the necessary information of the actual user login in.
The user will update all these configuration tables from the database:
</p>
                                <ul>
                                    <li>DT Reason</li>
                                    <li>Asset</li>
                                    <li>Shift</li>
                                    <li>Tag</li>
                                    <li>Common Parameters</li>
                                    <li>UOM</li>
                                    <li>Unavailable</li>
                                </ul>
                                <p>* The configuration can be loaded only from an excel file. The file will have a tab with each table to import. This file needs to have the same information on the export file and will update the configuration in the application.</p>
                                <div id="UploadFile" className="">
                                    <input type="file" name="Open File" id="" accept=".xlsx,.xlsm" style={{ fontWeight: 'bold' }} onChange={this.onFileChange} />
                                    <div style={{ marginTop: '25px' }}>
                                        <button onClick={this.onSubmit} disabled={this.state.isLoading || !this.state.file.name} style={{ marginTop: "25px", marginRight: "-15px", width: "100px", height: "40px", fontSize: "16px" }}>
                                            {this.state.isLoading ? this.state.importingText : this.state.importText}
                                        </button>
                                    </div>
                                    <div style={{ marginTop: "20px", fontSize: "17px", width: "45%", color: this.state.error ? 'red' : 'green', fontWeight: 'bold' }}><p>{this.state.showActionMessage ? (this.state.error ? this.state.warningImportMessage : this.state.successImportMessage) : null}</p></div>
                                </div>
                            </Col>
                        </Tab>
                        <Tab eventKey='export' title='Export'>
                            <h4>Export Section</h4>
                            <p>This section is to export the actual configuration of the application. Always the data will be export it filtering the information by the site of the user that made the request. This keeps the security of the information and displays only the necessary information of the actual user login in.
    The user only has the possible to download all these configuration tables from the database:</p>
                            <ul>
                                <li>DT Reason</li>
                                <li>Asset</li>
                                <li>Shift</li>
                                <li>Tag</li>
                                <li>Common Parameters</li>
                                <li>UOM</li>
                                <li>Unavailable</li>
                            </ul>
                            <p>* The configuration will be saved as an excel file. The file will have a tab with each table downloaded. This file can be used in the import module but any changes in the excel will update the configuration in the application.</p>
                            <button onClick={() => this.exportEvent()} disabled={this.state.isExporting} style={{ marginTop: "25px", marginRight: "-15px", width: "150px", height: "40px", fontSize: "16px" }}>
                                {this.state.isExporting ? this.state.exportingText : this.state.exportText}
                            </button>
                            {this.state.isExporting ? <Spinner /> : ''}
                        </Tab>
                    </Tabs>
                </div>
            </div>)
    }

};

export default Import;