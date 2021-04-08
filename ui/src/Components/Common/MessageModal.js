import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import _ from 'lodash';
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

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.isOpen && (!_.isEqual(nextProps.type, prevState.type) || !_.isEqual(nextProps.message, prevState.message))) {
            return {
                type: nextProps.type,
                message: nextProps.message,
                title: nextProps.type,
                classMessage: nextProps.type === 'Error' ? 'warning-message' : 'success-message',
                classButton: nextProps.type === 'Error' ? 'outline-danger' : 'outline-success',
                closeText: nextProps.t('Close')
            };
        }
        return null;
    }

    render() {
        const t = this.props.t;
        return (
            <Modal
                size="md"
                show={this.props.isOpen}
                onHide={this.props.onRequestClose}
                className='messageModal'
                aria-labelledby="example-modal-sizes-title-md"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="example-modal-sizes-title-md">
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
                        <p className={this.state.classMessage}>{this.state.message}</p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button id='messageButton' variant={this.state.classButton} style={{ marginTop: '20px' }} className={'close-button'} onClick={this.props.onRequestClose}>{this.state.closeText}</Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

export default MessageModal;