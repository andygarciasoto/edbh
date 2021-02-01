import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import '../../sass/MessageModal.scss';

class MessageModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = Object.assign(this.getInitialState(props));
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

    componentWillReceiveProps(nextProps) {
        if (nextProps.isOpen) {
            this.setState(this.getInitialState(nextProps));
        }
    }

    render() {
        const t = this.props.t;
        return (
            <Modal
                size="sm"
                show={this.props.isOpen}
                onHide={this.props.onRequestClose}
                className='messageModal'
                aria-labelledby="example-modal-sizes-title-sm"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="example-modal-sizes-title-sm">
                        {t(this.state.title)}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        {this.state.type === 'Error' ?
                            <FontAwesome className="warning-message icon" name="exclamation-triangle" />
                            :
                            <FontAwesome className="success-message icon" name="check" />
                        }&nbsp;&nbsp;
                        <p className={this.state.classMessage}>{t(this.state.message)}</p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant={this.state.classButton} style={{ marginTop: '20px' }} className={'close-button'} onClick={this.props.onRequestClose}>{this.state.closeText}</Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

export default MessageModal;