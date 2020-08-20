import React from 'react';
import Modal from 'react-modal';
import { Form, Button, Table, Row, Col } from 'react-bootstrap';
import './CommentsModal.scss';
import * as _ from 'lodash';
import { API } from '../Utils/Constants';
import LoadingModal from '../Layout/LoadingModal';
import MessageModal from './MessageModal';
import { getCurrentTime, formatDateWithTime, getResponseFromGeneric } from '../Utils/Requests';


class CommentsModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            comments: [],
            actualDxH_Id: null,
            modal_loading_IsOpen: false,
            modal_message_isOpen: false,
            modal_type: '',
            modal_message: ''
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

    submitComment = (e) => {
                comment: this.state.value,
                dxh_data_id: this.props.currentRow ? this.props.currentRow.dxhdata_id : undefined,
                timestamp: getCurrentTime(this.props.user.timezone),
                asset_code: this.props.parentData[0]
            };

            let res = await getResponseFromGeneric('post', API, '/dxh_new_comment', {}, {}, data);
            if (res.status !== 200) {
                this.setState({ modal_loading_IsOpen: false, modal_message_isOpen: true, modal_type: 'Error', modal_message: 'Comment not created' });
            } else {
                this.setState({ request_status: res, modal_loading_IsOpen: false, modal_message_isOpen: true, modal_type: 'Success', modal_message: 'Comment was inserted' });
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
        this.setState({ value: '', modal_message_isOpen: false });
        
    }

    onChange = (e) => {
        this.setState({ value: e.target.value });
    }

    render() {
        const styles = _.cloneDeep(this.props.style);
        if (!_.isEmpty(styles)) {
            styles.content.width = '60%';
        }
        const t = this.props.t;
        return (
            <React.Fragment>
                <Modal
                    isOpen={this.props.isOpen}
                    onRequestClose={() => this.closeCommentModal()}
                    style={styles}
                    contentLabel="Example Modal">

                    <span><h4 style={{ marginLeft: '10px' }}>{t('Comments This Hour')}</h4></span>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>{t('Date')}</th>
                                <th>{t('User')}</th>
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
                            disabled={this.props.readOnly}
                            onChange={this.onChange}>
                        </Form.Control>
                    </span>
                    <Row>
                        <Col sm={6} md={2}>
                            <Button variant="outline-info" style={{ marginTop: '10px' }} disabled={this.props.readOnly} onClick={this.submitComment}>{t('Submit')}</Button>
                        </Col>
                        <Col sm={6} md={2}>
                            <Button variant="outline-danger" style={{ marginTop: '10px' }} onClick={() => this.closeCommentModal()}>{t('Cancel')}</Button>
                        </Col>
                        <Col sm={6} md={2}>
                            <Button variant="outline-danger" style={{ marginTop: '10px' }} onClick={() => this.closeCommentModal()}>{t('Cancel')}</Button>
                        </Col>
                        <Col sm={6} md={2}>
                            {this.props.readOnly ? <p style={{ marginTop: '15px', color: 'grey' }}>{t('Read-Only')}</p> : void (0)}
                        </Col>
                    </Row>
                </Modal>
                <MessageModal
                    isOpen={this.state.modal_message_isOpen}
                    onRequestClose={this.closeModal}
                    type={this.state.modal_type}
                    message={this.state.modal_message}
                    t={this.props.t}
                />
                <LoadingModal
                    isOpen={this.state.modal_loading_IsOpen}
                    //  onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    contentLabel="Example Modal"
                    t={this.props.t}
                />
            </React.Fragment>
        )
    }
}

Modal.setAppElement('#root');
export default CommentsModal;