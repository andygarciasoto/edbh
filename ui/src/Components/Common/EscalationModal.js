import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import '../../sass/MessageModal.scss';

class EscalationModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const props = this.props;
        const classType = props.escalation.escalation_level === 1 ? 'inital' : (props.escalation.escalation_level === 2 ? 'warning' : 'danger');
        const t = props.t;
        return (
            <Modal
                size="md"
                show={props.isOpen}
                onHide={props.onRequestClose}
                className={classType}
                aria-labelledby="example-modal-sizes-title-md"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title className={'escalation_' + classType}>
                        {t('Escalation Warning')}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        <FontAwesome className={'icon escalation_' + classType} name='exclamation-triangle' />
                            &nbsp;&nbsp;<p className={'escalation_' + classType} style={{ display: 'inline' }}>{t(props.message)}</p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant={classType} style={{ marginTop: '20px' }} className={'close-button'} onClick={props.onRequestClose}>{t('Close')}</Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

export default EscalationModal;