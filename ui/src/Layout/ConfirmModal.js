import React from  'react';
import Modal from 'react-modal';
import { Button } from 'react-bootstrap';
import './ErrorModal.scss';
import FontAwesome from 'react-fontawesome';

class ConfirmModal extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            value : '',
        } 
        this.validateBarcode = this.validateBarcode.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    componentDidMount() {
        const modalStyle = {
            content : {
              top                   : '20%',
              left                  : '30%',
              right                 : 'auto',
              bottom                : 'auto',
              marginRight           : '-50%',
              transform             : 'translate(-50%, -50%)',
              maxHeight: '30%',
            },
            overlay : {
              backgroundColor: 'rgba(0,0,0, 0.6)'
            }
          };
      
          this.setState({modalStyle})
    }

    validateBarcode(e) {
        console.log(this.state.value);
    }

    onChange(e) {
        this.setState({value: e.target.value});
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
                <div><p className="dashboard-modal-error-field-head">{this.state.title}</p>
                <div><FontAwesome className="warning-message icon" name="check"/>&nbsp;&nbsp;
                <p className="warning-message">{this.props.message}</p></div>
                </div>
                <Button variant="outline-danger" style={{marginTop: '20px'}} className="error-button" onClick={this.props.onRequestClose}>Close</Button>
            </Modal>
        )
    }
}

Modal.setAppElement('#root');
export default ConfirmModal;