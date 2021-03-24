import React from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import MessageModal from '../../Common/MessageModal';
import LoadingModal from '../../Common/LoadingModal';
import BarcodeScannerModal from '../../Common/BarcodeScannerModal';
import { getResponseFromGeneric, getCurrentTime } from '../../../Utils/Requests';
import ReactSelect from 'react-select';
import { validateScrapSubmit } from '../../../Utils/FormValidations';
import { API } from '../../../Utils/Constants';
import '../../../sass/ReasonModal.scss';
import _ from 'lodash';
import ReasonTable from './ReasonTable'
const axios = require('axios');

class ScrapModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = Object.assign(this.getInitialState(props));
    }

    getInitialState(props) {
        return {
            modal_loading_IsOpen: false,
            modal_message_IsOpen: false,
            modal_type: '',
            modal_message: '',
            currentRow: {},
            quantityValue: 0,
            scrapType: { value: 'Setup', label: 'Setup' },
            scrapTypeOptions: [
                { value: 'Setup', label: 'Setup' },
                { value: 'Production', label: 'Production' }
            ],
            selectedReason: null,
            allReasonOptions: [],
            setupReasonsOptions: [],
            productionReasonsOptions: [],
            setupReasonsOptionsFilter: [],
            productionReasonsOptionsFilter: [],
            adjusted_actual: 0,
            adjustedActualValue: 0,
            scrapTableList: [],
            reasonVisible: false,
            actualReasonValue: 0,
            insert: false,
            modal_validate_IsOpen: false,
            currentReason: {},
            newReason: {},
            selectedResponsible: null,
            responsibleOptions: []
        }
    }

    async componentDidMount() {
        const asset = {
            site: this.props.user.site,
            level: 'Area',
            automation_level: 'All'
        };
        let responsibleOptions = await getResponseFromGeneric('get', API, '/machine', {}, asset, {}) || [];
        responsibleOptions = _.map(responsibleOptions, asset => {
            asset.label = asset.asset_code + ' - ' + asset.asset_name;
            asset.value = asset.asset_id;
            return asset;
        });
        const selectedResponsible = _.find(responsibleOptions, { asset_code: this.props.selectedAssetOption.parent_asset_code });
        this.setState({ responsibleOptions, selectedResponsible });
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.isOpen && !_.isEqual(nextProps.currentRow, prevState.currentRow) && nextProps.currentRow &&
            nextProps.currentRow.dxhdata_id && nextProps.currentRow.productiondata_id) {
            return {
                currentRow: nextProps.currentRow,
                adjusted_actual: parseInt(nextProps.currentRow.adjusted_actual),
                adjustedActualValue: parseInt(nextProps.currentRow.adjusted_actual),
                quantityValue: 0,
                reasonVisible: false,
                actualReasonValue: 0,
                selectedReason: null,
                setupReasonsOptions: prevState.setupReasonsOptions,
                productionReasonsOptions: prevState.productionReasonsOptions,
                allReasonOptions: prevState.allReasonOptions,
                scrapTableList: prevState.scrapTableList,
                selectedResponsible: null
            };
        }
        return null;
    }

    componentDidUpdate(prevProps, prevState) {
        if (!_.isEqual(this.state.currentRow, prevState.currentRow)) {
            this.setState({ modal_loading_IsOpen: true }, () => {
                this.loadResponsables(this.props);
                this.loadData(this.props);
            });
        }
    }

    loadResponsables(props) {
        const selectedResponsible = _.find(this.state.responsibleOptions, { asset_code: this.props.selectedAssetOption.parent_asset_code });
        this.setState({ selectedResponsible });
    }

    onChangeInput = (e, field) => {
        if (parseInt(this.state.adjusted_actual) - parseInt(e.target.value) >= 0) {
            this.setState({
                [field]: parseInt(e.target.value),
                adjustedActualValue: parseInt(this.state.adjusted_actual) - parseInt(e.target.value)
            });
        }
    }

    onChangeSelectType = (e, field) => {
        this.setState({
            [field]: e,
            selectedReason: null,
            reasonVisible: false
        });
    }

    onChangeSelect = (e, field) => {
        let reason = _.find(this.state.scrapTableList, { dtreason_id: e.dtreason_id });
        this.setState({
            [field]: e,
            actualReasonValue: reason ? reason.quantity : 0,
            reasonVisible: reason ? true : false
        });
    }

    onChangeSelectGeneric = (e, field) => {
        this.setState({
            [field]: e
        });
    }

    loadData(props) {

        let asset_code = props.selectedAssetOption.asset_code === 'No Data' ? null : props.selectedAssetOption.asset_code;
        const param1 = {
            mc: asset_code,
            type: 'scrap',
            dxh_data_id: this.state.currentRow.dxhdata_id,
            productiondata_id: this.state.currentRow.productiondata_id
        }

        let requestArray = [
            getResponseFromGeneric('get', API, '/reasons', {}, param1, {}),
            getResponseFromGeneric('get', API, '/dxh_data', {}, param1, {})
        ];

        axios.all(requestArray).then(
            axios.spread((...responses) => {

                let setupReasonsOptions = [];
                let productionReasonsOptions = [];

                _.forEach(responses[0], reason => {
                    reason.label = reason.dtreason_code + ' - ' + reason.dtreason_name;
                    reason.value = reason.dtreason_id;
                    if (reason.level === 'Setup') {
                        setupReasonsOptions.push(reason);
                    } else {
                        productionReasonsOptions.push(reason);
                    }
                });

                this.setState({
                    setupReasonsOptions,
                    productionReasonsOptions,
                    allReasonOptions: responses[0],
                    scrapTableList: responses[1],
                    modal_loading_IsOpen: false
                });
            })
        );
    }

    submitReason = () => {
        const type = this.state.scrapType.value;
        const validation = validateScrapSubmit(this.state, type);
        if (validation.error) {
            this.setState({ modal_loading_IsOpen: false, modal_message_IsOpen: true, modal_type: 'Error', modal_message: validation.modal_message });
            return;
        }

        const props = this.props;
        if (props.selectedAssetOption.is_multiple && props.user.role === 'Operator') {
            if (props.activeOperators.length > 1) {
                this.setState({ modal_validate_IsOpen: true, insert: true });
            } else {
                this.submitScrap(props.activeOperators[0].badge);
            }
        } else {
            this.submitScrap(props.user.badge);
        }
    }

    acceptNewScrap = (currentReason, newReason) => {
        if ((currentReason.quantity !== newReason.quantity) ||
            (currentReason.dtreason_id !== newReason.dtreason_id) ||
            (currentReason.responsible !== newReason.responsible)) {
            const props = this.props;
            if (props.selectedAssetOption.is_multiple && props.user.role === 'Operator') {
                if (props.activeOperators.length > 1) {
                    this.setState({ modal_validate_IsOpen: true, insert: false, currentReason, newReason });
                } else {
                    this.submitNewScrapUpdate(props.activeOperators[0].badge, currentReason, newReason);
                }
            } else {
                this.submitNewScrapUpdate(props.user.badge, currentReason, newReason);
            }
        } else {
            this.setState({
                modal_message_IsOpen: true,
                modal_type: 'Warning',
                modal_message: `No changes detected. Please close the window or edit your values`
            });
        }
    }

    handleScan = (badge) => {
        this.setState({ modal_validate_IsOpen: false, modal_loading_IsOpen: true }, async () => {
            const parameters = {
                badge: badge,
                site_id: this.props.user.site
            };
            let res = await getResponseFromGeneric('get', API, '/find_user_information', {}, parameters, {}) || [];
            if (!res[0]) {
                this.setState({
                    modal_loading_IsOpen: false,
                    modal_type: 'Error',
                    modal_message: 'Error finding the user. Please Try again',
                    modal_message_IsOpen: true
                });
            } else {
                this.setState({
                    modal_loading_IsOpen: false
                });
                if (this.state.insert) {
                    this.submitScrap(badge);
                } else {
                    this.submitNewScrapUpdate(badge, this.state.currentReason, this.state.newReason);
                }
            }
        });
    }

    submitScrap(badge) {
        const type = this.state.scrapType.value;

        let data = {
            dxh_data_id: this.state.currentRow.dxhdata_id,
            productiondata_id: this.state.currentRow.productiondata_id,
            dt_reason_id: this.state.selectedReason.dtreason_id,
            setup_scrap: type === 'Setup' ?
                (parseInt(this.state.currentRow.setup_scrap) + parseInt(this.state.quantityValue)) :
                parseInt(this.state.currentRow.setup_scrap),
            other_scrap: type === 'Production' ?
                (parseInt(this.state.currentRow.other_scrap) + parseInt(this.state.quantityValue)) :
                parseInt(this.state.currentRow.other_scrap),
            clocknumber: badge,
            responsible: this.state.selectedResponsible.asset_code,
            quantity: parseInt(this.state.quantityValue),
            timestamp: getCurrentTime(this.props.user.timezone),
            asset_code: this.props.selectedAssetOption.asset_code
        };

        const scrap = _.find(this.state.scrapTableList, { dtreason_id: data.dt_reason_id }) || {};
        if (scrap.dtreason_id) {
            data.quantity += scrap.quantity;
            data.dtdata_id = scrap.dtdata_id;
        }

        this.setState({ modal_loading_IsOpen: true }, async () => {
            let res = await getResponseFromGeneric('put', API, '/scrap_values', {}, {}, data);
            if (res.status !== 200) {
                this.setState({ modal_loading_IsOpen: false, modal_message_IsOpen: true, modal_type: 'Error', modal_message: 'Could not complete request', insert: false });
            } else {
                this.setState({ request_status: res, modal_loading_IsOpen: false, modal_message_IsOpen: true, modal_type: 'Success', modal_message: 'Value was inserted successfully', insert: false });
            }
        });
    }

    submitNewScrapUpdate(badge, currentReason, newReason) {
        const data = {
            dxh_data_id: this.state.currentRow.dxhdata_id,
            productiondata_id: this.state.currentRow.productiondata_id,
            dt_reason_id: newReason.dtreason_id,
            setup_scrap: newReason.level === 'Setup' ?
                parseInt(this.state.currentRow.setup_scrap) - parseInt(currentReason.quantity) + parseInt(newReason.quantity) :
                parseInt(this.state.currentRow.setup_scrap),
            other_scrap: newReason.level === 'Production' ?
                parseInt(this.state.currentRow.other_scrap) - parseInt(currentReason.quantity) + parseInt(newReason.quantity) :
                parseInt(this.state.currentRow.other_scrap),
            clocknumber: badge,
            quantity: parseInt(newReason.quantity),
            responsible: newReason.responsible,
            dtdata_id: parseInt(currentReason.dtdata_id),
            timestamp: getCurrentTime(this.props.user.timezone),
            asset_code: this.props.selectedAssetOption.asset_code
        }

        this.setState({ modal_loading_IsOpen: true }, async () => {
            let res = await getResponseFromGeneric('put', API, '/scrap_values', {}, {}, data);

            if (res.status !== 200) {
                this.setState({
                    modal_loading_IsOpen: false,
                    modal_message_IsOpen: true,
                    modal_type: 'Error',
                    modal_message: 'Scrap Entries unsaved',
                    insert: false,
                    currentReason: {},
                    newReason: {}
                });
            } else {
                this.setState({
                    request_status: res,
                    modal_loading_IsOpen: false,
                    modal_message_IsOpen: true,
                    modal_type: 'Success',
                    modal_message: 'Scrap Entries Saved',
                    insert: false,
                    currentReason: {},
                    newReason: {}
                });
                this.loadData(this.props);
            }
        });
    }

    closeModal = () => {
        this.setState({
            modal_message_IsOpen: false,
            modal_loading_IsOpen: false,
            modal_validate_IsOpen: false
        });
        if (this.state.modal_type === 'Success') {
            this.props.Refresh(this.props.parentData);
        }
    }

    render() {
        const selectStyles = {
            control: base => ({
                ...base,
                height: 35,
                minHeight: 35
            })
        }
        const props = this.props;
        const t = props.t;
        return (
            <React.Fragment>
                <Modal
                    size="xl"
                    aria-labelledby="example-modal-sizes-title-xl"
                    className='scrapModal'
                    centered
                    show={props.isOpen}
                    onHide={props.onRequestClose}>
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            {t('Scrap')}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row className="new-timeloss-data" style={{ marginBottom: '5px' }}>
                            <Col sm={4} md={4}>
                                <span className="dashboard-modal-field-group">
                                    <p>{this.props.t('Part Number')}:</p>
                                    <Form.Control
                                        style={{ paddingTop: '5px' }}
                                        disabled={true}
                                        value={this.state.currentRow.product_code}>
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
                                        value={this.state.currentRow.actual || 0}>
                                    </Form.Control>
                                </span>
                            </Col>
                        </Row>

                        <ReasonTable
                            t={t}
                            productionRow={this.state.currentRow}
                            user={this.props.user}
                            Refresh={this.props.Refresh}
                            type={'Scrap'}
                            dxhdataList={this.state.scrapTableList}
                            base={this.state.adjustedActualValue}
                            setupReasonsOptions={this.state.setupReasonsOptions}
                            productionReasonsOptions={this.state.productionReasonsOptions}
                            allReasonOptions={this.state.allReasonOptions}
                            levelOptions={this.state.scrapTypeOptions}
                            responsibleOptions={this.state.responsibleOptions}
                            acceptNewReason={this.acceptNewScrap}
                            parentData={this.props.parentData}
                            isEditable={this.props.isEditable}
                        />

                        <span className={"new-timelost-label"}>{t('New ' + this.state.scrapType.value + ' Scrap Entry')}</span>
                        <div className="new-timeloss">
                            <Row style={{ marginBottom: '1px' }}>
                                <Col sm={4} md={4}>
                                    <span className="dashboard-modal-field-group"><p>{this.props.t('Scrap Quantity')}:</p>
                                        <input
                                            value={this.state.quantityValue}
                                            type="number"
                                            onChange={e => this.onChangeInput(e, 'quantityValue')}
                                            className="form-control"
                                            style={{ paddingTop: '5px' }}
                                            min='0'
                                            max={this.state.currentRow.adjusted_actual}
                                            disabled={!this.props.isEditable} />
                                    </span>
                                </Col>
                                <Col sm={6} md={6}>
                                    <p style={{ paddingBottom: '1px', marginBottom: '5px' }}>{t('Scrap Type')}:</p>
                                    <Form.Group controlId="formGridState1">
                                        <ReactSelect
                                            value={this.state.scrapType}
                                            onChange={(e) => this.onChangeSelectType(e, 'scrapType')}
                                            options={this.state.scrapTypeOptions}
                                            className={"react-select-container"}
                                            styles={selectStyles}
                                            isDisabled={!this.props.isEditable}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col sm={4} md={4}>
                                    {this.state.reasonVisible ?
                                        <span className="dashboard-modal-field-group"><p>{this.props.t('Existing Quantity')}:</p>
                                            <input
                                                value={this.state.actualReasonValue}
                                                type="number"
                                                onChange={e => this.onChangeInput(e, 'actualReasonValue')}
                                                className="form-control"
                                                style={{ paddingTop: '5px' }}
                                                disabled={true} />
                                        </span> :
                                        null
                                    }
                                </Col>
                                <Col sm={6} md={6}>
                                    <p style={{ paddingBottom: '1px', marginBottom: '5px' }}>{t('Select ' + this.state.scrapType.value + ' Code')}:</p>
                                    <Form.Group controlId="formGridState">
                                        <ReactSelect
                                            value={this.state.selectedReason}
                                            onChange={(e) => this.onChangeSelect(e, 'selectedReason')}
                                            options={this.state.scrapType.value === 'Setup' ? this.state.setupReasonsOptions : this.state.productionReasonsOptions}
                                            className={"react-select-container"}
                                            styles={selectStyles}
                                            isDisabled={!this.props.isEditable}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col sm={4} md={4}>
                                    {this.state.reasonVisible ?
                                        <span className="dashboard-modal-field-group"><p>{this.props.t('New Scrap Quantity')}:</p>
                                            <input
                                                value={this.state.actualReasonValue + this.state.quantityValue}
                                                type="number"
                                                className="form-control"
                                                style={{ paddingTop: '5px' }}
                                                disabled={true} />
                                        </span> :
                                        null
                                    }
                                </Col>
                                <Col sm={6} md={6}>
                                    <p style={{ paddingBottom: '1px', marginBottom: '5px' }}>{t('Select Responsable Area')}:</p>
                                    <Form.Group controlId="formGridState">
                                        <ReactSelect
                                            value={this.state.selectedResponsible}
                                            onChange={(e) => this.onChangeSelectGeneric(e, 'selectedResponsible')}
                                            options={this.state.responsibleOptions}
                                            className={"react-select-container"}
                                            styles={selectStyles}
                                            isDisabled={!this.props.isEditable}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <div className={'new-timeloss-button'}>
                                <Button
                                    variant="outline-primary"
                                    style={{ marginTop: '10px' }}
                                    disabled={!this.props.isEditable}
                                    onClick={() => this.submitReason()}>{this.props.t('Submit')}</Button>
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
                    </Modal.Body>
                    <Modal.Footer>
                        <div className={'new-timeloss-close'}>
                            <Button variant="outline-secondary"
                                style={{ marginTop: '10px', marginLeft: '10px' }}
                                onClick={this.props.onRequestClose}>{t('Close')}</Button>
                        </div>
                    </Modal.Footer>
                </Modal>
                <MessageModal
                    isOpen={this.state.modal_message_IsOpen}
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
                <BarcodeScannerModal
                    isOpen={this.state.modal_validate_IsOpen}
                    modalTitle={'Operator Scan'}
                    inputText={'Please scan badge to proceed'}
                    onRequestClose={this.closeModal}
                    t={t}
                    responseScan={this.handleScan}
                />
            </React.Fragment>
        )
    }
}

export default ScrapModal;