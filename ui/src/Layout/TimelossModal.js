import React from 'react';
import Modal from 'react-modal';
import { Form, Button, Row, Col, Table } from 'react-bootstrap';
import * as _ from 'lodash';
import './TimelossModal.scss';
import ReactSelect from 'react-select';
import { sendPut } from '../Utils/Requests';
import ConfirmModal from '../Layout/ConfirmModal';
import LoadingModal from '../Layout/LoadingModal';
import ErrorModal from '../Layout/ErrorModal';
import {
    formatDateWithTime,
    getCurrentTime,
    formatNumber,
    BuildGet
} from '../Utils/Requests';
import { API } from '../Utils/Constants';
const axios = require('axios');

class TimelossModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.currentVal,
            newValue: '',
            break_time: 0,
            setup_time: 0,
            validationMessage: '',
            time_to_allocate: 0,
            unallocated_time: 0,
            allocated_time: 0,
            allowSubmit: true,
            timelost: [],
            currentRow: {},
            new_tl_reason: '',
            modal_confirm_IsOpen: false,
            modal_loading_IsOpen: false,
            modal_error_IsOpen: false,
            changed: false
        }
        this.submit = this.submit.bind(this);
        this.onChange = this.onChange.bind(this);
        this.allocateTime = this.allocateTime.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.validate = this.validate.bind(this);
        this.closeTimeloss = this.closeTimeloss.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.currentRow && nextProps.isOpen) {
            this.loadData(nextProps);
        }
    }

    submit(e) {
        const data = {
            dxh_data_id: this.props.currentRow ? this.props.currentRow.dxhdata_id : undefined,
            dt_reason_id: this.state.new_tl_reason.reason_id,
            dt_minutes: parseInt(this.state.time_to_allocate),
            clocknumber: this.props.user.clock_number ? this.props.user.clock_number : undefined,
            first_name: this.props.user.clock_number ? undefined : this.props.user.first_name,
            last_name: this.props.user.clock_number ? undefined : this.props.user.last_name,
            asset_code: this.props.parentData[0],
            row_timestamp: formatDateWithTime(this.props.currentRow.hour_interval_start),
            timestamp: getCurrentTime(this.props.timezone)
        }
        this.setState({ modal_loading_IsOpen: true }, () => {
            const response = sendPut(data, '/dt_data');
            response.then((res) => {
                if (res !== 200) {
                    this.setState({ modal_error_IsOpen: true })
                } else {
                    this.setState({ request_status: res, modal_confirm_IsOpen: true, modal_loading_IsOpen: false })
                }
                this.props.Refresh(this.props.parentData);
                this.setState({ new_tl_reason: '', allowSubmit: true, time_to_allocate: 0 })
                this.closeTimeloss();
            })
        })
    }

    onChange(e) {
        this.setState({ newValue: e.target.value });
    }

    loadData(props) {
        let time = 0;
        if (this.state.changed === false) {
            time = props.currentRow.allocated_time
        } else {
            time = this.state.time_to_allocate
        }

        const parameters = {
            params: {
                mc: props.machine,
                dxh_data_id: props.currentRow.dxhdata_id
            }
        }
        let requestData = [
            BuildGet(`${API}/timelost_reasons`, parameters),
            BuildGet(`${API}/timelost_dxh_data`, parameters)
        ];

        let _this = this;

        this.setState({ modal_loading_IsOpen: true }, () => {
            axios.all(requestData).then(
                axios.spread((responseReasons, responseTimeLost) => {
                    _this.setState({
                        modal_loading_IsOpen: false,
                        timelost: responseTimeLost.data,
                        allocated_time: props.currentRow.allocated_time,
                        unallocated_time: props.currentRow.unallocated_time,
                        time_to_allocate: time,
                        setup_time: props.currentRow.summary_setup_minutes || 0,
                        break_time: props.currentRow.summary_breakandlunch_minutes || 0,
                        reasons: responseReasons.data,
                        currentRow: props.currentRow
                    });
                })
            ).catch(function (error) {
                console.log(error);
            });
        });
    }

    closeTimeloss() {
        this.setState({
            validationMessage: '',
            time_to_allocate: 0,
            unallocated_time: 0,
            new_tl_reason: '',
            allowSubmit: true
        });
        this.props.onRequestClose();
    }

    allocateTime(e) {
        const value = parseInt(e.target.value);
        const max = Math.round(this.state.allocated_time);
        if (value > max) {
            this.setState({ validationMessage: 'Error: The time to allocate exceedes the maximum allowed.', time_to_allocate: value, allowSubmit: true, changed: true })
        }
        else if (value === 0) {
            this.setState({ validationMessage: 'Error: You must enter a value greater than zero.', time_to_allocate: value, allowSubmit: true, changed: true })
        }
        else {
            !isNaN(value) ? this.setState({ time_to_allocate: value, validationMessage: '' }, this.validate(value)) :
                this.setState({ time_to_allocate: 1, validationMessage: '', changed: true }, this.validate(1));
        }
    }

    validate(e) {
        const value = e || this.state.time_to_allocate;
        if ((!isNaN(value)) &&
            (this.state.new_tl_reason !== '') &&
            (value > 0) &&
            (Math.round(value) <= Math.round(this.state.allocated_time))) {
            this.setState({ allowSubmit: false });
        }
    }

    closeModal() {
        this.setState({ modal_confirm_IsOpen: false, modal_loading_IsOpen: false, modal_error_IsOpen: false, allowSubmit: true });
        this.props.onRequestClose();
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
        const reasons = [];
        if (this.state.reasons) {
            for (let reason of this.state.reasons)
                reasons.push({ value: reason.DTReason.reason_code, label: `${reason.DTReason.reason_code} - ${reason.DTReason.dtreason_name}`, reason_id: reason.DTReason.dtreason_id })
        }
        const t = this.props.t;
        return (
            <React.Fragment>
                <Modal
                    isOpen={this.props.isOpen}
                    onRequestClose={this.closeTimeloss}
                    style={styles}
                    contentLabel="Example Modal">
                    <span className="close-modal-icon" onClick={this.closeTimeloss}>X</span>
                    <span><h4 style={{ marginLeft: '10px' }}>{t('Time Lost')}</h4></span>
                    <Row className="new-timeloss-data" style={{ marginBottom: '5px' }}>
                        <Col sm={4} md={4} className="total-timeloss number-field timeloss-top">
                            <p>{t('Time Lost')}</p>
                            <input type="text" disabled={true} value={formatNumber(this.state.unallocated_time)}></input>
                        </Col>
                        <Col sm={4} md={4} className="breaktime-timeloss number-field timeloss-top">
                            <p>{t('Lunch/Break Time')}</p>
                            <input type="text" disabled={true} value={formatNumber(this.state.break_time)}></input>
                        </Col>
                        <Col sm={4} md={4} className="setup-timeloss number-field timeloss-top">
                            <p>{t('Setup Time')}</p>
                            <input type="text" disabled={true} value={formatNumber(this.state.setup_time)}></input>
                        </Col>
                    </Row>
                    <div className="timeloss-table">
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th style={{ width: '10%' }}>{t('Time')}</th>
                                    <th style={{ width: '20%' }}>{t('Time Lost Code')}</th>
                                    <th style={{ width: '40%' }}>{t('Reason')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.timelost.length > 0 ? this.state.timelost.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{item.dtminutes}</td>
                                                <td>{item.dtreason_code}</td>
                                                <td>{item.dtreason_name}</td>
                                            </tr>)
                                    }) : <tr>
                                            <td colSpan={3}>{t('No Time Lost entries yet')}.</td>
                                        </tr>
                                }
                            </tbody>
                        </Table>
                    </div>
                    <span className={"new-timelost-label"}>{t('New Time Lost Entry')}</span>
                    <div className="new-timeloss">
                        <Row style={{ marginBottom: '1px' }}>
                            <Col sm={6} md={4}>
                                <p style={{ marginBottom: '1px' }}>{`${t('Unallocated Time Lost')}:`}</p>
                                <input className={'timelost-field'}
                                    type="text"
                                    disabled={true}
                                    value={formatNumber(this.state.allocated_time)}></input>
                            </Col>
                            <Col sm={6} md={5} style={{ marginBottom: '5px' }}>
                                <p style={{ marginBottom: '1px' }}>{`${t('Time to allocate (minutes)')}:`}</p>
                                <input className={'timelost-field'}
                                    type="number"
                                    min="0"
                                    disabled={!this.props.isEditable}
                                    value={this.state.time_to_allocate}
                                    autoFocus
                                    onChange={this.allocateTime}></input>
                            </Col>
                            <Col sm={6} md={3} style={{ marginBottom: '5px' }}>
                                <p style={{ marginTop: '5px', color: 'red', fontSize: '0.8em' }}>{this.state.validationMessage}</p>
                            </Col>
                        </Row>
                        <div className="new-timeloss-reasoncode">
                            <p style={{ paddingBottom: '1px', marginBottom: '5px' }}>{this.props.label ? this.props.label : t('New Value')}:</p>
                            <Form.Group controlId="formGridState">
                                <ReactSelect
                                    value={this.state.new_tl_reason}
                                    onChange={(e) => this.setState({ new_tl_reason: e }, (e) => this.validate(e))}
                                    options={reasons}
                                    className={"react-select-container"}
                                    classNamePrefix={"react_control"}
                                    styles={selectStyles}
                                    isDisabled={!this.props.isEditable}
                                />
                            </Form.Group>
                        </div>
                        <div className={'new-timeloss-button'}>
                            <Button variant="outline-primary"
                                style={{ marginTop: '30px' }}
                                disabled={this.state.allowSubmit || !this.props.isEditable}
                                onClick={this.submit}>{t('Submit')}
                            </Button>
                        </div> {!this.props.isEditable ? <span style={{ color: 'grey' }}>{t('Read-Only')}</span> : null}
                    </div>
                    <div className={'new-timeloss-close'}>
                        <Button variant="outline-secondary"
                            style={{ marginTop: '10px', marginLeft: '10px' }}
                            onClick={this.closeTimeloss}>{t('Close')}</Button>
                    </div>
                </Modal>
                <ConfirmModal
                    isOpen={this.state.modal_confirm_IsOpen}
                    //  onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    contentLabel="Example Modal"
                    shouldCloseOnOverlayClick={false}
                    message={'Timeloss was inserted.'}
                    title={'Request Successful'}
                    t={this.props.t}
                />
                <LoadingModal
                    isOpen={this.state.modal_loading_IsOpen}
                    //  onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    contentLabel="Example Modal"
                    t={this.props.t}
                />
                <ErrorModal
                    isOpen={this.state.modal_error_IsOpen}
                    //  onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    contentLabel="Example Modal"
                    t={this.props.t}
                    message={this.state.errorMessage}
                />
            </React.Fragment>
        )
    }
}

Modal.setAppElement('#root');
export default TimelossModal;