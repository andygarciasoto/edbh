import React from  'react';
import Modal from 'react-modal';
import { Button } from 'react-bootstrap';
import './ErrorModal.scss';
import FontAwesome from 'react-fontawesome';

class ErrorModal extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            value : '',
        } 
        this.validateBarcode = this.validateBarcode.bind(this);
        this.onChange = this.onChange.bind(this);
        this.reloadPage = this.reloadPage.bind(this);
    }

    validateBarcode(e) {
        console.log(this.state.value);
    }

    onChange(e) {
        this.setState({value: e.target.value});
    }

    reloadPage() {
        window.location.reload();
    }

    render() {
        return (
            <Modal
                isOpen={this.props.isOpen}
                //  onAfterOpen={this.afterOpenModal}
                onRequestClose={this.props.onRequestClose}
                style={this.props.style}
                contentLabel="Example Modal">
                <span className="close-modal-icon" onClick={this.props.onRequestClose}>X</span>
                <div><p className="dashboard-modal-error-field-head">Sign on Error</p>
                <div><FontAwesome className="warning-message icon" name="exclamation-triangle"/>&nbsp;&nbsp;
                <p className="warning-message">Sign in attempt was unsuccesful.</p></div>
                </div>
                <Button variant="outline-danger" style={{marginTop: '20px'}} className="error-button" onClick={this.reloadPage}>Close</Button>
            </Modal>
        )
    }
}

Modal.setAppElement('#root');
export default ErrorModal;