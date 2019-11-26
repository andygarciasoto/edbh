import React from 'react';
import Modal from 'react-modal';
import { Form, Button } from 'react-bootstrap';
import ConfirmModal from './ConfirmModal';
import ErrorModal from './ErrorModal';
import LoadingModal from './LoadingModal';
import { sendPut, getCurrentTime, formatDateWithTime } from '../Utils/Requests';
import './CommentsModal.scss';

class ScrapModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = Object.assign(this.getInitialState(props));
    }

    getInitialState(props) {
        return {
            actualRow: {},
            setup_scrap: 0,
            other_scrap: 0,
            adjusted_actual: 0,
            errorMessage: '',
            isOpen: props.isOpen,
            modal_confirm_IsOpen: false,
            modal_loading_IsOpen: false,
            modal_error_IsOpen: false
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.currentRow && nextProps.currentRow.dxhdata_id !== null) {
            this.setState({
                isOpen: nextProps.isOpen,
                actualRow: nextProps.currentRow,
                setup_scrap: nextProps.currentRow.summary_setup_scrap || 0,
                other_scrap: nextProps.currentRow.summary_other_scrap || 0,
                adjusted_actual: nextProps.currentRow.summary_adjusted_actual || nextProps.currentRow.actual_pcs
            });
        }
    }

    onChangeInput = (name, e) => {
        let _this = this;
        e.target.value = e.target.value < 0 && e.target.value !== '' ? 0 : e.target.value;
        let otherName = name === 'setup_scrap' ? 'other_scrap' : 'setup_scrap';
        if (e.target.value === '' || (parseInt(e.target.value === '' ? 0 : e.target.value, 10) + parseInt(this.state[otherName] === '' ? 0 : this.state[otherName], 10) <= this.state.actualRow.actual_pcs)) {
            this.setState({ [name]: e.target.value }, () => {
                _this.setState({
                    adjusted_actual: _this.state.actualRow.actual_pcs -
                        (parseInt(_this.state.setup_scrap === '' ? 0 : _this.state.setup_scrap, 10) + parseInt(_this.state.other_scrap === '' ? 0 : _this.state.other_scrap, 10))
                });
            });
        }
    }

    submit = (e) => {
        const data = {
            dxh_data_id: this.state.actualRow && this.state.actualRow.dxhdata_id ? this.state.actualRow.dxhdata_id : undefined,
            actual: this.state.actualRow && this.state.actualRow.actual_pcs ? this.state.actualRow.actual_pcs : 'signoff',
            setup_scrap: this.state.setup_scrap || 'signoff',
            other_scrap: this.state.other_scrap || 'signoff',
            adjusted_actual: this.state.adjusted_actual || 'signoff',
            clocknumber: this.props.user.clock_number ? this.props.user.clock_number : undefined,
            first_name: this.props.user.clock_number ? undefined : this.props.user.first_name,
            last_name: this.props.user.clock_number ? undefined : this.props.user.last_name,
            override: this.state.actualRow && this.state.actualRow.production_id ? parseInt(this.state.actualRow.production_id) : 0,
            row_timestamp: formatDateWithTime(this.state.actualRow.hour_interval_start),
            timestamp: getCurrentTime(this.props.timezone),
            asset_code: this.props.parentData[0]
        }
        this.setState({ modal_loading_IsOpen: true }, () => {
            const response = sendPut({
                ...data
            }, '/production_data')
            response.then((res) => {
                if (res !== 200 || !res) {
                    this.setState({ modal_error_IsOpen: true, errorMessage: 'Could not complete request' })
                } else {
                    this.setState({ request_status: res, modal_loading_IsOpen: false })
                }
                this.props.Refresh(this.props.parentData);
                this.props.onRequestClose();
            })
        })
    }

    closeModal = () => {
        this.setState({ modal_confirm_IsOpen: false, modal_loading_IsOpen: false, modal_error_IsOpen: false });
        this.props.onRequestClose();
    }

    render() {
        return (
            this.state.isOpen ?
                <React.Fragment>
                    <Modal
                        isOpen={this.props.isOpen}
                        onRequestClose={this.props.onRequestClose}
                        style={this.props.style}
                        contentLabel="Example Modal">
                        <span className="close-modal-icon" onClick={this.props.onRequestClose}>X</span>
                        <span className="dashboard-modal-field-group"><p>{this.props.t('Part Number')}:</p>
                            <Form.Control
                                style={{ paddingTop: '5px' }}
                                disabled={true}
                                value={this.state.actualRow.product_code}>
                            </Form.Control>
                        </span>
                        <br />
                        <span className="dashboard-modal-field-group"><p>{this.props.t('Recorded Actual')}:</p>
                            <Form.Control
                                style={{ paddingTop: '5px' }}
                                type={this.props.formType}
                                disabled={true}
                                value={this.state.actualRow.actual_pcs || 0}>
                            </Form.Control>
                        </span>
                        <br />
                        <span className="dashboard-modal-field-group"><p>{this.props.t('Setup Scrap')}:</p>
                            <input
                                value={this.state.setup_scrap}
                                type="number"
                                onChange={(e) => this.onChangeInput('setup_scrap', e)}
                                className="form-control"
                                style={{ paddingTop: '5px' }}
                                min='0'
                                disabled={this.props.IsEditable} />
                        </span>
                        <br />
                        <span className="dashboard-modal-field-group"><p>{this.props.t('Other Scrap')}:</p>
                            <input
                                value={this.state.other_scrap}
                                type="number"
                                onChange={(e) => this.onChangeInput('other_scrap', e)}
                                className="form-control"
                                style={{ paddingTop: '5px' }}
                                min='0'
                                disabled={this.props.IsEditable} />
                        </span>
                        <br />
                        <span className="dashboard-modal-field-group"><p>{this.props.t('Adjusted Actual')}:</p>
                            <input
                                value={this.state.adjusted_actual || 0}
                                type="number"
                                className="form-control"
                                style={{ paddingTop: '5px' }}
                                disabled={true} />
                        </span>
                        <Button variant="outline-primary" style={{ marginTop: '10px' }} disabled={this.props.IsEditable} onClick={this.submit}>{this.props.t('Submit')}</Button>
                    </Modal>
                    <ConfirmModal
                        isOpen={this.state.modal_confirm_IsOpen}
                        onRequestClose={this.closeModal}
                        contentLabel="Example Modal"
                        shouldCloseOnOverlayClick={false}
                        message={'Value was inserted.'}
                        title={'Request Successful'}
                    />
                    <LoadingModal
                        isOpen={this.state.modal_loading_IsOpen}
                        onRequestClose={this.closeModal}
                        contentLabel="Example Modal"
                        t={this.props.t}
                    />
                    <ErrorModal
                        isOpen={this.state.modal_error_IsOpen}
                        onRequestClose={this.closeModal}
                        contentLabel="Example Modal"
                        t={this.props.t}
                        message={this.state.errorMessage}
                    />
                </React.Fragment>
                : null
        )
    }
}

Modal.setAppElement('#root');
export default ScrapModal;