import React from 'react';
import Modal from 'react-modal';
import BarcodeReader from 'react-barcode-reader';
import { Form } from 'react-bootstrap';
import MessageModal from './MessageModal';
import LoadingModal from './LoadingModal';
import { getRequest, getCurrentTime } from '../Utils/Requests';
import './CommentsModal.scss';


class OrderModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = Object.assign(this.getInitialState(props));
    }

    getInitialState(props) {
        return {
            value: '',
            errorMessage: '',
            modal_loading_IsOpen: false,
            modal_message_isOpen: false,
            modal_type: '',
            modal_message: '',
        }
    }

    submit = (e) => {
        const data = {
            params: {
                order_number: this.state.value,
                asset_code: this.props.parentData[0],
                clocknumber: this.props.user.clock_number ? this.props.user.clock_number : undefined,
                first_name: this.props.user.clock_number ? undefined : this.props.user.first_name,
                last_name: this.props.user.clock_number ? undefined : this.props.user.last_name,
                timestamp: getCurrentTime(this.props.user.timezone)
            }
        };
        this.setState({ modal_loading_IsOpen: true }, () => {
            const response = getRequest('/order_assembly', data);
            response.then((res) => {
                if (!res) {
                    this.setState({ modal_loading_IsOpen: false, modal_message_isOpen: true, modal_type: 'Error', modal_message: 'Please try again or try with a different order' });
                } else {
                    this.setState({ modal_loading_IsOpen: false, modal_message_isOpen: true, modal_type: 'Success', modal_message: 'Order was inserted' });
                }
                this.setState({ value: '' });
            })
        });
        this.setState({ newValue: '' });
    }

    closeModal = () => {
        this.setState({ modal_message_isOpen: false, modal_loading_IsOpen: false });
        this.props.onRequestClose();
    }

    handleScan = (data) => {
        let _this = this;
        this.setState({
            result: 'Scanning',
            value: data,
        }, () => { _this.submit(); })
    }

    handleError = (err) => {
        if (!isNaN(err)) {
            this.handleScan(err);
        } else {
            this.setState({ modal_message_isOpen: true, modal_type: 'Error', modal_message: 'Scan failed: Barcode not Valid' });
            console.log(err);
        }
    }

    render() {
        return (
            <React.Fragment>
                <Modal
                    isOpen={this.props.isOpen}
                    onRequestClose={this.props.onRequestClose}
                    style={this.props.style}
                    contentLabel="Example Modal">
                    <span className="close-modal-icon" onClick={this.props.onRequestClose}>X</span>
                    <BarcodeReader
                        onError={this.handleError}
                        onScan={this.handleScan}
                    />
                    <span className="dashboard-modal-field-group"><p>{this.props.t('Scan Order Number')}:</p>
                        <Form.Control
                            style={{ paddingTop: '5px' }}
                            type={'text'}
                            value={this.state.value}
                            min="0"
                            autoFocus
                            disabled={true}
                            maxLength={25}>
                        </Form.Control>
                    </span>
                </Modal>
                <LoadingModal
                    isOpen={this.state.modal_loading_IsOpen}
                    //  onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    contentLabel="Example Modal"
                    t={this.props.t}
                />
                <MessageModal
                    isOpen={this.state.modal_message_isOpen}
                    onRequestClose={this.closeModal}
                    type={this.state.modal_type}
                    message={this.state.modal_message}
                    t={this.props.t}
                />

            </React.Fragment>
        )
    }
}

Modal.setAppElement('#root');
export default OrderModal;