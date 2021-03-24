import React from 'react';
import Modal from 'react-modal';
import ConfirmModal from './ConfirmModal';
import ErrorModal from './ErrorModal';
import LoadingModal from './LoadingModal';
import { Button, Row, Col } from 'react-bootstrap';
import './CommentsModal.scss';


class OrderTwoModal extends React.Component {
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
        this.submit = this.submit.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    closeModal() {
        this.setState({ modal_confirm_IsOpen: false, modal_loading_IsOpen: false, modal_error_IsOpen: false });
        this.props.onRequestClose();
    }

    submit(e) {
        this.props.Refresh(this.props.parentData);
        this.closeModal();
        this.setState({ modal_confirm_IsOpen: true });
    }

    render() {
        if (this.props.data) {
            return (
                <React.Fragment>
                    <Modal
                        isOpen={this.props.isOpen}
                        onRequestClose={this.props.onRequestClose}
                        style={this.state.style}
                        contentLabel="Example Modal">
                        <p>{'Data Confirmation'}</p>
                        {<ul className={'order-modal-two'}>
                            <Row><Col md={5}>{`Order was successfully inserted.`}</Col></Row>
                        </ul>
                      /*
                      this.props.data.order_id ?
                      <ul className={'order-modal-two'}>
                      <Row><Col md={5}>{`Order Number: `}</Col><Col md={6}>{this.props.data.order_number}</Col><Col md={1}></Col></Row>
                      <Row><Col md={5}>{`Part Number: `}</Col><Col md={6}>{this.props.data.order_id}</Col><Col md={1}></Col></Row>
                      <Row><Col md={5}>{`Part Quantity: `}</Col><Col md={6}>{this.props.data.order_quantity}</Col><Col md={1}></Col></Row>
                  </ul> : <p style={{textAlign: 'center'}}>{'No order found with that number'}</p>
                  */}
                        {this.props.data.order_id ? <React.Fragment>
                            <Button variant="outline-success"
                                style={{ marginTop: '20px', textAlign: 'center' }}
                                className="error-button signoff-buttons"
                                onClick={this.submit}>{this.props.t('Accept')}</Button>
                            <Button variant="outline-default"
                                style={{ marginTop: '20px', textAlign: 'center' }}
                                className="error-button signoff-buttons"
                                onClick={this.props.onRequestClose}>{this.props.t('Cancel')}</Button>
                        </React.Fragment>
                            : <Button variant="outline-default"
                                style={{ marginTop: '20px', textAlign: 'center' }}
                                className="error-button signoff-buttons"
                                onClick={this.props.onRequestClose}>{this.props.t('Cancel')}</Button>
                        }
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
        } else {
            return (
                <Modal
                    isOpen={this.props.isOpen}
                    onRequestClose={this.props.onRequestClose}
                    style={this.state.style}
                    contentLabel="Example Modal">
                    <p>{'Data Confirmation'}</p>
                    <ul className={'order-modal-two'}>
                        <Row><Col md={5}>{`Order was successfully inserted.`}</Col></Row>
                    </ul>
                    <Button variant="outline-success"
                        style={{ marginTop: '20px', textAlign: 'center' }}
                        className="error-button signoff-buttons"
                        onClick={this.submit}>{this.props.t('Accept')}</Button>
                    <Button variant="outline-default"
                        style={{ marginTop: '20px', textAlign: 'center' }}
                        className="error-button signoff-buttons"
                        onClick={this.props.onRequestClose}>{this.props.t('Cancel')}</Button>
                </Modal>
            )

        }
    }
}

Modal.setAppElement('#root');
export default OrderTwoModal;