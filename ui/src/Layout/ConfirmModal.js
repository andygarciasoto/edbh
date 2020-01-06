import React from 'react';
import Modal from 'react-modal';
import { Button } from 'react-bootstrap';
import './ErrorModal.scss';
import FontAwesome from 'react-fontawesome';

class ConfirmModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
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
                <div><p className="dashboard-modal-sucessr-field-head">{this.props.title}</p>
                    <div><FontAwesome className="success-message icon" name="check" />&nbsp;&nbsp;
                <p className="success-message">{this.props.message}</p></div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <Button variant="outline-success" style={{ marginTop: '20px' }} className="success-button" onClick={this.props.onRequestClose}>{this.props.t('Close')}</Button>
                </div>
            </Modal>
        )
    }
}

Modal.setAppElement('#root');
export default ConfirmModal;