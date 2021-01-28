import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Table } from 'react-bootstrap';
import { formatDateWithTime } from '../../Utils/Requests';
import '../../sass/IntershiftModal.scss';

class IntershiftModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.isOpen !== prevState.isOpen) {
            return {
                isOpen: nextProps.isOpen
            };
        }
        return null;
    }

    render() {
        const props = this.props;
        const { t, intershiftComments } = props;
        return (
            <React.Fragment>
                <Modal
                    size="xl"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    className='intershift-modal'
                    show={this.state.isOpen} onHide={props.onRequestClose}
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            {t('Intershift Communications')}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>{t('User')}</th>
                                    <th>{t('Comment')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {intershiftComments.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td className={"intershift-info"}><span>{`${item.first_name} - ${item.last_name}`}</span>
                                                <div className={'intershift-date-modal'}>{formatDateWithTime(item.entered_on)}</div></td>
                                            <td className={"intershift-comment-modal"}><div>{item.comment}</div></td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </Table>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={props.onRequestClose} variant='outline-danger'>{t('Cancel')}</Button>
                    </Modal.Footer>
                </Modal>
            </React.Fragment>
        )
    }
}

export default IntershiftModal;