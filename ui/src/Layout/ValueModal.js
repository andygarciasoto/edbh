import React from 'react';
import Modal from 'react-modal';
import { Form, Button } from 'react-bootstrap';
import ConfirmModal from './ConfirmModal';
import ErrorModal from './ErrorModal';
import LoadingModal from './LoadingModal';
import { sendPut, getCurrentTime, formatDateWithTime, formatNumber } from '../Utils/Requests';
import './CommentsModal.scss';


class ValueModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.currentVal,
            newValue: '',
            errorMessage: '',
            modal_confirm_IsOpen: false,
            modal_loading_IsOpen: false,
            modal_error_IsOpen: false,
            existingValue: false,
        }
        this.submit = this.submit.bind(this);
        this.onChange = this.onChange.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    submit(e) {
        const data = {
            dxh_data_id: this.props.currentRow && this.props.currentRow.dxhdata_id ? this.props.currentRow.dxhdata_id : undefined,
            actual: this.state.newValue ? this.state.newValue : null,
            setup_scrap: this.props.currentRow.setup_scrap || 'signoff',
            other_scrap: this.props.currentRow.other_scrap || 'signoff',
            adjusted_actual: this.props.currentRow.adjusted_actual || 'signoff',
            clocknumber: this.props.user.clock_number ? this.props.user.clock_number : undefined,
            first_name: this.props.user.clock_number ? undefined : this.props.user.first_name,
            last_name: this.props.user.clock_number ? undefined : this.props.user.last_name,
            override: this.state.existingValue ? parseInt(this.props.currentRow.production_id) : 0,
            row_timestamp: formatDateWithTime(this.props.currentRow.hour_interval_start),
            timestamp: getCurrentTime(this.props.timezone),
            asset_code: this.props.parentData[0]
        }
        if (!data.actual) {
            this.setState({ modal_error_IsOpen: true, newValue: "", errorMessage: 'You have not entered a value' })
        } else {
            this.setState({ modal_loading_IsOpen: true }, () => {
                const response = sendPut({
                    ...data
                }, '/production_data')
                response.then((res) => {
                    if (res !== 200 || !res) {
                        this.setState({ modal_error_IsOpen: true, errorMessage: 'Could not complete request' })
                    } else {
                        this.setState({ request_status: res, modal_confirm_IsOpen: true, modal_loading_IsOpen: false })
                    }
                    this.props.Refresh(this.props.parentData);
                    this.setState({ actual: '' })
                    this.props.onRequestClose();
                })
            })
        }
        this.setState({ newValue: '' })
    }

    onChange(e) {
        if (parseInt(e.target.value) !== 0 || e.target.value !== '' || !isNaN(e.target.value)) {
            this.setState({ newValue: e.target.value });
        } else {
            this.setState({ modal_error_IsOpen: true, errorMessage: 'Not a valid value' })
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.currentVal === '' || !nextProps.currentVal) {
            if (nextProps.cumulativepcs !== null) {
                this.setState({ value: nextProps.currentVal, existingValue: true })
            } else {
                this.setState({ existingValue: false })
            }
        } else {
            this.setState({ value: nextProps.currentVal, existingValue: true })
        }
    }

    closeModal() {
        this.setState({ modal_confirm_IsOpen: false, modal_loading_IsOpen: false, modal_error_IsOpen: false });
        this.props.onRequestClose();
    }

    render() {
        const t = this.props.t;
        if (this.state.existingValue === true) {
            return (
                <React.Fragment>
                    <Modal
                        isOpen={this.props.isOpen}
                        onRequestClose={this.props.onRequestClose}
                        style={this.props.style}
                        contentLabel="Example Modal">
                        <span className="close-modal-icon" onClick={this.props.onRequestClose}>X</span>
                        <span className="dashboard-modal-field-group"><p>{t('Current Value')}:</p>
                            <Form.Control
                                style={{ paddingTop: '5px' }}
                                type={this.props.formType}
                                disabled={true}
                                value={this.state.value}>
                            </Form.Control>
                        </span>
                        <br />
                        <span className="dashboard-modal-field-group"><p>{t('New Value')}:</p>
                            <Form.Control
                                value={this.state.newValue}
                                style={{ paddingTop: '5px' }}
                                type={this.props.formType}
                                autoFocus
                                onChange={(val) => this.onChange(val)}
                                disabled={this.props.readOnly}>
                            </Form.Control>
                        </span>
                        <Button variant="outline-primary" style={{ marginTop: '10px' }} disabled={this.props.readOnly} onClick={this.submit}>{t('Submit')}</Button>
                    </Modal>
                    <ConfirmModal
                        isOpen={this.state.modal_confirm_IsOpen}
                        //  onAfterOpen={this.afterOpenModal}
                        onRequestClose={this.closeModal}
                        contentLabel="Example Modal"
                        shouldCloseOnOverlayClick={false}
                        message={'Value was inserted.'}
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
        } else {
            return (
                <React.Fragment>
                    <Modal
                        isOpen={this.props.isOpen}
                        onRequestClose={this.props.onRequestClose}
                        style={this.props.style}
                        contentLabel="Example Modal">
                        <span className="close-modal-icon" onClick={this.props.onRequestClose}>X</span>
                        <span className="dashboard-modal-field-group"><p>{t('New Value')}:</p>
                            <Form.Control
                                style={{ paddingTop: '5px' }}
                                type={this.props.formType}
                                value={this.state.newValue}
                                autoFocus
                                onChange={(val) => this.onChange(val)}>
                            </Form.Control>
                        </span>
                        <Button variant="outline-primary" style={{ marginTop: '10px' }} onClick={this.submit}>{t('Submit')}</Button>
                    </Modal>
                    <ConfirmModal
                        isOpen={this.state.modal_confirm_IsOpen}
                        //  onAfterOpen={this.afterOpenModal}
                        onRequestClose={this.closeModal}
                        contentLabel="Example Modal"
                        shouldCloseOnOverlayClick={false}
                        message={'Value was inserted.'}
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
}

Modal.setAppElement('#root');
export default ValueModal;