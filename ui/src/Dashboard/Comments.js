
import React from 'react';
import { Button, Table, Form } from 'react-bootstrap';
import './Comments.scss';
import ThreadModal from '../Layout/ThreadModal';
import FontAwesome from 'react-fontawesome';
import Spinner from '../Spinner';
import _ from 'lodash';
import { API } from '../Utils/Constants';
import { getResponseFromGeneric, getCurrentTime, formatDateWithTime } from '../Utils/Requests';
import ErrorModal from '../Layout/ErrorModal';
import ConfirmModal from '../Layout/ConfirmModal';
import LoadingModal from '../Layout/LoadingModal';

class Comments extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modal_thread_IsOpen: false,
            lastComment: null,
            value: '',
            modal_error_IsOpen: false,
            modal_confirm_IsOpen: false,
            modal_loading_IsOpen: false,
            row: this.props.dxh_parent || {}
        }
    }

    enterCommunication = (e) => {
        let data = {};
        this.setState({ modal_loading_IsOpen: true }, async () => {
            if (!_.isEmpty(this.state.row)) {
                data = {
                    dxh_data_id: this.state.row.dxhdata_id,
                    comment: this.state.value,
                    first_name: this.props.user.first_name,
                    last_name: this.props.user.last_name,
                    timestamp: getCurrentTime(this.props.timezone),
                    row_timestamp: formatDateWithTime(this.state.row.started_on_chunck),
                    inter_shift_id: 0,
                    asset_code: this.props.parentData[0]
                }
            }

            let res = await getResponseFromGeneric('put', API, '/intershift_communication', {}, {}, data);
            if (res.status !== 200) {
                this.props.openMessageModal('Error', 'Fail on insert the new comment intershift communication.');
                this.setState({ modal_loading_IsOpen: false });
            } else {
                this.props.openMessageModal('Success', 'Success on insert the new comment intershift communication.');
                this.setState({ modal_loading_IsOpen: false });
            }
            this.setState({ value: '' });
            this.props.Refresh(this.props.parentData);
        })
    }

    closeModal = () => {
        this.setState({
            modal_thread_IsOpen: false,
            modal_error_IsOpen: false,
            modal_confirm_IsOpen: false,
            modal_loading_IsOpen: false
        });
    }

    openModal = () => {
        this.setState({ modal_thread_IsOpen: true });
    }

    componentWillMount() {
        this.setState({ row: this.props.dxh_parent })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.comments) {
            this.setState({
                lastComment: nextProps.comments.length > 0 ? _.sortBy(nextProps.comments, 'entered_on').reverse()[0] : null,
                comments: nextProps.comments,
                row: nextProps.dxh_parent
            })
        }
    }

    render() {
        const t = this.props.t;
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
                            {this.state.comments ? (this.state.lastComment ? <React.Fragment>
                                <tr>
                                    <td style={{ width: '20%' }}>
                                        <span>{`${this.state.lastComment.first_name} ${this.state.lastComment.last_name}`}</span>
                                        <div className={'intershift-comment-date'}>{formatDateWithTime(this.state.lastComment.entered_on)}</div>
                                    </td>
                                    <td style={{ width: '80%' }} className={"intershift-comment"}>
                                        <div>{this.state.lastComment.comment}</div>
                                        {this.state.comments.length > 1 ?
                                            <span className="intershift-read-more"
                                                onClick={this.openModal}>{`${t('Read More')}
                                        (${this.state.comments.length})`}
                                                <FontAwesome name="angle-right" style={{ paddingLeft: 5 }} />
                                            </span> : null
                                        }
                                    </td>
                                </tr>
                            </React.Fragment> :
                                <tr><td colSpan={2}>{t('No intershift communications for this shift')}.</td></tr>) :
                                <tr><td colSpan={3}><Spinner /></td></tr>}
                        </tbody>
                    </Table>
                </div>
                <span className="dashboard-modal-field-group">
                    <p>{t('Enter new communication')}:</p>
                    <Form.Control style={{ paddingTop: '5px' }} type="text" value={this.state.value} disabled={this.props.readOnly} onChange={(e) => this.setState({ value: e.target.value })}></Form.Control>
                </span>
                <Button variant="outline-primary" style={{ marginTop: '10px' }} disabled={this.props.readOnly} onClick={this.enterCommunication}>{t('Submit')}</Button>
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
                    message={'Intershift Communication was not inserted'}
                    title={'Bad Request'}
                    t={t}
                />
                <ConfirmModal
                    isOpen={this.state.modal_confirm_IsOpen}
                    //  onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    contentLabel="Example Modal"
                    message={'Intershift Communication was inserted'}
                    title={'Request Successful'}
                    t={t}
                />
                <LoadingModal
                    isOpen={this.state.modal_loading_IsOpen}
                    //  onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    contentLabel="Example Modal"
                    t={t}
                />
            </div>
        )
    }
};

export default Comments;


