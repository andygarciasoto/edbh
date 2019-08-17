
import React from 'react';
import { Button, Table, Form } from 'react-bootstrap';
import './Comments.scss';
import ThreadModal from '../Layout/ThreadModal';
import FontAwesome from  'react-fontawesome';
import Spinner from '../Spinner';
import moment from 'moment';
import { sendPut } from '../Utils/Requests';
import ErrorModal from '../Layout/ErrorModal';
import ConfirmModal from '../Layout/ErrorModal';

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
        } 
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.enterCommunication = this.enterCommunication.bind(this);
    }  

    enterCommunication(e) {
        console.log(this.props.dhx_data_id)
        const data = {
            dhx_data_id : 1,
            comment : this.state.value,
            first_name: this.props.user.first_name,
            last_name: this.props.user.last_name,
            clocknumber: this.props.user.clock_number,
            inter_shift_id : 0,
        }
        const response = sendPut(data, '/intershift_communication');
        console.log(response)
        response.then((res) => {
            this.setState({request_status: res, modal_confirm_IsOpen: true})
            if (res !== 200) {
                this.setState({modal_error_IsOpen: true})
            }
        })
    }

    closeModal() {
        this.setState({
            modal_thread_IsOpen: false,
            modal_error_IsOpen: false,
            modal_confirm_IsOpen: false,
        });
    }

    openModal() {
        this.setState({modal_thread_IsOpen: true});
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.comments) {
            this.setState({
                lastComment: nextProps.comments[0] || null,
                commentLen: nextProps.comments.length
            }) 
        }
    }

    render() {
        const t = this.props.t;
        const lastComment = this.state.lastComment;
        const lastCommentDate = lastComment ? moment(lastComment.production_day).format('YYYY-MM-DD') : null;
        // console.log(lastCommentDate)
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
                            <td style={{width: '20%'}}><span>{`${lastComment.entered_by} - ${lastComment.first_name}`}</span><div className={'intershift-comment-date'}>{lastCommentDate}</div></td>
                            <td className={"intershift-comment"}><div>{lastComment.comments}</div>
                            <span className="intershift-read-more" onClick={this.openModal}>{`${t('Read More')} (${this.state.commentLen})`}<FontAwesome name="angle-right" style={{paddingLeft: 5}}/></span></td>
                        </tr>
                        </React.Fragment> : <tr><td ><Spinner/></td><td className={"intershift-comment"}><Spinner/></td></tr> :<tr><td colSpan={2}>No intershift communications for this shift.</td></tr>: <Spinner />}
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
                    style={this.state.modalStyle}
                    contentLabel="Example Modal"
                    comments={this.props.comments}
                    t={t}
                />
                <ErrorModal
                    isOpen={this.state.modal_error_IsOpen}
                    //  onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    style={this.state.modalStyle}
                    contentLabel="Example Modal"
                    shouldCloseOnOverlayClick={false}
                    message={'Intershift Communication was not inserted in the database.'}
                    title={'Database Error - Bad Request'}
                />
                <ConfirmModal
                    isOpen={this.state.modal_confirm_IsOpen}
                    //  onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    style={this.state.modalStyle}
                    contentLabel="Example Modal"
                    shouldCloseOnOverlayClick={false}
                    message={'Intershift Communication was inserted.'}
                    title={'Request Successful'}
                />
            </div>
        )
    }
};

export default Comments;


