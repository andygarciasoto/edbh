
import React from 'react';
import { Button, Table, Form } from 'react-bootstrap';
import './Comments.scss';
import ThreadModal from '../Layout/ThreadModal';
import FontAwesome from  'react-fontawesome';
import Spinner from '../Spinner';
import moment from 'moment';
import _ from 'lodash';
import { sendPut, formatDateWithTime } from '../Utils/Requests';
import ErrorModal from '../Layout/ErrorModal';
import ConfirmModal from '../Layout/ConfirmModal';
import LoadingModal from '../Layout/LoadingModal';

class Comments extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            modal_thread_IsOpen: false,
            commentLen: 0,
            lastComment: {},
            value: '',
            modal_error_IsOpen: false,
            modal_confirm_IsOpen: false,
            modal_loading_IsOpen: false,
        } 
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.enterCommunication = this.enterCommunication.bind(this);
    }  

    enterCommunication(e) {
        this.setState({modal_loading_IsOpen: true}, () => {
            const data = {
                dhx_data_id : this.props.dxh_id,
                comment : this.state.value,
                first_name: this.props.user.first_name,
                last_name: this.props.user.last_name,
                timestamp: formatDateWithTime(this.props.selectedDate),
                inter_shift_id : 0,
            }
            const response = sendPut(data, '/intershift_communication');
            response.then((res) => {
                if (res !== 200) {
                    this.setState({ modal_loading_IsOpen: false, modal_error_IsOpen: true})
                } else {
                    this.setState({modal_loading_IsOpen: false, request_status: res, modal_confirm_IsOpen: true})
                }
            })
            this.props.Refresh(this.props.parentData);
        })
    }

    closeModal() {
        this.setState({
            modal_thread_IsOpen: false,
            modal_error_IsOpen: false,
            modal_confirm_IsOpen: false,
            modal_loading_IsOpen: false
        });
    }

    openModal() {
        this.setState({modal_thread_IsOpen: true});
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.comments) {
           let comments = [];
            if (nextProps.comments && nextProps.comments instanceof Array) {
                for (let comment of nextProps.comments) {
                    comments.push(comment.InterShiftData)
                }
            }
            comments = _.sortBy(comments, 'entered_on').reverse();
            this.setState({
                lastComment: comments[0] || null,
                commentLen: comments.length,
                comments: comments
            }) 
        }
    }

    render() {
        const t = this.props.t;
        let lastComment;
        if (this.state.lastComment) {
           lastComment = this.state.lastComment;
        }
        const lastCommentDate = lastComment ? moment(lastComment.entered_on).format('YYYY-MM-DD') : null;
        return (
            <div className={'intershift-communication-comments'}>
                <h5>{t('Intershift Communication')}</h5>
                <div id="intershift-table">
                <Table striped bordered hover className="intershift-communication-table">
                    <thead>
                        <tr>
                        <th>{t('User')}</th>
                        <th>{t('Comment')}</th>
                        </tr>
                    </thead>
                    <tbody>
                    {lastComment ? lastComment.intershift_id !== null ? Object.values(lastComment).length > 0 ? <React.Fragment>
                        <tr>
                            <td style={{width: '20%'}}><span>{`${lastComment.first_name} - ${lastComment.last_name}`}</span><div className={'intershift-comment-date'}>{lastCommentDate}</div></td>
                            <td className={"intershift-comment"}><div>{lastComment.comment}</div>
                            <span className="intershift-read-more" onClick={this.openModal}>{`${t('Read More')} (${this.state.commentLen})`}<FontAwesome name="angle-right" style={{paddingLeft: 5}}/></span></td>
                        </tr>
                        </React.Fragment> : <tr><td ><Spinner/></td><td className={"intershift-comment"}><Spinner/></td></tr> : 
                        <tr><td colSpan={2}>{'No intershift communications for this shift.'}</td></tr>: 
                        <tr><td colSpan={3}><Spinner /></td></tr>}
                    </tbody>
                </Table>
                </div>
                <span className="dashboard-modal-field-group">
                    <p>{t('Enter new communication')}:</p>
                    <Form.Control style={{paddingTop: '5px'}} type="text" value={this.state.value} onChange={(e) => this.setState({value: e.target.value})}></Form.Control>
                </span>
                <Button variant="outline-primary" style={{marginTop: '10px'}} onClick={this.enterCommunication}>{t('Submit')}</Button>
                <ThreadModal
                    isOpen={this.state.modal_thread_IsOpen}
                    //  onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    contentLabel="Example Modal"
                    comments={this.state.comments}
                    t={t}
                />
                <ErrorModal
                    isOpen={this.state.modal_error_IsOpen}
                    //  onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    contentLabel="Example Modal"
                    message={'Intershift Communication was not inserted in the database.'}
                    title={'Database Error - Bad Request'}
                />
                <ConfirmModal
                    isOpen={this.state.modal_confirm_IsOpen}
                    //  onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    contentLabel="Example Modal"
                    message={'Intershift Communication was inserted.'}
                    title={'Request Successful'}
                />
                <LoadingModal
                    isOpen={this.state.modal_loading_IsOpen}
                    //  onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    contentLabel="Example Modal"
                    t={this.props.t}
                />
            </div>
        )
    }
};

export default Comments;


