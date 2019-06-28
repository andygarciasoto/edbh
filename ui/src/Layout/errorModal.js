import React from  'react';
import Modal from 'react-modal';
import { Form, Button } from 'react-bootstrap';
import './ErrorModal.scss';


class ErrorModal extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            value : '',
        } 
        this.validateBarcode = this.validateBarcode.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    validateBarcode(e) {
        console.log(this.state.value);
    }

    onChange(e) {
        this.setState({value: e.target.value});
    }

    componentDidMount() {
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
                <span className="dashboard-modal-field-group"><p>Scan Barcode:</p>
                    <Form.Control style={{paddingTop: '5px'}} type="number" value={this.state.value} onChange={this.onChange}></Form.Control>
                </span>
                <Button variant="outline-primary" style={{marginTop: '10px'}} onClick={this.validateBarcode}>Validate</Button>
            </Modal>
        )
    }
}

Modal.setAppElement('#root');
export default ErrorModal;