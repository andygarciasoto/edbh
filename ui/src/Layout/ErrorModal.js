import React from 'react';
import Modal from 'react-modal';
import { Button } from 'react-bootstrap';
import './ErrorModal.scss';
import FontAwesome from 'react-fontawesome';

class ErrorModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            message: 'Operation could not be completed.',
            title: 'Error'
        }
        this.validateBarcode = this.validateBarcode.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    componentDidMount() {
        const modalStyle = {
            content: {
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                marginRight: '-50%',
                transform: 'translate(-50%, -50%)',
            },
            overlay: {
                backgroundColor: 'rgba(0,0,0, 0.6)'
            }
        };

        this.setState({ style: modalStyle })
    }

    validateBarcode(e) {
        console.log(this.state.value);
    }

    onChange(e) {
        this.setState({ value: e.target.value });
    }

    render() {
        return (
            <Modal
                isOpen={this.props.isOpen}
                //  onAfterOpen={this.afterOpenModal}
                onRequestClose={this.props.onRequestClose}
                style={this.state.style}
                contentLabel="Example Modal">
                <span className="close-modal-icon" onClick={this.props.onRequestClose}>X</span>
                <div><p className="dashboard-modal-error-field-head">{this.props.title || this.state.title}</p>
                    <div><FontAwesome className="warning-message icon" name="exclamation-triangle" />&nbsp;&nbsp;
                <p className="warning-message">{this.props.message || this.state.message}</p></div>
                </div>
                <Button variant="outline-danger" style={{ marginTop: '20px' }} className="error-button" onClick={this.props.onRequestClose}>{this.props.t('Close')}</Button>
            </Modal>
        )
    }
}

Modal.setAppElement('#root');
export default ErrorModal;