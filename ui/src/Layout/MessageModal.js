import React from 'react';
import Modal from 'react-modal';
import { Button } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import './MessageModal.scss';

class MessageModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            type: '',
            message: '',
            title: '',
            titleClass: '',
            messageClass: '',
            buttonClass: ''
        }
    }

    getInitialState(props) {
        return {
            type: props.type,
            message: props.message,
            title: props.type,
            classMessage: props.type === 'Error' ? 'warning-message' : 'success-message',
            classButton: props.type === 'Error' ? 'outline-danger' : 'outline-success',
            closeText: props.t('Close')
        }
    }

    componentDidMount() {
        const modalStyle = {
            content: {
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                marginRight: '-50%',
                transform: 'translate(-50%, -50%)'
            },
            overlay: {
                backgroundColor: 'rgba(0,0,0, 0.6)'
            }
        };

        this.setState({ style: modalStyle })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.isOpen) {
            this.setState(this.getInitialState(nextProps));
        }
    }

    render() {
        return (
            <Modal
                isOpen={this.props.isOpen}
                onRequestClose={this.props.onRequestClose}
                style={this.state.style}
                contentLabel="Example Modal">
                <span className="close-modal-icon" onClick={this.props.onRequestClose}>X</span>
                <div><p>{this.state.title}</p>
                    <div>
                        {this.state.type === 'Error' ?
                            <FontAwesome className="warning-message icon" name="exclamation-triangle" />
                            :
                            <FontAwesome className="success-message icon" name="check" />
                        }&nbsp;&nbsp;
                <p className={this.state.classMessage}>{this.state.message}</p></div>
                </div>
                <Button variant={this.state.classButton} style={{ marginTop: '20px' }} className={'close-button'} onClick={this.props.onRequestClose}>{this.state.closeText}</Button>
            </Modal>
        )
    }
}

Modal.setAppElement('#root');
export default MessageModal;