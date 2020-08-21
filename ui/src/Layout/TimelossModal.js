import React from 'react';
import Modal from 'react-modal';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { Form, Button, Row, Col, Nav } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import * as _ from 'lodash';
import './TimelossModal.scss';
import ReactSelect from 'react-select';
import LoadingModal from '../Layout/LoadingModal';
import {
    formatDateWithTime,
    getCurrentTime,
    formatNumber,
    getResponseFromGeneric
} from '../Utils/Requests';
import { API } from '../Utils/Constants';
import MessageModal from './MessageModal';

class TimelossModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = Object.assign(this.getInitialState(props), this.getTextTranslations(props));
    }

    getInitialState(props) {
        return {
            value: props.currentVal,
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
            editDTReason: false,
            currentDTReason: {},
            newDTReason: {},
            new_tl_reason: '',
            allDTReason: [],
            modal_confirm_IsOpen: false,
            modal_loading_IsOpen: false,
            modal_error_IsOpen: false,
            changed: false,
            actualDxH_Id: null,
            modal_message_isOpen: false,
            modal_type: '',
            modal_message: ''
        }
    }

    getTextTranslations(props) {
        return {
            timeText: props.t('Time'),
            timeLostCodeText: props.t('Time Lost Code'),
            reasonText: props.t('Reason')
        }
    }

    getColumns() {
        let columns = [
            {
                Header: this.getHeader(this.state.timeText),
                accessor: 'dtminutes',
                maxWidth: 127,
                Cell: c => this.renderCell(c.original, 'dtminutes')
            },
            {
                Header: this.getHeader(this.state.timeLostCodeText),
                accessor: 'dtreason_code',
                maxWidth: 256,
                Cell: c => this.renderCell(c.original, 'dtreason_code')
            },
            {
                Header: this.getHeader(this.state.reasonText),
                accessor: 'dtreason_name',
                maxWidth: 514,
                Cell: c => this.renderCell(c.original, 'dtreason_name')
            }
        ];

        if (this.state.editDTReason) {
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

    componentWillReceiveProps(nextProps) {
        if (nextProps.currentRow && nextProps.isOpen) {
            this.loadData(nextProps);
        }
    }

    submit = (e) => {
        const data = {
            dxh_data_id: this.props.currentRow ? this.props.currentRow.dxhdata_id : undefined,
            dt_reason_id: this.state.new_tl_reason.dtreason_id,
            dt_minutes: parseInt(this.state.time_to_allocate),
            clocknumber: this.props.user.clock_number ? this.props.user.clock_number : undefined,
            first_name: this.props.user.clock_number ? undefined : this.props.user.first_name,
            last_name: this.props.user.clock_number ? undefined : this.props.user.last_name,
            asset_code: this.props.parentData[0],
            row_timestamp: formatDateWithTime(this.props.currentRow.started_on_chunck),
            timestamp: getCurrentTime(this.props.user.timezone)
        }
        this.setState({ modal_loading_IsOpen: true }, async () => {
            let res = await getResponseFromGeneric('put', API, '/dt_data', {}, {}, data);
            if (res.status !== 200) {
                this.setState({ modal_loading_IsOpen: false, modal_message_isOpen: true, modal_type: 'Error', modal_message: 'Time Lost Entries unsaved' });
            } else {
                this.setState({ request_status: res, modal_loading_IsOpen: false, modal_message_isOpen: true, modal_type: 'Success', modal_message: 'Time Lost Entries Saved' });
            }
            this.props.Refresh(this.props.parentData);
            this.setState({ new_tl_reason: '', allowSubmit: true, time_to_allocate: 0 })
            this.closeTimeloss();
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
            mc: this.props.parentData[0] === 'No Data' ? null : this.props.parentData[0],
            dxh_data_id: props.currentRow.dxhdata_id
        }

        this.setState({ modal_loading_IsOpen: this.state.actualDxH_Id !== props.currentRow.dxhdata_id }, async () => {

            let resReason = await getResponseFromGeneric('get', API, '/timelost_reasons', {}, parameters, {}) || [];

            let reasonsOption = [];
            if (resReason) {
                _.forEach(resReason, reason => {
                    reasonsOption.push({ value: reason.dtreason_code, label: `${reason.dtreason_code} - ${reason.dtreason_name}`, dtreason_id: reason.dtreason_id });
                })
            }

            this.setState({
                modal_loading_IsOpen: false,
                allocated_time: props.currentRow.allocated_time,
                unallocated_time: props.currentRow.unallocated_time,
                time_to_allocate: time,
                setup_time: props.currentRow.summary_setup_minutes || 0,
                break_time: props.currentRow.summary_breakandlunch_minutes || 0,
                reasons: reasonsOption,
                currentRow: props.currentRow,
                actualDxH_Id: props.currentRow.dxhdata_id,
                allDTReason: resReason
            });

            let responseTimeLost = await getResponseFromGeneric('get', API, '/timelost_dxh_data', {}, parameters, {}) || [];

            this.setState({
                modal_loading_IsOpen: false,
                timelost: responseTimeLost
            });
        });
    }

    closeTimeloss = () => {
        this.setState({
            validationMessage: '',
            time_to_allocate: 0,
            unallocated_time: 0,
            new_tl_reason: '',
            allowSubmit: true,
            editDTReason: false
        });
        this.props.onRequestClose();
    }

    allocateTime = (e) => {
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

    closeModal = () => {
        this.setState({ modal_message_isOpen: false, modal_loading_IsOpen: false, allowSubmit: true, editDTReason: false });
        this.props.onRequestClose();
    }

    getHeader(text) {
        return <span className={'wordwrap left-align'} style={{ float: 'left' }} data-tip={text}><b>{text}</b></span>
    }

    renderCell(row, prop) {
        if (!this.state.editDTReason || row.dtdata_id !== this.state.currentDTReason.dtdata_id) {
            return <span>{row[prop]}</span>;
        } else {
            if (prop === 'dtminutes') {
                return <input type='number' autoFocus={this.state.editDTReason}
                    min='1' max={formatNumber(this.state.allocated_time) + formatNumber(this.state.currentDTReason.dtminutes)} value={this.state.newDTReason[prop]}
                    onChange={(e) => this.changeInputValue(e)}></input>
            } else if (prop === 'dtreason_code') {
                return <ReactSelect
                    value={{
                        value: this.state.newDTReason.dtreason_code,
                        label: `${this.state.newDTReason.dtreason_code} - ${this.state.newDTReason.dtreason_name}`,
                        reason_id: this.state.newDTReason.dtreason_id
                    }}
                    onChange={(e) => this.changeSelectTable(e)}

                    options={this.state.reasons}
                />;
            } else {
                return <span>{this.state.newDTReason[prop]}</span>;
            }
        }
    }

    changeInputValue(e) {
        let newDTReason = this.state.newDTReason;
        newDTReason.dtminutes = e.target.value;
        this.setState({ newDTReason });
    }

    changeSelectTable(e) {
        let newDTReason = _.find(this.state.allDTReason, ['dtreason_id', e.dtreason_id]);
        newDTReason.dtminutes = this.state.newDTReason.dtminutes;
        this.setState({ newDTReason });
    }

    renderEditAcceptDeleteButton(row, action) {
        if (action === 'edit') {
            return <Nav.Link onClick={() => this.editDTReasonRow(row)}><FontAwesome name='edit' /></Nav.Link>;
        } else if (action === 'accept' && row.dtdata_id === this.state.currentDTReason.dtdata_id) {
            return <Nav.Link onClick={() => this.acceptNewDTReason(row)}><FontAwesome name='check' /></Nav.Link>;
        } else if (action === 'cancel' && row.dtdata_id === this.state.currentDTReason.dtdata_id) {
            return <Nav.Link onClick={() => this.cancelEditDTReason()}><FontAwesome name='window-close' /></Nav.Link>;
        } else {
            return <span></span>;
        }
    }

    editDTReasonRow(row) {
        this.setState({
            editDTReason: true,
            currentDTReason: _.clone(row),
            newDTReason: _.clone(row)
        });
    }

    acceptNewDTReason() {
        if ((formatNumber(this.state.allocated_time) + formatNumber(this.state.currentDTReason.dtminutes)) >= formatNumber(this.state.newDTReason.dtminutes) &&
            formatNumber(this.state.newDTReason.dtminutes) > 0) {
            const data = {
                dxh_data_id: this.props.currentRow ? this.props.currentRow.dxhdata_id : undefined,
                dt_reason_id: this.state.newDTReason.dtreason_id,
                dt_minutes: parseInt(this.state.newDTReason.dtminutes),
                dtdata_id: parseInt(this.state.currentDTReason.dtdata_id),
                clocknumber: this.props.user.clock_number ? this.props.user.clock_number : undefined,
                first_name: this.props.user.clock_number ? undefined : this.props.user.first_name,
                last_name: this.props.user.clock_number ? undefined : this.props.user.last_name,
                timestamp: getCurrentTime(this.props.user.timezone)
            }
            this.setState({ modal_loading_IsOpen: true }, async () => {
                let res = await getResponseFromGeneric('put', API, '/dt_data_update', {}, {}, data);

                if (res.status !== 200) {
                    this.setState({ modal_loading_IsOpen: false, modal_message_isOpen: true, modal_type: 'Error', modal_message: 'Time Lost Entries unsaved' });
                } else {
                    this.setState({ request_status: res, modal_loading_IsOpen: false, modal_message_isOpen: true, modal_type: 'Success', modal_message: 'Time Lost Entries Saved' });
                }
                this.props.Refresh(this.props.parentData);
                this.setState({ new_tl_reason: '', allowSubmit: true, time_to_allocate: 0 });
                this.closeTimeloss();
            });
        } else {
            this.setState({
                modal_message_isOpen: true,
                modal_type: 'Error',
                modal_message: `The minimum value for time is 1 and the max value is ${formatNumber(this.state.allocated_time) + formatNumber(this.state.currentDTReason.dtminutes)}`
            });
        }
    }

    cancelEditDTReason() {
        this.setState({
            editDTReason: false,
            currentDTReason: {},
            newDTReason: {}
        });
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
                    <ReactTable
                        className={'reactTableTReason'}
                        data={this.state.timelost}
                        columns={this.getColumns()}
                        defaultPageSize={this.state.timelost.length > 3 ? this.state.timelost.length : 4}
                        showPaginationBottom={false}
                        noDataText={this.props.t('No Time Lost entries yet')}
                    />
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
                                    disabled={this.props.readOnly || this.state.editDTReason}
                                    value={this.state.time_to_allocate}
                                    autoFocus
                                    onChange={this.allocateTime}></input>
                            </Col>
                            <Col sm={6} md={3} style={{ marginBottom: '5px' }}>
                                <p style={{ marginTop: '5px', color: 'red', fontSize: '0.8em' }}>{this.state.validationMessage}</p>
                            </Col>
                        </Row>
                        <div className="new-timeloss-reasoncode">
                            <p style={{ paddingBottom: '1px', marginBottom: '5px' }}>{t('Search/Select Reason Code') ? t('Search/Select Reason Code') : t('New Value')}:</p>
                            <Form.Group controlId="formGridState">
                                <ReactSelect
                                    value={this.state.new_tl_reason}
                                    onChange={(e) => this.setState({ new_tl_reason: e }, (e) => this.validate(e))}
                                    options={this.state.reasons}
                                    className={"react-select-container"}
                                    styles={selectStyles}
                                    isDisabled={this.props.readOnly || this.state.editDTReason}
                                />
                            </Form.Group>
                        </div>
                        <div className={'new-timeloss-button'}>
                            <Button variant="outline-info"
                                style={{ marginTop: '30px' }}
                                disabled={this.state.allowSubmit || this.props.readOnly}
                                onClick={this.submit}>{t('Submit')}
                            </Button>
                        </div> {this.props.readOnly ? <span style={{ color: 'grey' }}>{t('Read-Only')}</span> : null}
                    </div>
                    <div className={'new-timeloss-close'}>
                        <Button variant="outline-secondary"
                            style={{ marginTop: '10px', marginLeft: '10px' }}
                            onClick={this.closeTimeloss}>{t('Close')}</Button>
                    </div>
                </Modal>
                <MessageModal
                    isOpen={this.state.modal_message_isOpen}
                    onRequestClose={this.closeModal}
                    type={this.state.modal_type}
                    message={this.state.modal_message}
                    t={this.props.t}
                />
                {/* <ConfirmModal
                    isOpen={this.state.modal_confirm_IsOpen}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    contentLabel="Example Modal"
                    shouldCloseOnOverlayClick={false}
                    message={'Time Lost Entries Saved'}
                    title={'Request Successful'}
                    t={this.props.t}
                /> */}
                <LoadingModal
                    isOpen={this.state.modal_loading_IsOpen}
                    //  onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    contentLabel="Example Modal"
                    t={this.props.t}
                />
                {/* <ErrorModal
                    isOpen={this.state.modal_error_IsOpen}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    contentLabel="Example Modal"
                    t={this.props.t}
                    message={this.state.errorMessage}
                /> */}
            </React.Fragment>
        )
    }
}

Modal.setAppElement('#root');
export default TimelossModal;