import React from  'react';
import Modal from 'react-modal';
import BarcodeReader from 'react-barcode-reader';
import { Form, Button } from 'react-bootstrap';
import ConfirmModal from './ConfirmModal';
import ErrorModal from './ErrorModal';
import LoadingModal from  './LoadingModal';
import './CommentsModal.scss';
import _ from 'lodash';


class OrderModal extends React.Component {
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
        this.onChange = this.onChange.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.handleScan = this.handleScan.bind(this);
        this.handleError = this.handleError.bind(this);
    }

    submit(e) {
        this.props.signOffSupervisor(this.state.value);
    }

    onChange(e) {
        if (parseInt(e.target.value) !== 0 || e.target.value !== '') {
                this.setState({newValue: e.target.value});
        } else {
            this.setState({modal_error_IsOpen: true, errorMessage: 'Not a valid value'})
        }
    }

    closeModal() {
        this.setState({modal_confirm_IsOpen: false, modal_loading_IsOpen: false, modal_error_IsOpen: false});
    }

    handleScan(data){
        this.setState({
          result: 'Scanning',
          value: data,
        }) 
      }

    handleError(err) {
        this.setState({modal_error_IsOpen: true, errorMessage: 'Scan failed'});
        console.error(err)
      }

    render() {
        const t = this.props.t;
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
                        style={{paddingTop: '5px'}} 
                        type={this.props.formType } 
                        value={this.state.value} 
                        min="0"
                        maxLength={18}
                        onChange={(val) => this.setState({value: val.target.value})}>  
                    </Form.Control>
                   </span>
                   <Button variant="outline-primary" style={{marginTop: '10px'}} onClick={this.submit}>{t('Submit')}</Button>
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
export default OrderModal;