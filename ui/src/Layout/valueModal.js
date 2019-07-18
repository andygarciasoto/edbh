import React from  'react';
import Modal from 'react-modal';
import { Form, Button } from 'react-bootstrap';
import './CommentsModal.scss';


class ValueModal extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            value : this.props.currentVal,
            newValue: '',
        } 
        this.editNumber = this.editNumber.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    editNumber(e) {
        const newVal = this.state.newValue;
        this.setState({value: newVal});
        this.props.onRequestClose();
        if (this.props.openDropdownAfter) {
            this.props.openAfter(newVal);
        }

    }

    onChange(e) {
        this.setState({newValue: e.target.value});
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.currentVal !== '') {
            this.setState({value: nextProps.currentVal, valueType: true}) 
        } else {
            this.setState({value: nextProps.currentVal, valueType: false}) 
        }
    }

    render() {
        const t = this.props.t;
        if (this.state.valueType === true) {
            return (
                <Modal
                   isOpen={this.props.isOpen}
                   onRequestClose={this.props.onRequestClose}
                   style={this.props.style}
                   contentLabel="Example Modal">
                      <span className="close-modal-icon" onClick={this.props.onRequestClose}>X</span>
                      <span className="dashboard-modal-field-group"><p>{t('Current Value')}:</p>
                        <Form.Control style={{paddingTop: '5px'}} type={this.props.formType} disabled={true} value={this.state.value}></Form.Control>
                      </span>
                     <br />
                     <span className="dashboard-modal-field-group"><p>{t('New Value')}:</p>
                        <Form.Control style={{paddingTop: '5px'}} type={this.props.formType} onChange={(val) => this.onChange(val)}></Form.Control>
                      </span>
                      <Button variant="outline-primary" style={{marginTop: '10px'}} onClick={this.editNumber}>{t('Submit')}</Button>
                  </Modal>
            )
        } else {
            return (
                <Modal
                isOpen={this.props.isOpen}
                onRequestClose={this.props.onRequestClose}
                style={this.props.style}
                contentLabel="Example Modal">
                   <span className="close-modal-icon" onClick={this.props.onRequestClose}>X</span>
                  <span className="dashboard-modal-field-group"><p>{t('New Value')}:</p>
                     <Form.Control style={{paddingTop: '5px'}} type={this.props.formType} onChange={(val) => this.onChange(val)}></Form.Control>
                   </span>
                   <Button variant="outline-primary" style={{marginTop: '10px'}} onClick={this.editNumber}>{t('Submit')}</Button>
               </Modal>
            )
        }
       
    }
}

Modal.setAppElement('#root');
export default ValueModal;