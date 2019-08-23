import React from  'react';
import Modal from 'react-modal';
import { Form, Button, Row, Col, Table } from 'react-bootstrap';
import * as _ from  'lodash';
import './TimelossModal.scss';
import ReactSelect from 'react-select';
import { sendPut } from '../Utils/Requests';
import ConfirmModal from  '../Layout/ConfirmModal';
import LoadingModal from  '../Layout/LoadingModal';
import ErrorModal from  '../Layout/ErrorModal';
import { timelossGetReasons as getReasons, formatDateWithTime, getCurrentTime } from '../Utils/Requests';



class TimelossModal extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            value : this.props.currentVal,
            newValue: '',
            break_time: 0,
            setup_time: 0,
            validationMessage: '',
            time_to_allocate: 0,
            unallocated_time: 0,
            allowSubmit: false,
            new_tl_reason: '',
            modal_confirm_IsOpen: false,
            modal_loading_IsOpen: false,
            modal_error_IsOpen: false, 
        } 
        this.submit = this.submit.bind(this);
        this.onChange = this.onChange.bind(this);
        this.allocateTime = this.allocateTime.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.validate = this.validate.bind(this);
    }

    submit(e) {
        const data = {
        dxh_data_id: this.props.currentRow ? this.props.currentRow.dxhdata_id : undefined,
        dt_reason_id: this.state.new_tl_reason.value,
        dt_minutes: parseInt(this.state.time_to_allocate),
        clocknumber: this.props.user.clock_number ? this.props.user.clock_number : undefined,
        first_name: this.props.user.clock_number ? undefined : this.props.user.first_name,
        last_name: this.props.user.clock_number ? undefined : this.props.user.last_name,
        asset_code: this.props.parentData[0],
        row_timestamp: formatDateWithTime(this.props.currentRow.hour_interval_start),
        timestamp: getCurrentTime(),
        }
        this.setState({modal_loading_IsOpen: true}, () => {
            const response = sendPut(data, '/dt_data');
            response.then((res) => {
                if (res !== 200) {
                    this.setState({modal_error_IsOpen: true})
                } else {
                    this.setState({request_status: res, modal_confirm_IsOpen: true, modal_loading_IsOpen: false})
                }
                this.props.Refresh(this.props.parentData);
                this.props.onRequestClose();
            })
        })
    }

    onChange(e) {
        this.setState({newValue: e.target.value});
    }
    

    componentWillMount() {
        const reasons = getReasons(this.props.machine);
        reasons.then((res) => this.setState({
            reasons: res,
            timelost: this.props.timelost,
        }))
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.currentRow){
        const total =  this.calculateTotal(
            nextProps, 
            nextProps.currentRow.summary_setup_minutes, 
            nextProps.currentRow.summary_breakandlunch_minutes);
        this.setState({
            timelost: nextProps.timelost,
            allocated_time: total,
            unallocated_time: 60 - total > 0 ? 60 - total : 0,
        })
        if (nextProps.currentRow) {
            this.setState({
                setup_time: nextProps.currentRow.summary_setup_minutes || 0,
                break_time: nextProps.currentRow.summary_breakandlunch_minutes || 0
            })
        }
        }
    }

    calculateTotal(nextProps, setupTime, breakTime) {
        let allocated_time = setupTime + breakTime;
        if (nextProps.timelost) {
            for (let i of nextProps.timelost) {
                allocated_time = allocated_time + i.dtminutes;
            }
        }
        return allocated_time;
    }

    allocateTime(e) {
        const value = parseInt(e.target.value);
        const max = this.state.unallocated_time;
        if (value >= max) {
            this.setState({validationMessage: 'Error: The time to allocate exceedes the maximum allowed', time_to_allocate: value})
        } else {
            this.setState({time_to_allocate: value, validationMessage: ''});
        }
    }

    validate(unallocated, allocate, reason) {
        const {unallocated_time, time_to_allocate, new_tl_reason, allowSubmit} = this.state;
        console.log({unallocated_time, time_to_allocate, new_tl_reason, allowSubmit})
        if (this.state.time_to_allocate < this.state.unallocated_time && this.state.new_tl_reason !== '') {
            this.setState({allowSubmit: false});
        }
    }

    closeModal() {
        this.setState({modal_confirm_IsOpen: false, modal_loading_IsOpen: false, modal_error_IsOpen: false});
    }

    render() {
        const styles = _.cloneDeep(this.props.style);
        if (!_.isEmpty(styles)) {
            styles.content.width = '50%';
            styles.content.overflow = 'visible';
        }
        const reasons = [];
        if (this.state.reasons) {
            for (let reason of this.state.reasons)
                reasons.push({value: reason.DTReason.dtreason_id, label: `${reason.DTReason.dtreason_id} - ${reason.DTReason.dtreason_name}`})
        }
        const t = this.props.t;
            return (
                <React.Fragment>
                    <Modal
                    isOpen={this.props.isOpen}
                    onRequestClose={this.props.onRequestClose}
                    style={styles}
                    contentLabel="Example Modal">
                        <span className="close-modal-icon" onClick={this.props.onRequestClose}>X</span>
                        <span><h4 style={{marginLeft: '10px'}}>{t('Timelost')}</h4></span>
                        <Row className="new-timeloss-data" style={{marginBottom: '5px'}}>
                            <Col sm={4} md={4} className="total-timeloss number-field timeloss-top">
                                <p>{t('Total Timelost')}</p>
                                <input type="text" disabled={true} value={this.state.allocated_time}></input>
                            </Col>
                            <Col sm={4} md={4} className="breaktime-timeloss number-field timeloss-top">
                                <p>{t('Lunch/Break Time')}</p>
                                <input type="text" disabled={true} value={this.state.break_time}></input>
                            </Col>
                            <Col sm={4} md={4} className="setup-timeloss number-field timeloss-top">
                                <p>{t('Setup Time')}</p>
                                <input type="text" disabled={true} value={this.state.setup_time}></input>
                            </Col>
                        </Row>
                        <div className="timeloss-table">
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                <th style={{width: '10%'}}>{t('Time')}</th>
                                <th style={{width: '20%'}}>{t('Timelost Code')}</th>
                                <th style={{width: '40%'}}>{t('Reason')}</th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                this.state.timelost ? this.state.timelost.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{item.dtminutes}</td>
                                            <td>{item.dtreason_code}</td>
                                            <td>{item.dtreason_name}</td>
                                        </tr>) 
                                }): <tr>
                                    <td colSpan={3}>{'No Timelost entries yet.'}</td>
                                </tr>
                             }
                            </tbody>
                        </Table>
                        </div>
                            <span className={"new-timelost-label"}>{t('New Timelost Entry')}</span>
                            <div className="new-timeloss">
                                <Row style={{marginBottom: '1px'}}>
                                    <Col sm={6} md={4}>
                                        <p style={{marginBottom: '1px'}}>{`${t('Unallocated Timelost')}:`}</p>
                                        <input className={'timelost-field'} 
                                        type="text"
                                        disabled={true}
                                        value={this.state.unallocated_time}></input>
                                    </Col>
                                    <Col sm={6} md={5}  style={{marginBottom: '5px'}}>
                                        <p style={{marginBottom: '1px'}}>{`${t('Time to allocate (minutes)')}:`}</p>
                                        <input className={'timelost-field'} type="number" 
                                        value={this.state.time_to_allocate} 
                                        onChange={this.allocateTime}></input>
                                    </Col>
                                    <Col sm={6} md={3}  style={{marginBottom: '5px'}}>
                                        <p style={{marginTop: '5px', color: 'red'}}>{this.state.validationMessage}</p>
                                    </Col>
                                </Row>
                                <div className="new-timeloss-reasoncode">
                                    <p style={{paddingBottom: '1px', marginBottom: '5px'}}>{this.props.label ? this.props.label : t('New Value')}:</p>
                                    <Form.Group controlId="formGridState">
                                    <ReactSelect
                                        value={this.state.new_tl_reason}
                                        onChange={(e)=> this.setState({new_tl_reason: e})}
                                        options={reasons}
                                        className={"react-select-container"}
                                        classNamePrefix={"react_control"}
                                    />
                                    </Form.Group>
                                </div>
                                <div className={'new-timeloss-button'}>
                                    <Button variant="outline-primary" 
                                    style={{marginTop: '30px', marginLeft: '10px'}} 
                                    disabled={this.state.allowSubmit} 
                                    onClick={this.submit}>{t('Submit')}</Button>
                                </div>
                            </div>
                            <div className={'new-timeloss-close'}>
                                <Button variant="outline-secondary" 
                                style={{marginTop: '10px', marginLeft: '10px'}} 
                                onClick={this.props.onRequestClose}>{t('Close')}</Button>
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