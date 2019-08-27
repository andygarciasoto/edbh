import React from  'react';
import Modal from 'react-modal';
import BarcodeReader from 'react-barcode-reader';
import { Form, Button } from 'react-bootstrap';
import ConfirmModal from './ConfirmModal';
import ErrorModal from './ErrorModal';
import LoadingModal from  './LoadingModal';
import { sendPut, getCurrentTime, formatDateWithTime } from '../Utils/Requests';
import './CommentsModal.scss';
import _ from 'lodash';


class ValueModal extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            value : '',
            errorMessage: '',
            modal_confirm_IsOpen: false,
            modal_loading_IsOpen: false,
            modal_error_IsOpen: false,
        } 
        this.submit = this.submit.bind(this);
        this.onChange = this.onChange.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.handleScan = this.handleScan.bind(this);
        this.handleError = this.handleError.bind(this);
    }

    submit(e) {
        const data = {
        // data goes here
        }
        console.log(this.state.value, this.props.parentData[0])
        this.setState({modal_loading_IsOpen: true}, () => {
            const response = sendPut({
                ...data
            }, '/order_data')
            response.then((res) => {
                if (res !== 200 || !res) {
                    this.setState({modal_error_IsOpen: true, errorMessage: 'The order you entered was not found.'})
                } else {
                    this.setState({modal_loading_IsOpen: false})
                }
                this.props.Refresh(this.props.parentData);
                this.setState({value: ''})
                this.props.showValidateDataModal(...res);
            })
            })
        this.setState({newValue: ''})
    }

    onChange(e) {
        if (parseInt(e.target.value) !== 0 || e.target.value !== '' || !isNaN(e.target.value)) {
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
        this.setState({modal_error_IsOpen: true, errorMessage: 'Scan failed',});
        console.error(err)
      }

    render() {
        const t = this.props.t;
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
                   <span className="dashboard-modal-field-group"><p>{t('Enter Order Number')}:</p>
                    <Form.Control 
                        style={{paddingTop: '5px'}} 
                        type={this.props.formType } 
                        value={this.state.value} 
                        min="0"
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
export default ValueModal;