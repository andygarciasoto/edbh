import React from 'react';
import Modal from 'react-modal';
import { Form, Button } from 'react-bootstrap';
import MessageModal from './MessageModal';
import LoadingModal from './LoadingModal';
import { getResponseFromGeneric } from '../Utils/Requests';
import { API } from '../Utils/Constants';
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
            modal_message_isOpen: false,
            modal_type: '',
            modal_message: '',
            modal_loading_IsOpen: false,
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.currentRow && nextProps.currentRow.productiondata_id !== null) {
            this.setState({
                isOpen: nextProps.isOpen,
                actualRow: nextProps.currentRow,
                setup_scrap: nextProps.currentRow.setup_scrap || 0,
                other_scrap: nextProps.currentRow.other_scrap || 0,
                adjusted_actual: nextProps.currentRow.adjusted_actual || nextProps.currentRow.actual
            });
        }
    }

    onChangeInput = (name, e) => {
        let _this = this;
        e.target.value = e.target.value < 0 && e.target.value !== '' ? 0 : e.target.value;
        let otherName = name === 'setup_scrap' ? 'other_scrap' : 'setup_scrap';
        if (e.target.value === '' || (parseInt(e.target.value === '' ? 0 : e.target.value, 10) + parseInt(this.state[otherName] === '' ? 0 : this.state[otherName], 10) <= this.state.actualRow.actual)) {
            this.setState({ [name]: e.target.value !== '' ? parseInt(e.target.value) : 0 }, () => {
                _this.setState({
                    adjusted_actual: _this.state.actualRow.actual -
                        (parseInt(_this.state.setup_scrap === '' ? 0 : _this.state.setup_scrap, 10) + parseInt(_this.state.other_scrap === '' ? 0 : _this.state.other_scrap, 10))
                });
            });
        }
    }

    submit = (e) => {
        const data = {
            dxh_data_id: this.state.actualRow.dxhdata_id,
            productiondata_id: this.state.actualRow.productiondata_id,
            setup_scrap: this.state.setup_scrap,
            other_scrap: this.state.other_scrap,
            clocknumber: this.props.user.clock_number ? this.props.user.clock_number : undefined,
            first_name: this.props.user.clock_number ? undefined : this.props.user.first_name,
            last_name: this.props.user.clock_number ? undefined : this.props.user.last_name
        }
        this.setState({ modal_loading_IsOpen: true }, async () => {
            let res = await getResponseFromGeneric('put', API, '/scrap_values', {}, {}, data);
            if (res.status !== 200) {
                this.setState({ modal_loading_IsOpen: false, modal_message_isOpen: true, modal_type: 'Error', modal_message: 'Could not complete request' });
            } else {
                this.props.Refresh(this.props.parentData);
                this.setState({ request_status: res, modal_loading_IsOpen: false, modal_message_isOpen: true, modal_type: 'Success', modal_message: 'Value was inserted' });
            }
        });
    }

    closeModal = () => {
        this.setState({ modal_message_isOpen: false, modal_loading_IsOpen: false });
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
                                value={this.state.actualRow.actual || 0}>
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
                                disabled={this.props.readOnly} />
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
                                disabled={this.props.readOnly} />
                        </span>
                        <br />
                        <span className="dashboard-modal-field-group"><p>{this.props.t('Adjusted Actual')}:</p>
                            <input
                                value={this.state.adjusted_actual || this.state.actualRow.actual || 0}
                                type="number"
                                className="form-control"
                                style={{ paddingTop: '5px' }}
                                disabled={true} />
                        </span>
                        <Button variant="outline-primary" style={{ marginTop: '10px' }} disabled={this.props.readOnly} onClick={this.submit}>{this.props.t('Submit')}</Button>
                        {this.props.readOnly ? <div><span style={{ color: 'grey' }}>{this.props.t('Read-Only')}</span></div> : null}
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