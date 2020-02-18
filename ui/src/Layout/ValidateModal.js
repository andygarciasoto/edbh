import React from 'react';
import Modal from 'react-modal';
import BarcodeReader from 'react-barcode-reader';
import { Form } from 'react-bootstrap';
import ConfirmModal from './ConfirmModal';
import ErrorModal from './ErrorModal';
import LoadingModal from './LoadingModal';
import './CommentsModal.scss';


class OrderModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            errorMessage: '',
            modal_confirm_IsOpen: false,
            modal_loading_IsOpen: false,
            modal_error_IsOpen: false,
            style: {
                content: {
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    marginRight: '-50%',
                    transform: 'translate(-50%, -50%)',
                    width: '30%'
                },
                overlay: {
                    backgroundColor: 'rgba(0,0,0, 0.6)'
                }
            }
        }
        this.closeModal = this.closeModal.bind(this);
        this.handleScan = this.handleScan.bind(this);
        this.handleError = this.handleError.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ value: '' })
    }

    closeModal() {
        this.setState({ modal_confirm_IsOpen: false, modal_loading_IsOpen: false, modal_error_IsOpen: false });
        this.props.onRequestClose();
    }

    handleScan(data) {
        let _this = this;
        this.setState({
            result: 'Scanning',
            value: data,
        }, () => _this.props.signOffSupervisor(data))
    }

    handleError(err) {
        if (!isNaN(err)) {
            this.handleScan(err);
        } else {
            this.setState({ modal_error_IsOpen: true, errorMessage: 'Scan failed: Barcode not Valid' });
            console.log(err);
        }
    }

    render() {
        return (
            <React.Fragment>
                <Modal
                    isOpen={this.props.isOpen}
                    onRequestClose={this.props.onRequestClose}
                    style={this.state.style}
                    contentLabel="Example Modal">
                    <span className="close-modal-icon" onClick={this.props.onRequestClose}>X</span>
                    <BarcodeReader
                        onError={this.handleError}
                        onScan={this.handleScan}
                    />
                    <span className="dashboard-modal-field-group"><p>{this.props.label}:</p>
                        <Form.Control
                            style={{ paddingTop: '5px' }}
                            type={'password'}
                            value={this.state.value}
                            min="0"
                            autoFocus
                            disabled={true}
                            maxLength={18}>
                        </Form.Control>
                    </span>
                </Modal>
                <ConfirmModal
                    isOpen={this.state.modal_confirm_IsOpen}
                    //  onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    contentLabel="Example Modal"
                    shouldCloseOnOverlayClick={false}
                    message={'Value was inserted'}
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
export default OrderModal;