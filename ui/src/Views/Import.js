import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { DATATOOL } from '../Utils/Constants';
import { saveAs } from 'file-saver';
import ConfigurationTab from '../Components/Import/ConfigurationTab';
import * as axios from 'axios';
import '../sass/Import.scss';
import _ from 'lodash';
const ACCESS_TOKEN_STORAGE_KEY = 'accessToken';

class Import extends React.Component {
    constructor(props) {
        super(props);
        this.state = Object.assign(this.getInitialState(props), this.getTranslations(props));
    };

    getInitialState(props) {
        return {
            file: {},
            selectedAction: 'Import',
            currentLanguage: props.search.ln || props.user.language,
            completeListTabs: [],
            availableListTabs: [],
            selectedListTabs: [],
            message: '',
            isLoading: false,
            isExporting: false,
            showActionMessage: false,
            error: false,
            showActionMessageExport: false,
            errorExport: false
        };
    }

    getTranslations(props) {
        return {
            signOutText: props.t('Sign Out'),
            dataToolText: props.t('Data Tool'),
            backText: props.t('Back'),
            importText: props.t('Import'),
            importingText: props.t('Importing'),
            successImportMessage: props.t('Configuration Imported Successfully'),
            warningImportMessage: props.t('Configuration was not imported:'),
            exportText: props.t('Export'),
            exportingText: props.t('Exporting'),
            successExportMessage: props.t('Configuration Exported Successfully'),
            warningExportMessage: props.t('Configuration was not exported'),
            importExportTitleText: props.t('Site Configuration Import/Export Tool'),
            selectText: props.t('Select an action'),
            errorEmptySelectionText: props.t('You must choose at least one of the available configurations items'),
            secondMessageErrorImportText: ''
        };
    }

    componentDidMount() {
        this.fetchData();
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const currentLanguage = nextProps.search.ln || nextProps.user.language;
        if (!_.isEqual(currentLanguage, prevState.currentLanguage)) {
            return {
                currentLanguage
            };
        }
        return null;
    }

    componentDidUpdate(prevProps, prevState) {
        if (!_.isEqual(this.state.currentLanguage, prevState.currentLanguage)) {
            this.setState(this.getTranslations(this.props));
        }
    }

    fetchData() {
        let actualTabs = [];

        actualTabs.push({ id: 'Asset', content: 'Asset' });
        actualTabs.push({ id: 'DTReason', content: 'DTReason' });
        actualTabs.push({ id: 'Shift', content: 'Shift' });
        actualTabs.push({ id: 'Tag', content: 'Tag' });
        actualTabs.push({ id: 'CommonParameters', content: 'CommonParameters' });
        actualTabs.push({ id: 'UOM', content: 'UOM' });
        actualTabs.push({ id: 'Unavailable', content: 'Unavailable' });
        actualTabs.push({ id: 'TFDUsers', content: 'TFDUsers' });
        actualTabs.push({ id: 'AssetDisplaySystem', content: 'AssetDisplaySystem' });
        actualTabs.push({ id: 'Workcell', content: 'Workcell' });

        this.setState({
            completeListTabs: actualTabs,
            availableListTabs: actualTabs
        })
    }

    handleInputChange = (changeEvent) => {
        this.setState({
            selectedAction: changeEvent.target.value,
            availableListTabs: changeEvent.target.value === 'Export' ? [] : this.state.completeListTabs,
            selectedListTabs: changeEvent.target.value === 'Export' ? this.state.completeListTabs : [],
            showActionMessage: false,
            showActionMessageExport: false
        });
    }

    onFileChange = (event) => {
        var file = event.target.files[0];
        this.setState({ file });
    }

    updateTabsImported = (availableListTabs, selectedListTabs) => {
        this.setState({ availableListTabs, selectedListTabs });
    }

    importAllTabs = () => {
        this.updateTabsImported([], this.state.completeListTabs);
    };

    resetTabs = () => {
        this.updateTabsImported(this.state.completeListTabs, []);
    }

