import React from 'react';
import Modal from 'react-modal';
import { Form, Button, Table } from 'react-bootstrap';
import './CommentsModal.scss';
import * as _ from 'lodash';
import moment from 'moment';
import config from '../config.json';
import { sendPost } from '../Utils/Requests';

class CommentsModal extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            value : '',
        } 
        this.submitComment = this.submitComment.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    submitComment(e) {
        const response = sendPost({
            first_name: config.user.split(" ")[0],
            last_name: config.user.split(" ")[1],
            comment: this.state.value,
            dhx_data_id: this.props.rowId,
            timestamp: moment().format('YYYY-MM-DD HH:mm:ss'), 
        }, '/dxh_new_comment')
        response.then((res) => console.log(res))
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
        return (
            <Modal
                isOpen={this.props.isOpen}
                //  onAfterOpen={this.afterOpenModal}
                onRequestClose={this.props.onRequestClose}
                style={styles}
                contentLabel="Example Modal">
                <span className="close-modal-icon" onClick={this.props.onRequestClose}>X</span>
                <div className={"comments-table"}>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>{t('Date')}</th>
                                <th>{t('User')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.props.comments ? this.props.comments.map((comment, index) => {
                                return (
                                    <tr key={index}>
                                        <td className={"commentsModal-user"}><span>{`${comment.first_name} ${comment.last_name}`}</span><div className={'commentsModal-date'}>{moment(comment.last_modified_on).format('YYYY-MM-DD')}</div></td>
                                        <td className={"commentsModal-comment"}><div>{comment.comment}</div></td>
                                    </tr>
                                )
                            }) : <tr><td style={{ textAlign: 'center' }}>{'-'}</td><td>{t("There are no comments to display")}.</td></tr>}
                        </tbody>
                    </Table>
                </div>
                <span className="dashboard-modal-field-group"><p>{t('Enter new comment')}:</p>
                    <Form.Control style={{ paddingTop: '5px' }} type="text" value={this.state.value} onChange={this.onChange}></Form.Control>
                </span>
                <Button variant="outline-primary" style={{marginTop: '10px'}} onClick={this.submitComment}>{t('Submit')}</Button>
            </Modal>
        )
    }
}

Modal.setAppElement('#root');
export default CommentsModal;