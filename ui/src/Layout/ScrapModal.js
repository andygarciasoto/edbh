import React from 'react';
import Modal from 'react-modal';
import { Form, Button, Row, Col, Nav } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import ReactTable from 'react-table';
import MessageModal from './MessageModal';
import LoadingModal from './LoadingModal';
import { getResponseFromGeneric, formatNumber, getCurrentTime } from '../Utils/Requests';
import { getDtReason } from '../Utils/Utils';
import { validateScrapSubmit } from '../Utils/FormValidations';
import ReactSelect from 'react-select';
import { API } from '../Utils/Constants';
import './CommentsModal.scss';
import * as _ from 'lodash';
const axios = require('axios');

class ScrapModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = Object.assign(this.getInitialState(props), this.getTextTranslations(props));
    }

    getInitialState(props) {
        return {
            actualRow: {},
            setup_scrap: 0,
            other_scrap: 0,
            adjusted_actual: 0,
            isOpen: props.isOpen,
            modal_message_isOpen: false,
            modal_type: '',
            modal_message: '',
            modal_loading_IsOpen: false,
            setupScrapOptions: [],
            allSetupScrapOptions: [],
            setupScrapOption: '',
            productionScrapOptions: [],
            allProductionScrapOptions: [],
            productionScrapOption: '',
            scrapTableList: [],
            setupScrapValue: 0,
            productionScrapValue: 0,
            adjustedActualValue: 0,
            editScrapReason: false,
            currentScrapReason: {},
            newScrapReason: {}
        }
    }

    getTextTranslations(props) {
        return {
            setupScrapText: props.t('Setup Scrap'),
            scrapCountText: props.t('Scrap Count'),
            scraptCodeText: props.t('Scrap Code'),
            scrapDefinitionText: props.t('Scrap Definition'),
            scrapTypeText: props.t('Type')
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.currentRow && nextProps.currentRow.productiondata_id !== null && nextProps.isOpen) {
            this.loadData(nextProps);
        }
    }

    loadData(props) {
        let asset = _.find(props.user.sites, { asset_id: props.user.site });

        const param1 = {
            mc: asset.asset_code,
            type: 'setup_scrap',
            dxh_data_id: props.currentRow.dxhdata_id,
            productiondata_id: props.currentRow.productiondata_id
        }

        const param2 = {
            mc: asset.asset_code,
            type: 'production_scrap'
        }

        let requestArray = [
            getResponseFromGeneric('get', API, '/timelost_reasons', {}, param1, {}),
            getResponseFromGeneric('get', API, '/timelost_reasons', {}, param2, {}),
            getResponseFromGeneric('get', API, '/timelost_dxh_data', {}, param1, {})
        ];

        axios.all(requestArray).then(
            axios.spread((...responses) => {
                this.setState({
                    isOpen: props.isOpen,
                    actualRow: props.currentRow,
                    setup_scrap: parseInt(props.currentRow.setup_scrap) || 0,
                    other_scrap: parseInt(props.currentRow.other_scrap) || 0,
                    adjusted_actual: parseInt(props.currentRow.adjusted_actual) || parseInt(props.currentRow.actual),
                    setupScrapOptions: getDtReason(responses[0]),
                    allSetupScrapOptions: responses[0],
                    setupScrapOption: '',
                    productionScrapOptions: getDtReason(responses[1]),
                    allProductionScrapOptions: responses[1],
                    productionScrapOption: '',
                    modal_loading_IsOpen: false,
                    scrapTableList: responses[2],
                    setupScrapValue: 0,
                    productionScrapValue: 0,
                    adjustedActualValue: parseInt(props.currentRow.adjusted_actual) || parseInt(props.currentRow.actual),
                    editScrapReason: false,
                    currentScrapReason: {},
                    newScrapReason: {}
                });
            })
        );
    }

    onChangeInput = (e, field) => {
        let otherInput = field === 'setupScrapValue' ? 'productionScrapValue' : 'setupScrapValue';
        if (this.state.adjusted_actual - (parseInt(e.target.value) + this.state[otherInput]) >= 0) {
            this.setState({
                [field]: parseInt(e.target.value),
                adjustedActualValue: this.state.adjusted_actual - (parseInt(e.target.value) + this.state[otherInput])
            });
        }
    }

    onChangeSelect = (e, field) => {
        this.setState({ [field]: e });
    }

    getColumns() {
        let columns = [
            {
                Header: this.getHeader(this.state.scrapCountText),
                accessor: 'quantity',
                maxWidth: 256,
                Cell: c => this.renderCell(c.original, 'quantity')
            },
            {
                Header: this.getHeader(this.state.scraptCodeText),
                accessor: 'dtreason_code',
                maxWidth: 256,
                Cell: c => this.renderCell(c.original, 'dtreason_code')
            },
            {
                Header: this.getHeader(this.state.scrapDefinitionText),
                accessor: 'dtreason_name',
                maxWidth: 256,
                Cell: c => this.renderCell(c.original, 'dtreason_name')
            },
            {
                Header: this.getHeader(this.state.scrapTypeText),
                accessor: 'type',
                maxWidth: 256,
                Cell: c => this.renderCell(c.original, 'type')
            }
        ];

        if (this.state.editScrapReason) {
            columns.push(
                {
                    maxWidth: 50,
                    Cell: c => this.renderEditAcceptDeleteButton(c.original, 'accept')
                }
            );
            columns.push(
                {
                    maxWidth: 50,
                    Cell: c => this.renderEditAcceptDeleteButton(c.original, 'cancel')
                }
            );
        } else {
            columns.push(
                {
                    maxWidth: 50,
                    Cell: c => this.renderEditAcceptDeleteButton(c.original, 'edit')
                }
            );
        }

        return columns;
    }

    getHeader(text) {
        return <span className={'wordwrap left-align'} style={{ float: 'left' }} data-tip={text}><b>{text}</b></span>
    }

    renderCell(row, prop) {
        if (!this.state.editScrapReason || row.dtdata_id !== this.state.currentScrapReason.dtdata_id) {
            return <span>{row[prop]}</span>;
        } else {
            if (prop === 'quantity') {
                return <input type='number' autoFocus={this.state.editScrapReason}
                    min='1' max={formatNumber(this.state.adjusted_actual) + formatNumber(this.state.currentScrapReason.quantity)} value={this.state.newScrapReason[prop]}
                    onChange={(e) => this.changeInputValue(e)}></input>
            } else if (prop === 'dtreason_code') {
                return <ReactSelect
                    value={{
                        value: this.state.newScrapReason.dtreason_code,
                        label: `${this.state.newScrapReason.dtreason_code} - ${this.state.newScrapReason.dtreason_name}`,
                        dtreason_id: this.state.newScrapReason.dtreason_id
                    }}
                    onChange={(e) => this.changeSelectTable(e)}
                    options={this.state.newScrapReason.type === 'setup_scrap' ? this.state.setupScrapOptions : this.state.productionScrapOptions}
                />;
            } else {
                return <span>{this.state.newScrapReason[prop]}</span>;
            }
        }
    }

    changeInputValue(e) {
        let newScrapReason = this.state.newScrapReason;
        newScrapReason.quantity = parseInt(e.target.value);
        this.setState({ newScrapReason });
    }

    changeSelectTable(e) {
        const scrapList = this.state.newScrapReason.type === 'setup_scrap' ? this.state.allSetupScrapOptions : this.state.allProductionScrapOptions;
        let newScrapReason = _.find(scrapList, ['dtreason_id', e.dtreason_id]);
        newScrapReason.quantity = this.state.newScrapReason.quantity;
        this.setState({ newScrapReason });
    }

    renderEditAcceptDeleteButton(row, action) {
        if (action === 'edit') {
            return <Nav.Link onClick={() => this.editScrapRow(row)}><FontAwesome name='edit' /></Nav.Link>;
        } else if (action === 'accept' && row.dtdata_id === this.state.currentScrapReason.dtdata_id) {
            return <Nav.Link onClick={() => this.acceptNewScrap(row)}><FontAwesome name='check' /></Nav.Link>;
        } else if (action === 'cancel' && row.dtdata_id === this.state.currentScrapReason.dtdata_id) {
            return <Nav.Link onClick={() => this.cancelEditScrap()}><FontAwesome name='window-close' /></Nav.Link>;
        } else {
            return <span></span>;
        }
    }

    editScrapRow(row) {
        this.setState({
            editScrapReason: true,
            currentScrapReason: _.clone(row),
            newScrapReason: _.clone(row)
        });
    }

    acceptNewScrap() {
        if ((this.state.currentScrapReason.quantity !== this.state.newScrapReason.quantity) ||
            (this.state.currentScrapReason.dtreason_id !== this.state.newScrapReason.dtreason_id)) {

            const asset = _.find(this.props.user.sites, { asset_id: this.props.user.site });
            const data = {
                dxh_data_id: this.state.actualRow.dxhdata_id,
                productiondata_id: this.state.actualRow.productiondata_id,
                dt_reason_id: this.state.newScrapReason.dtreason_id,
                setup_scrap: this.state.newScrapReason.type === 'setup_scrap' ? this.state.setup_scrap - this.state.currentScrapReason.quantity + this.state.newScrapReason.quantity : this.state.setup_scrap,
                other_scrap: this.state.newScrapReason.type === 'production_scrap' ? this.state.other_scrap - this.state.currentScrapReason.quantity + this.state.newScrapReason.quantity : this.state.other_scrap,
                clocknumber: this.props.user.clock_number ? this.props.user.clock_number : undefined,
                first_name: this.props.user.clock_number ? undefined : this.props.user.first_name,
                last_name: this.props.user.clock_number ? undefined : this.props.user.last_name,
                quantity: this.state.newScrapReason.quantity,
                dtdata_id: parseInt(this.state.currentScrapReason.dtdata_id),
                timestamp: getCurrentTime(this.props.user.timezone),
                asset_code: asset.asset_code
            }

            this.setState({ modal_loading_IsOpen: true }, async () => {
                let res = await getResponseFromGeneric('put', API, '/scrap_values', {}, {}, data);

                if (res.status !== 200) {
                    this.setState({ modal_loading_IsOpen: false, modal_message_isOpen: true, modal_type: 'Error', modal_message: 'Scrap Entries unsaved' });
                } else {
                    this.setState({ request_status: res, modal_loading_IsOpen: false, modal_message_isOpen: true, modal_type: 'Success', modal_message: 'Scrap Entries Saved' });
                }
                this.props.Refresh(this.props.parentData);
                this.setState({ new_tl_reason: '', allowSubmit: true, time_to_allocate: 0 });
            });
        } else {
            this.setState({
                modal_message_isOpen: true,
                modal_type: 'Error',
                modal_message: `Any change detected`
            });
        }
    }

    cancelEditScrap() {
        this.setState({
            editScrapReason: false,
            currentScrapReason: {},
            newScrapReason: {}
        });
    }

    submitReason = (type) => {
        const validation = validateScrapSubmit(this.state, type);
        if (validation.error) {
            this.setState({ modal_loading_IsOpen: false, modal_message_isOpen: true, modal_type: 'Error', modal_message: validation.modal_message });
            return;
        }

        const asset = _.find(this.props.user.sites, { asset_id: this.props.user.site });

        let data = {
            dxh_data_id: this.state.actualRow.dxhdata_id,
            productiondata_id: this.state.actualRow.productiondata_id,
            dt_reason_id: type === 'setup' ? this.state.setupScrapOption.dtreason_id : this.state.productionScrapOption.dtreason_id,
            setup_scrap: type === 'setup' ? this.state.setup_scrap + this.state.setupScrapValue : this.state.setup_scrap,
            other_scrap: type === 'production' ? this.state.other_scrap + this.state.productionScrapValue : this.state.other_scrap,
            clocknumber: this.props.user.clock_number ? this.props.user.clock_number : undefined,
            first_name: this.props.user.clock_number ? undefined : this.props.user.first_name,
            last_name: this.props.user.clock_number ? undefined : this.props.user.last_name,
            quantity: type === 'setup' ? this.state.setupScrapValue : this.state.productionScrapValue,
            timestamp: getCurrentTime(this.props.user.timezone),
            asset_code: asset.asset_code
        };

        const scrap = _.find(this.state.scrapTableList, { dtreason_id: data.dt_reason_id }) || {};
        if (scrap.dtreason_id) {
            data.quantity += scrap.quantity;
            data.dtdata_id = scrap.dtdata_id;
        }

        this.setState({ modal_loading_IsOpen: true }, async () => {
            let res = await getResponseFromGeneric('put', API, '/scrap_values', {}, {}, data);
            if (res.status !== 200) {
                this.setState({ modal_loading_IsOpen: false, modal_message_isOpen: true, modal_type: 'Error', modal_message: 'Could not complete request' });
            } else {
                this.setState({ request_status: res, modal_loading_IsOpen: false, modal_message_isOpen: true, modal_type: 'Success', modal_message: 'Value was inserted' });
                this.props.Refresh(this.props.parentData);
            }
        });
    }

    closeModal = () => {
        this.setState({ modal_message_isOpen: false, modal_loading_IsOpen: false });
    }

    render() {
        const styles = _.cloneDeep(this.props.style);
        if (!_.isEmpty(styles)) {
            styles.content.width = '50%';
            styles.content.overflow = 'visible';
        }
        const selectStyles = {
            control: base => ({
                ...base,
                height: 35,
                minHeight: 35
            })
        }
        const t = this.props.t;
        return (
            this.state.isOpen ?
                <React.Fragment>
                    <Modal
                        isOpen={this.props.isOpen}
                        onRequestClose={this.props.onRequestClose}
                        style={styles}
                        contentLabel="Example Modal">
                        <span className="close-modal-icon" onClick={this.props.onRequestClose}>X</span>
                        <span><h4 style={{ marginLeft: '10px' }}>{t('Scrap')}</h4></span>
                        <Row className="new-timeloss-data" style={{ marginBottom: '5px' }}>
                            <Col sm={4} md={4}>
                                <span className="dashboard-modal-field-group">
                                    <p>{this.props.t('Part Number')}:</p>
                                    <Form.Control
                                        style={{ paddingTop: '5px' }}
                                        disabled={true}
                                        value={this.state.actualRow.product_code}>
                                    </Form.Control>
                                </span>
                            </Col>
                            <Col sm={4} md={4}>
                                <span className="dashboard-modal-field-group">
                                    <p>{this.props.t('Recorded Actual')}:</p>
                                    <Form.Control
                                        style={{ paddingTop: '5px' }}
                                        type={this.props.formType}
                                        disabled={true}
                                        value={this.state.actualRow.actual || 0}>
                                    </Form.Control>
                                </span>
                            </Col>
                        </Row>
                        <ReactTable
                            className={'reactTableTReason'}
                            data={this.state.scrapTableList}
                            columns={this.getColumns()}
                            defaultPageSize={this.state.scrapTableList.length > 3 ? this.state.scrapTableList.length : 4}
                            showPaginationBottom={false}
                            noDataText={this.props.t('No Scrap entries yet')}
                        />
                        <span className={"new-timelost-label"}>{t('New Setup Scrap Entry')}</span>
                        <div className="new-timeloss">
                            <Row style={{ marginBottom: '1px' }}>
                                <Col sm={4} md={4}>
                                    <span className="dashboard-modal-field-group"><p>{this.props.t('Setup Scrap')}:</p>
                                        <input
                                            value={this.state.setupScrapValue}
                                            type="number"
                                            onChange={e => this.onChangeInput(e, 'setupScrapValue')}
                                            className="form-control"
                                            style={{ paddingTop: '5px' }}
                                            min='0'
                                            disabled={this.props.readOnly || this.state.editScrapReason} />
                                    </span>
                                </Col>
                                <Col sm={6} md={6}>
                                    <p style={{ paddingBottom: '1px', marginBottom: '5px' }}>{t('Search/Select Scrap Code') ? t('Search/Select Scrap Code') : t('New Value')}:</p>
                                    <Form.Group controlId="formGridState">
                                        <ReactSelect
                                            value={this.state.setupScrapOption}
                                            onChange={(e) => this.onChangeSelect(e, 'setupScrapOption')}
                                            options={this.state.setupScrapOptions}
                                            className={"react-select-container"}
                                            styles={selectStyles}
                                            isDisabled={this.props.readOnly || this.state.editScrapReason}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <div className={'new-timeloss-button'}>
                                <Button
                                    variant="outline-primary"
                                    style={{ marginTop: '10px' }}
                                    disabled={this.props.readOnly || this.state.editScrapReason}
                                    onClick={() => this.submitReason('setup')}>{this.props.t('Submit')}</Button>
                                {this.props.readOnly ? <div><span style={{ color: 'grey' }}>{this.props.t('Read-Only')}</span></div> : null}
                            </div>
                        </div>
                        <span className={"new-timelost-label"}>{t('New Production Scrap Entry')}</span>
                        <div className="new-timeloss">
                            <Row style={{ marginBottom: '1px' }}>
                                <Col sm={4} md={4}>
                                    <span className="dashboard-modal-field-group"><p>{this.props.t('Production Scrap')}:</p>
                                        <input
                                            value={this.state.productionScrapValue}
                                            type="number"
                                            onChange={e => this.onChangeInput(e, 'productionScrapValue')}
                                            className="form-control"
                                            style={{ paddingTop: '5px' }}
                                            min='0'
                                            disabled={this.props.readOnly || this.state.editScrapReason} />
                                    </span>
                                </Col>
                                <Col sm={6} md={6}>
                                    <p style={{ paddingBottom: '1px', marginBottom: '5px' }}>{t('Search/Select Scrap Code') ? t('Search/Select Scrap Code') : t('New Value')}:</p>
                                    <Form.Group controlId="formGridState">
                                        <ReactSelect
                                            value={this.state.productionScrapOption}
                                            onChange={(e) => this.onChangeSelect(e, 'productionScrapOption')}
                                            options={this.state.productionScrapOptions}
                                            className={"react-select-container"}
                                            styles={selectStyles}
                                            isDisabled={this.props.readOnly || this.state.editScrapReason}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <div className={'new-timeloss-button'}>
                                <Button
                                    variant="outline-primary"
                                    style={{ marginTop: '10px' }}
                                    disabled={this.props.readOnly || this.state.editScrapReason}
                                    onClick={() => this.submitReason('production')}>{this.props.t('Submit')}</Button>
                                {this.props.readOnly ? <div><span style={{ color: 'grey' }}>{this.props.t('Read-Only')}</span></div> : null}
                            </div>
                            <Col sm={4} md={4}>
                                <span className="dashboard-modal-field-group"><p>{this.props.t('Adjusted Actual')}:</p>
                                    <input
                                        value={this.state.adjustedActualValue || 0}
                                        type="number"
                                        className="form-control"
                                        style={{ paddingTop: '5px' }}
                                        disabled={true} />
                                </span>
                            </Col>
                        </div>
                        <div className={'new-timeloss-close'}>
                            <Button variant="outline-secondary"
                                style={{ marginTop: '10px', marginLeft: '10px' }}
                                onClick={this.props.onRequestClose}>{t('Close')}</Button>
                        </div>
                    </Modal>
                    <MessageModal
                        isOpen={this.state.modal_message_isOpen}
                        onRequestClose={this.closeModal}
                        type={this.state.modal_type}
                        message={this.state.modal_message}
                        t={this.props.t}
                    />
                    <LoadingModal
                        isOpen={this.state.modal_loading_IsOpen}
                        onRequestClose={this.closeModal}
                        contentLabel="Example Modal"
                        t={this.props.t}
                    />
                </React.Fragment>
                : null
        )
    }
}

Modal.setAppElement('#root');
export default ScrapModal;