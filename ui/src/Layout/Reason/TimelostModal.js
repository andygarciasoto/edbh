import React from 'react';
import Modal from 'react-modal';
import { Form, Button, Row, Col } from 'react-bootstrap';
import MessageModal from '../MessageModal';
import LoadingModal from '../LoadingModal';
import { getResponseFromGeneric, getCurrentTime } from '../../Utils/Requests';
import ReactSelect from 'react-select';
import { validateTimeLostSubmit } from '../../Utils/FormValidations';
import { API } from '../../Utils/Constants';
import './ModalStyle.scss';
import * as _ from 'lodash';
import ReasonTable from './ReasonTable'
const axios = require('axios');

class TimelostModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = Object.assign(this.getInitialState(props));
    }

    getInitialState(props) {
        return {
            isOpen: props.isOpen,
            modal_loading_IsOpen: false,
            modal_message_isOpen: false,
            modal_type: '',
            modal_message: '',
            currentRow: {},
            quantityValue: 0,
            selectedReason: null,
            allReasonOptions: [],
            setupReasonsOptionsFilter: [],
            productionReasonsOptionsFilter: [],
            allocated_time: 0,
            adjustedValue: 0,
            timelossTableList: [],
            reasonVisible: false,
            actualReasonValue: 0
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (!nextProps.isOpen) {
            return {
                isOpen: nextProps.isOpen,
                currentRow: {}
            };
        }
        if ((nextProps.isOpen && nextProps.isOpen !== prevState.isOpen && nextProps.currentRow && nextProps.currentRow.dxhdata_id && nextProps.currentRow.productiondata_id) ||
            (nextProps.isOpen && nextProps.isOpen === prevState.isOpen && !_.isEqual(nextProps.currentRow, prevState.currentRow))) {
            return {
                isOpen: nextProps.isOpen,
                currentRow: nextProps.currentRow,
                allocated_time: parseInt(nextProps.currentRow.allocated_time),
                adjustedValue: parseInt(nextProps.currentRow.allocated_time),
                quantityValue: 0,
                reasonVisible: false,
                actualReasonValue: 0,
                selectedReason: null
            };
        }
        return null;
    }

    componentDidUpdate(prevProps, prevState) {
        if (!_.isEqual(this.state.currentRow, prevState.currentRow)) {
            this.setState({ modal_loading_IsOpen: true }, () => {
                this.loadData(this.props);
            });
        }
    }

    onChangeInput = (e, field) => {
        this.setState({
            [field]: parseInt(e.target.value),
            adjustedValue: parseInt(this.state.allocated_time) - parseInt(e.target.value)
        });
    }

    onChangeSelect = (e, field) => {
        let reason = _.find(this.state.timelossTableList, { dtreason_id: e.dtreason_id });
        this.setState({
            [field]: e,
            actualReasonValue: reason ? reason.dtminutes : 0,
            reasonVisible: reason ? true : false
        });
    }

    loadData(props) {

        let asset_code = props.parentData[0] === 'No Data' ? null : props.parentData[0];
        const param1 = {
            mc: asset_code,
            type: 'downtime',
            dxh_data_id: this.state.currentRow.dxhdata_id,
            productiondata_id: this.state.currentRow.productiondata_id
        }

        let requestArray = [
            getResponseFromGeneric('get', API, '/reasons', {}, param1, {}),
            getResponseFromGeneric('get', API, '/dxh_data', {}, param1, {})
        ];

        axios.all(requestArray).then(
            axios.spread((...responses) => {

                _.forEach(responses[0], reason => {
                    reason.label = reason.dtreason_name;
                    reason.value = reason.dtreason_id;
                });

                this.setState({
                    allReasonOptions: responses[0],
                    timelossTableList: responses[1],
                    modal_loading_IsOpen: false
                });
            })
        );
    }

    submitReason = () => {

        const validation = validateTimeLostSubmit(this.state);
        if (validation.error) {
            this.setState({ modal_loading_IsOpen: false, modal_message_isOpen: true, modal_type: 'Error', modal_message: validation.modal_message });
            return;
        }

        const asset = _.find(this.props.user.sites, { asset_id: this.props.user.site });

        let data = {
            dxh_data_id: this.state.currentRow.dxhdata_id,
            productiondata_id: this.state.currentRow.productiondata_id,
            dt_reason_id: this.state.selectedReason.dtreason_id,
            dt_minutes: parseInt(this.state.quantityValue),
            clocknumber: this.props.user.clock_number ? this.props.user.clock_number : undefined,
            first_name: this.props.user.clock_number ? undefined : this.props.user.first_name,
            last_name: this.props.user.clock_number ? undefined : this.props.user.last_name,
            timestamp: getCurrentTime(this.props.user.timezone),
            asset_code: asset.asset_code
        };

        const reasonCode = _.find(this.state.timelossTableList, { dtreason_id: data.dt_reason_id }) || {};
        if (reasonCode.dtreason_id) {
            data.dt_minutes += reasonCode.dtminutes;
            data.dtdata_id = reasonCode.dtdata_id;
        }

        this.setState({ modal_loading_IsOpen: true }, async () => {
            let res = await getResponseFromGeneric('put', API, '/dt_data', {}, {}, data);
            if (res.status !== 200) {
                this.setState({ modal_loading_IsOpen: false, modal_message_isOpen: true, modal_type: 'Error', modal_message: 'Time Lost Entries unsaved' });
            } else {
                this.setState({ request_status: res, modal_loading_IsOpen: false, modal_message_isOpen: true, modal_type: 'Success', modal_message: 'Time Lost Entries Saved' });
            }
        });
    }

    acceptNewReason = (currentReason, newReason) => {
        if ((currentReason.dtminutes !== newReason.dtminutes) ||
            (currentReason.dtreason_id !== newReason.dtreason_id)) {

            const asset = _.find(this.props.user.sites, { asset_id: this.props.user.site });
            const data = {
                dxh_data_id: this.state.currentRow.dxhdata_id,
                productiondata_id: this.state.currentRow.productiondata_id,
                dt_reason_id: newReason.dtreason_id,
                dt_minutes: parseInt(newReason.dtminutes),
                dtdata_id: parseInt(currentReason.dtdata_id),
                clocknumber: this.props.user.clock_number ? this.props.user.clock_number : undefined,
                first_name: this.props.user.clock_number ? undefined : this.props.user.first_name,
                last_name: this.props.user.clock_number ? undefined : this.props.user.last_name,
                timestamp: getCurrentTime(this.props.user.timezone),
                asset_code: asset.asset_code
            }

            this.setState({ modal_loading_IsOpen: true }, async () => {
                let res = await getResponseFromGeneric('put', API, '/dt_data', {}, {}, data);

                if (res.status !== 200) {
                    this.setState({ modal_loading_IsOpen: false, modal_message_isOpen: true, modal_type: 'Error', modal_message: 'Time Lost Entries unsaved' });
                } else {
                    this.setState({ request_status: res, modal_loading_IsOpen: false, modal_message_isOpen: true, modal_type: 'Success', modal_message: 'Time Lost Entries Saved' });
                    this.loadData(this.props);
                }
            });
        } else {
            this.setState({
                modal_message_isOpen: true,
                modal_type: 'Error',
                modal_message: `Any change detected`
            });
        }
    }

    closeModal = () => {
        this.setState({ modal_message_isOpen: false, modal_loading_IsOpen: false });
        if (this.state.modal_type === 'Success') {
            this.props.Refresh(this.props.parentData);
        }
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
                        <span><h4 style={{ marginLeft: '10px' }}>{t('Time Lost')}</h4></span>
                        <Row className="new-timeloss-data" style={{ marginBottom: '5px' }}>
                            <Col sm={4} md={4}>
                                <span className="dashboard-modal-field-group">
                                    <p>{this.props.t('Time Lost')}:</p>
                                    <Form.Control
                                        style={{ paddingTop: '5px' }}
                                        disabled={true}
                                        value={this.state.currentRow.unallocated_time}>
                                    </Form.Control>
                                </span>
                            </Col>
                            <Col sm={4} md={4}>
                                <span className="dashboard-modal-field-group">
                                    <p>{this.props.t('Lunch/Break Time')}:</p>
                                    <Form.Control
                                        style={{ paddingTop: '5px' }}
                                        type={this.props.formType}
                                        disabled={true}
                                        value={this.state.currentRow.summary_breakandlunch_minutes || 0}>
                                    </Form.Control>
                                </span>
                            </Col>
                            <Col sm={4} md={4}>
                                <span className="dashboard-modal-field-group">
                                    <p>{this.props.t('Setup Time')}:</p>
                                    <Form.Control
                                        style={{ paddingTop: '5px' }}
                                        type={this.props.formType}
                                        disabled={true}
                                        value={this.state.currentRow.summary_setup_minutes || 0}>
                                    </Form.Control>
                                </span>
                            </Col>
                        </Row>

                        <ReasonTable
                            style={styles}
                            t={t}
                            productionRow={this.state.currentRow}
                            user={this.props.user}
                            Refresh={this.props.Refresh}
                            type={'Timelost'}
                            dxhdataList={this.state.timelossTableList}
                            base={this.state.allocated_time}
                            allReasonOptions={this.state.allReasonOptions}
                            acceptNewReason={this.acceptNewReason}
                            parentData={this.props.parentData}
                            readOnly={this.props.readOnly}
                        />

                        <span className={"new-timelost-label"}>{t('New Time Lost Entry')}</span>
                        <div className="new-timeloss">
                            <Row style={{ marginBottom: '1px' }}>
                                <Col sm={4} md={4}>
                                    <span className="dashboard-modal-field-group"><p>{this.props.t('Time to allocate (minutes)')}:</p>
                                        <input
                                            value={this.state.quantityValue}
                                            type="number"
                                            onChange={e => this.onChangeInput(e, 'quantityValue')}
                                            className="form-control"
                                            style={{ paddingTop: '5px' }}
                                            min='0'
                                            max={this.state.currentRow.allocated_time}
                                            disabled={this.props.readOnly || this.state.editReason} />
                                    </span>
                                </Col>
                                <Col sm={6} md={6}>
                                    <p style={{ paddingBottom: '1px', marginBottom: '5px' }}>{t('Search/Select Reason Code')}:</p>
                                    <Form.Group controlId="formGridState">
                                        <ReactSelect
                                            value={this.state.selectedReason}
                                            onChange={(e) => this.onChangeSelect(e, 'selectedReason')}
                                            options={this.state.allReasonOptions}
                                            className={"react-select-container"}
                                            styles={selectStyles}
                                            isDisabled={this.props.readOnly || this.state.editReason}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col sm={4} md={4}>
                                    {this.state.reasonVisible ?
                                        <span className="dashboard-modal-field-group"><p>{this.props.t('Existing Allocate Time')}:</p>
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
                                <Col sm={6} md={6}></Col>
                                <Col sm={4} md={4}>
                                    {this.state.reasonVisible ?
                                        <span className="dashboard-modal-field-group"><p>{this.props.t('New Allocate Time')}:</p>
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
                            </Row>
                            <div className={'new-timeloss-button'}>
                                <Button
                                    variant="outline-primary"
                                    style={{ marginTop: '10px' }}
                                    disabled={this.props.readOnly || this.state.editReason}
                                    onClick={() => this.submitReason()}>{this.props.t('Submit')}</Button>
                                {this.props.readOnly ? <div><span style={{ color: 'grey' }}>{this.props.t('Read-Only')}</span></div> : null}
                            </div>
                            <Col sm={4} md={4}>
                                <span className="dashboard-modal-field-group"><p>{this.props.t('Unallocated Time Lost')}:</p>
                                    <input
                                        value={this.state.adjustedValue || 0}
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
export default TimelostModal;