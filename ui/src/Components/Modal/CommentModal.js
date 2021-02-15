import React from 'react';
import { Modal, Form, Button, Table, Row, Col } from 'react-bootstrap';
import { API } from '../../Utils/Constants';
import LoadingModal from '../Common/LoadingModal';
import MessageModal from '../Common/MessageModal';
import BarcodeScannerModal from '../Common/BarcodeScannerModal';
import { getCurrentTime, formatDateWithTime, getResponseFromGeneric } from '../../Utils/Requests';
import '../../sass/CommentModal.scss';


class CommentsModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            comments: [],
            actualDxH_Id: null,
            modal_loading_IsOpen: false,
            modal_message_IsOpen: false,
            modal_type: '',
            modal_message: '',
            modal_validate_IsOpen: false
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.currentRow && nextProps.isOpen) {
            this.loadData(nextProps);
        }
    }

    async loadData(props) {
        const parameters = {
            dxh_data_id: props.currentRow.dxhdata_id
        }
        let res = await getResponseFromGeneric('get', API, '/comments_dxh_data', {}, parameters, {}) || [];
        this.setState({ comments: res, modal_loading_IsOpen: false, actualDxH_Id: props.currentRow.dxhdata_id });
    }

    submitComment = () => {
        const props = this.props;
        if (props.selectedAssetOption.is_multiple && props.user.role === 'Operator') {
            if (props.activeOperators.length > 1) {
                this.setState({ modal_validate_IsOpen: true });
            } else {
                this.submitNewComment(props.activeOperators[0].badge);
            }
        } else {
            this.submitNewComment(props.user.clock_number);
        }
    }

    handleScan = (badge) => {
        this.setState({ modal_validate_IsOpen: false, modal_loading_IsOpen: true }, async () => {
            const parameters = {
                badge: badge,
                site_id: this.props.user.site
            };
            let res = await getResponseFromGeneric('get', API, '/find_user_information', {}, parameters, {}) || [];
            if (!res[0]) {
                this.setState({
                    modal_loading_IsOpen: false,
                    modal_type: 'Error',
                    modal_message: 'Error finding the user. Please try again',
                    modal_message_IsOpen: true
                });
            } else {
                this.setState({
                    modal_loading_IsOpen: false
                });
                this.submitNewComment(badge);
            }
        });
    }

    submitNewComment(badge) {
        this.setState({ modal_loading_IsOpen: true }, async () => {
            const data = {
                clocknumber: badge,
                comment: this.state.value,
                dxh_data_id: this.props.currentRow ? this.props.currentRow.dxhdata_id : undefined,
                row_timestamp: formatDateWithTime(this.props.currentRow.started_on_chunck),
                timestamp: getCurrentTime(this.props.user.timezone),
                asset_code: this.props.parentData[0]
            };

            let res = await getResponseFromGeneric('post', API, '/dxh_new_comment', {}, {}, data);
            if (res.status !== 200) {
                this.setState({ modal_loading_IsOpen: false, modal_message_IsOpen: true, modal_type: 'Error', modal_message: 'Comment not created. Please try again' });
            } else {
                this.setState({ request_status: res, modal_loading_IsOpen: false, modal_message_IsOpen: true, modal_type: 'Success', modal_message: 'Comment was inserted successfully' });
            }
            this.props.Refresh(this.props.parentData);
            this.closeCommentModal();
        });
    }

    closeCommentModal = () => {
        this.setState({ value: '' })
        this.props.onRequestClose();
    }

    closeModal = () => {
        this.setState({ value: '', modal_message_IsOpen: false, modal_validate_IsOpen: false });

    }

    onChange = (e) => {
        this.setState({ value: e.target.value });
    }

    render() {
        const t = this.props.t;
        const props = this.props;
        return (
            <React.Fragment>
                <Modal
                    centered
                    show={props.isOpen}
                    onHide={props.onRequestClose}
                    className='commentModal'>
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            {t('Comments This Hour')}
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
                                {(this.state.comments.length > 0) ? this.state.comments.map((comment, index) => {
                                    return (
                                        <tr key={index}>
                                            <td className={"commentsModal-user"}>
                                                <span>{`${comment.first_name} ${comment.last_name}`}</span>
                                                <div className={'commentsModal-date'}>{formatDateWithTime(comment.last_modified_on)}</div>
                                            </td>
                                            <td className={"commentsModal-comment"}><div>{comment.comment}</div></td>
                                        </tr>
                                    )
                                }) : <tr><td colSpan={2}>{t("There are no comments to display")}</td></tr>}
                            </tbody>
                        </Table>

                        <span className="dashboard-modal-field-group"><p>{t('Enter new comment')}:</p>
                            <Form.Control
                                style={{ paddingTop: '5px' }}
                                type="text" value={this.state.value}
                                autoFocus
                                disabled={!this.props.isEditable}
                                onChange={this.onChange}>
                            </Form.Control>
                        </span>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-info" disabled={!this.props.isEditable} onClick={this.submitComment}>{t('Submit')}</Button>
                        <Button variant="outline-danger" onClick={() => this.closeCommentModal()}>{t('Cancel')}</Button>
                        <Row>
                            <Col sm={12} md={12}>
                                {!this.props.isEditable ? <p style={{ marginTop: '15px', color: 'grey' }}>{t('Read-Only')}</p> : void (0)}
                            </Col>
                        </Row>
                    </Modal.Footer>
                </Modal>
                <MessageModal
                    isOpen={this.state.modal_message_IsOpen}
                    onRequestClose={this.closeModal}
                    type={this.state.modal_type}
                    message={this.state.modal_message}
                    t={t}
                />
                <LoadingModal
                    isOpen={this.state.modal_loading_IsOpen}
                    onRequestClose={this.closeModal}
                    contentLabel="Example Modal"
                    t={t}
                />
                <BarcodeScannerModal
                    isOpen={this.state.modal_validate_IsOpen}
                    modalTitle={'Operator Scan'}
                    inputText={'Please scan badge to proceed'}
                    onRequestClose={this.closeModal}
                    t={t}
                    responseScan={this.handleScan}
                />
            </React.Fragment>
        )
    }
}

export default CommentsModal;