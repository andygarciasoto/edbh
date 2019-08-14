
import React from 'react';
import { Button, Table, Form } from 'react-bootstrap';
import './Comments.scss';
import ThreadModal from '../Layout/ThreadModal';
import FontAwesome from  'react-fontawesome';
import Spinner from '../Spinner';
import moment from 'moment';

class Comments extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            modal_thread_IsOpen: false,
            commentLen: 0,
            lastComment: {}
        } 
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }  

    enterCommunication(comm) {
    }

    closeModal() {
        this.setState({modal_thread_IsOpen: false});
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
                    {lastComment ? Object.values(lastComment).length > 0 ? <React.Fragment>
                        <tr>
                            <td style={{width: '20%'}}><span>{`${lastComment.entered_by} - ${lastComment.first_name}`}</span><div className={'intershift-comment-date'}>{lastCommentDate}</div></td>
                            <td className={"intershift-comment"}><div>{lastComment.comments}</div>
                            <span className="intershift-read-more" onClick={this.openModal}>{`${t('Read More')} (${this.state.commentLen})`}<FontAwesome name="angle-right" style={{paddingLeft: 5}}/></span></td>
                        </tr>
                        </React.Fragment> : <tr><td ><Spinner/></td><td className={"intershift-comment"}><Spinner/></td></tr> : <Spinner />}
                    </tbody>
                </Table>
                </div>
                <span className="dashboard-modal-field-group">
                    <p>{t('Enter new communication')}:</p>
                    <Form.Control style={{paddingTop: '5px'}} type="text" value={this.state.value} onChange={this.onChange}></Form.Control>
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
            </div>
        )
    }
};

export default Comments;


