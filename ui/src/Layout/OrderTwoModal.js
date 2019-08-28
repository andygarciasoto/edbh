import React from  'react';
import Modal from 'react-modal';
import ConfirmModal from './ConfirmModal';
import ErrorModal from './ErrorModal';
import LoadingModal from  './LoadingModal';
import { getRequest } from '../Utils/Requests';
import { Button, Row, Col } from 'react-bootstrap';
import './CommentsModal.scss';
import _ from 'lodash';


class OrderTwoModal extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            value : '',
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
        this.setState({modal_confirm_IsOpen: false, modal_loading_IsOpen: false, modal_error_IsOpen: false});
    }

    submit(e) {
        const data = { params: {
            order_number: this.state.value, 
            asset_code: this.props.parentData[0]
        }}
        this.setState({modal_loading_IsOpen: true}, () => {
            const response = getRequest('/order_data', data)
            response.then((res) => {
                if (!res) {
                    this.setState({modal_error_IsOpen: true, errorMessage: 'The order you entered was not found.'})
                } else {
                    this.setState({modal_loading_IsOpen: false})
                }
                this.props.Refresh(this.props.parentData);
                this.setState({value: ''})
                this.closeModal();
            })
            })
        this.setState({newValue: ''})
    }

    render() {
        const t = this.props.t;
        console.log(this.props)
            return (
                <React.Fragment>
                <Modal
                isOpen={this.props.isOpen}
                onRequestClose={this.props.onRequestClose}
                style={this.state.style}
                contentLabel="Example Modal">
                  <p>{'Data Confirmation'}</p>
                  <ul className={'order-modal-two'}>
                      <Row><Col md={5}>{`Order Number: `}</Col><Col md={6}>{`342134333332243545345434`}</Col><Col md={1}></Col></Row>
                      <Row><Col md={5}>{`Part Number: `}</Col><Col md={6}>{`324234324`}</Col><Col md={1}></Col></Row>
                      <Row><Col md={5}>{`Part Quantity: `}</Col><Col md={6}>{`100`}</Col><Col md={1}></Col></Row>
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

Modal.setAppElement('#root');
export default OrderTwoModal;