import React from  'react';
import Modal from 'react-modal';
import { Form, Button } from 'react-bootstrap';
import ConfirmModal from './ConfirmModal';
import ErrorModal from './ErrorModal';
import LoadingModal from  './LoadingModal';
import { sendPut } from '../Utils/Requests';
import './CommentsModal.scss';
import _ from 'lodash';


class ValueModal extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            value : this.props.currentVal,
            newValue: '',
            errorMessage: '',
            modal_confirm_IsOpen: false,
            modal_loading_IsOpen: false,
            modal_error_IsOpen: false,
        } 
        this.submit = this.submit.bind(this);
        this.onChange = this.onChange.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    submit(e) {
        console.log(this.state.existingValue);
        const data = {
            dxh_data_id: this.props.dxh_id,
            actual: this.state.newValue ? parseInt(this.state.newValue) : null,
            clocknumber: this.props.user.clock_number ? this.props.user.clock_number : undefined,
            first_name: this.props.user.clock_number ? undefined : this.props.user.first_name,
            last_name: this.props.user.clock_number ? undefined : this.props.user.last_name,
            override: this.state.existingValue ? parseInt(this.props.currentRow.order_number) : 0,
        }
        if (!data.actual) {
            this.setState({modal_error_IsOpen: true, newValue: "", errorMessage: 'You have not entered a value'})
        } else {
            this.setState({modal_loading_IsOpen: true}, () => {
                const response = sendPut({
                    ...data
                }, '/production_data')
                response.then((res) => {
                    if (res !== 200) {
                        this.setState({modal_error_IsOpen: true, errorMessage: 'Could not complete request'})
                    } else {
                        this.setState({request_status: res, modal_confirm_IsOpen: true, modal_loading_IsOpen: false})
                        this.setState({modal_confirm_IsOpen: false})
                    }
                    this.props.Refresh(this.props.parentData);
                    this.props.onRequestClose();
                })
              })
        }
        this.setState({newValue: ''})
        console.log(data)
    }

    onChange(e) {
        console.log(e.target.value)
        if (parseInt(e.target.value) !== 0 || e.target.value !== '' || !isNaN(e.target.value)) {
                this.setState({newValue: e.target.value});
        } else {
            this.setState({modal_error_IsOpen: true, errorMessage: 'Not a valid value'})
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.currentVal !== '') {
            this.setState({value: nextProps.currentVal, existingValue: true}) 
        } else {
            this.setState({value: nextProps.currentVal, existingValue: false}) 
        }
    }

    closeModal() {
        this.setState({modal_confirm_IsOpen: false, modal_loading_IsOpen: false, modal_error_IsOpen: false});
    }

    render() {
        console.log(this.state.newValue, 'new value')
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
                            style={{paddingTop: '5px'}} 
                            type={this.props.formType} 
                            disabled={true} 
                            value={this.state.value}>
                        </Form.Control>
                      </span>
                     <br />
                     <span className="dashboard-modal-field-group"><p>{t('New Value')}:</p>
                        <Form.Control 
                            value={this.state.newValue} 
                            style={{paddingTop: '5px'}}
                            type={this.props.formType} 
                            onChange={(val) => this.onChange(val)}>
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
                        isOpen={this.state.modal_loading_IsOpen}
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
                        style={{paddingTop: '5px'}} 
                        type={this.props.formType} 
                        value={this.state.newValue} 
                        onChange={(val) => this.onChange(val)}>  
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
}

Modal.setAppElement('#root');
export default ValueModal;