    onSubmit = () => {
        if (this.state.selectedListTabs.length > 0) {
            let _this = this;
            const url = `${DATATOOL}/import_data`;
            let formData = new FormData();
            formData.append('file', _this.state.file);
            formData.append('configurationItems', JSON.stringify(_this.state.selectedListTabs));
            formData.append('site_id', JSON.stringify(_this.props.user.site));
            const request_config = {
                method: "POST",
                url: url,
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY),
                    "Content-Type": "multipart/form-data"
                },
                data: formData
            };
            this.setState({ isLoading: true, showActionMessage: false }, () => {
                axios(request_config).then(response => {
                    _this.setState({ isLoading: false, showActionMessage: true, error: false });
                }).catch(e => {
                    let errorMessage = e.response && e.response.data ? e.response.data.message : 'Please try again';
                    _this.setState({
                        isLoading: false,
                        showActionMessage: true,
                        error: true,
                        secondMessageErrorImportText: _this.state.warningImportMessage + ' ' + errorMessage
                    });
                });
            });
        } else {
            this.setState({ showActionMessage: true, error: true });
        }
    }

    exportEvent = async () => {
        let _this = this;
        this.setState({ isExporting: true, errorExport: false, showActionMessageExport: false, showActionMessage: false }, () => {
            fetch(
                `${DATATOOL}/export_data?content_type=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet&site_id=${this.props.user.site}`,
                { headers: { Authorization: 'Bearer ' + localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) } })
                .then(response => {
                    if (response.status !== 200) return response;
                    return response.blob()
                })
                .then(response => {
                    if (!response.status) {
                        saveAs(response, `${this.props.user.site_name} eDBH Configuration.xlsx`);
                        _this.setState({ isExporting: false, errorExport: false, showActionMessageExport: true });
                    } else {
                        _this.setState({ isExporting: false, errorExport: true, showActionMessageExport: true });
                    }
                });
        })
    }


    render() {
        return (
            <div className="wrapper-main-import" style={{ height: '95%' }}>
                <Row></Row>
                <div className="import-wrapper">
                    <Row>
                        <h3>{this.props.user.site_name + ' ' + this.state.importExportTitleText}</h3>
                    </Row>
                    <Row className='show-grid'>
                        <Col>
                            <label>{this.state.selectText + ':'}</label>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={1}>
                            <label>
                                <input type="radio" value="Import" checked={this.state.selectedAction === 'Import'}
                                    onChange={(e) => this.handleInputChange(e)} />
                                {' ' + this.state.importText}
                            </label>
                        </Col>
                        <Col md={1}>
                            <label>
                                <input type="radio" value="Export" checked={this.state.selectedAction === 'Export'}
                                    onChange={(e) => this.handleInputChange(e)} />
                                {' ' + this.state.exportText}
                            </label>
                        </Col>
                    </Row>
                    {this.state.selectedAction === 'Import' ?
                        <Row className='show-grid'>
                            <Col>
                                <input type="file" name="Open File" id="" accept=".xlsx,.xlsm" style={{ fontWeight: 'bold' }} onChange={this.onFileChange} />
                            </Col>
                            <Col>
                                <p className={'text-danger'}>Notes
                                <li>If the site is being configured for the first time, make sure to import the Assets table individually, then the TFDUsers table individually and finally proceed with the rest of the tables.</li>
                                    <li>If the Excel sheet does not have data, do not include it in the import.</li>
                                    <li>This configuration will not delete data. It will only insert and update.</li>
                                    <li>If an error shows up, try again importing the tables individually. Then, check the Excel sheet that is failing and if the error persists, contact the EY Team.</li>
                                </p>
                            </Col>
                        </Row>
                        : null}
                    <br />
                    <ConfigurationTab
                        availableListTabs={this.state.availableListTabs}
                        selectedListTabs={this.state.selectedListTabs}
                        selectedAction={this.state.selectedAction}
                        onUpdateTabsImported={this.updateTabsImported}
                        importAllTabs={this.importAllTabs}
                        resetTabs={this.resetTabs}
                        height={'350px'}
                        t={this.props.t} />

                    {this.state.selectedAction === 'Import' ?
                        <button onClick={this.onSubmit} disabled={this.state.isLoading || !this.state.file.name} style={{ marginTop: "25px", marginRight: "-15px", width: "150px", height: "40px", fontSize: "16px" }}>
                            {this.state.isLoading ? this.state.importingText : this.state.importText}
                        </button>
                        :
                        <button onClick={this.exportEvent} disabled={this.state.isExporting} style={{ marginTop: "25px", marginRight: "-15px", width: "150px", height: "40px", fontSize: "16px" }}>
                            {this.state.isExporting ? this.state.exportingText : this.state.exportText}
                        </button>
                    }
                    <div style={{ marginTop: "20px", fontSize: "17px", width: "45%", color: this.state.error ? 'red' : 'green', fontWeight: 'bold' }}><p>{this.state.showActionMessage ? (this.state.error ? (this.state.selectedListTabs.length === 0 ? this.state.errorEmptySelectionText : this.state.secondMessageErrorImportText) : this.state.successImportMessage) : null}</p></div>
                    <div style={{ marginTop: "20px", fontSize: "17px", width: "45%", color: this.state.errorExport ? 'red' : 'green', fontWeight: 'bold' }}><p>{this.state.showActionMessageExport ? (this.state.errorExport ? this.state.warningExportMessage : this.state.successExportMessage) : null}</p></div>
                </div>
            </div >)
    }

};

export default Import;