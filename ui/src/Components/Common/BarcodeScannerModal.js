import React from 'react';
import BarcodeReader from 'react-barcode-reader';
import { Form, Modal, Button } from 'react-bootstrap';
import MessageModal from './MessageModal';
import LoadingModal from './LoadingModal';
import '../../sass/BarcodeScannerModal.scss';


class BadgeScannerModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modalTitle: '',
            inputText: '',
            badge: '',
            isOpen: false,
            modal_message_Is_Open: false,
            messageModalType: '',
            messageModalMessage: '',
            modal_loading_IsOpen: false
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.isOpen !== prevState.isOpen) {
            return {
                modalTitle: nextProps.modalTitle,
                inputText: nextProps.inputText,
                badge: '',
                isOpen: nextProps.isOpen
            };
        }
        return null;
    }

    closeModal = () => {
        this.setState({ modal_message_Is_Open: false, modal_loading_IsOpen: false });
        this.props.onRequestClose();
    }

    handleScan = (data) => {
        let _this = this;
        this.setState({
            result: 'Scanning',
            badge: data,
        }, () => _this.props.responseScan(data))
    }

    handleError = (err) => {
        if (!isNaN(err)) {
            this.handleScan(err);
        } else {
            this.setState({ modal_message_Is_Open: true, messageModalType: 'Error', messageModalMessage: 'Scan failed: Barcode not Valid' });
        }
    }

    render() {
        const t = this.props.t;
        const props = this.props;
        return (
            <React.Fragment>
                <Modal
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    show={this.state.isOpen} onHide={props.onRequestClose}
                    className='barcodeScannerModal'
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            {t(this.state.modalTitle)}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <BarcodeReader
                            onError={this.handleError}
                            onScan={this.handleScan}
                        />
                        <span className="dashboard-modal-field-group">
                            <Form.Control
                                style={{ paddingTop: '5px' }}
                                type={'text'}
                                value={this.state.inputText}
                                autoFocus
                                disabled={true}>
                            </Form.Control>
                        </span>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={props.onRequestClose} variant='outline-danger'>{t('Cancel')}</Button>
                    </Modal.Footer>
                </Modal>
                <MessageModal
                    isOpen={this.state.modal_message_Is_Open}
                    onRequestClose={this.closeModal}
                    type={this.state.messageModalType}
                    message={this.state.messageModalMessage}
                    t={t}
                />
                <LoadingModal
                    isOpen={this.state.modal_loading_IsOpen}
                    onRequestClose={this.closeModal}
                    contentLabel="Example Modal"
                    t={this.props.t}
                />
            </React.Fragment>
        )
    }
}

export default BadgeScannerModal;