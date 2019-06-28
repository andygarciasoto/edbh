import React from  'react';
import Modal from 'react-modal';
import { Form, Button } from 'react-bootstrap';


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
    }

    onChange(e) {
        this.setState({newValue: e.target.value});
    }

    componentDidMount() {
    }

    render() {
        return (
              <Modal
                 isOpen={this.props.isOpen}
                 onRequestClose={this.props.onRequestClose}
                 style={this.props.style}
                 contentLabel="Example Modal">
                    <span className="close-modal-icon" onClick={this.props.onRequestClose}>X</span>
                    <span className="dashboard-modal-field-group"><p>Current Value:</p>
                      <Form.Control style={{paddingTop: '5px'}} type="number" disabled={true} value={this.state.value}></Form.Control>
                    </span>
                   <br />
                   <span className="dashboard-modal-field-group"><p>New Value:</p>
                      <Form.Control style={{paddingTop: '5px'}} type="number" value={this.state.newValue} onChange={this.onChange}></Form.Control>
                    </span>
                    <Button variant="outline-primary" style={{marginTop: '10px'}} onClick={this.editNumber}>Submit</Button>
                </Modal>
        )
    }
}

Modal.setAppElement('#root');
export default ValueModal;