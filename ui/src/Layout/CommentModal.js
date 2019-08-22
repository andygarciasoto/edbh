import React from 'react';
import Modal from 'react-modal';
import { Form, Button, Table } from 'react-bootstrap';
import './CommentsModal.scss';
import * as _ from 'lodash';
import moment from 'moment';
import ConfirmModal from  '../Layout/ConfirmModal';
import LoadingModal from  '../Layout/LoadingModal';
import ErrorModal from  '../Layout/ErrorModal';
import { sendPost, formatDateWithTime } from '../Utils/Requests';


class CommentsModal extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            value : '',
            modal_confirm_IsOpen: false,
            modal_loading_IsOpen: false,
            modal_error_IsOpen: false, 
        } 
        this.submitComment = this.submitComment.bind(this);
        this.onChange = this.onChange.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    submitComment(e) {
      this.setState({modal_loading_IsOpen: true}, () => {
        const response = sendPost({
            first_name: this.props.user.first_name,
            last_name: this.props.user.last_name,
            comment: this.state.value,
            dhx_data_id: this.props.currentRow ? this.props.currentRow.dxhdata_id : undefined,
            timestamp: formatDateWithTime(this.props.currentRow.hour_interval_start),
            asset_code: this.props.parentData[0]
        }, '/dxh_new_comment')
        response.then((res) => {
            if (res !== 200 || !res) {
                this.setState({modal_error_IsOpen: true})
            } else {
                this.setState({request_status: res, modal_confirm_IsOpen: true, modal_loading_IsOpen: false})
            }
            this.props.Refresh(this.props.parentData);
            this.setState({value: ''})
            this.props.onRequestClose();
        })
      })
    }

    closeModal() {
        this.setState({modal_confirm_IsOpen: false, modal_loading_IsOpen: false, modal_error_IsOpen: false});
    }

    onChange(e) {
        this.setState({ value: e.target.value });
    }

    render() {
        const styles = _.cloneDeep(this.props.style);
        if (!_.isEmpty(styles)) {
            styles.content.width = '60%';
        }
        const t = this.props.t;
        const comments = _.sortBy(this.props.comments, 'last_modified_on').reverse();
        return (
            <React.Fragment>
            <Modal
                isOpen={this.props.isOpen}
                //  onAfterOpen={this.afterOpenModal}
                onRequestClose={this.props.onRequestClose}
                style={styles}
                contentLabel="Example Modal">
                <span className="close-modal-icon" onClick={this.props.onRequestClose}>X</span>
                <div className={"comments-table"}>
                <span><h4 style={{marginLeft: '10px'}}>{t('Comments This Hour')}</h4></span>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>{t('Date')}</th>
                                <th>{t('User')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(comments && comments.length > 0) ? comments.map((comment, index) => {
                                return (
                                    <tr key={index}>
                                        <td className={"commentsModal-user"}>
                                            <span>{`${comment.first_name} ${comment.last_name}`}</span>
                                            <div className={'commentsModal-date'}>{moment(comment.last_modified_on).format('YYYY-MM-DD')}</div>
                                        </td>
                                        <td className={"commentsModal-comment"}><div>{comment.comment}</div></td>
                                    </tr>
                                )
                            }) : <tr><td colSpan={2}>{t("There are no comments to display")}</td></tr>}
                        </tbody>
                    </Table>
                </div>
                <span className="dashboard-modal-field-group"><p>{t('Enter new comment')}:</p>
                    <Form.Control style={{ paddingTop: '5px' }} type="text" value={this.state.value} onChange={this.onChange}></Form.Control>
                </span>
                <Button variant="outline-primary" style={{marginTop: '10px'}} onClick={this.submitComment}>{t('Submit')}</Button>
            </Modal>
            <ConfirmModal
                isOpen={this.state.modal_confirm_IsOpen}
                //  onAfterOpen={this.afterOpenModal}
                onRequestClose={this.closeModal}
                contentLabel="Example Modal"
                shouldCloseOnOverlayClick={false}
                message={'Comment was inserted.'}
                title={'Request Successful'}
            />
            <LoadingModal
                isOpen={this.state.modal_loading_IsOpen}
                //  onAfterOpen={this.afterOpenModal}
                onRequestClose={this.closeModal}
                contentLabel="Example Modal"
                t={this.props.t}
            />
            <ErrorModal
                isOpen={this.state.modal_error_IsOpen}
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