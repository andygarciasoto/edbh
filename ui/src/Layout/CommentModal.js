import React from 'react';
import Modal from 'react-modal';
import { Form, Button, Table, Row, Col } from 'react-bootstrap';
import './CommentsModal.scss';
import * as _ from 'lodash';
import { API } from '../Utils/Constants';
import ConfirmModal from '../Layout/ConfirmModal';
import LoadingModal from '../Layout/LoadingModal';
import ErrorModal from '../Layout/ErrorModal';
import { sendPost, getCurrentTime, formatDateWithTime, BuildGet } from '../Utils/Requests';


class CommentsModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            comments: [],
            actualDxH_Id: null,
            modal_confirm_IsOpen: false,
            modal_loading_IsOpen: false,
            modal_error_IsOpen: false,
        }
        this.submitComment = this.submitComment.bind(this);
        this.onChange = this.onChange.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.currentRow && nextProps.isOpen) {
            this.loadData(nextProps);
        }
    }

    loadData(props) {
        const parameters = {
            params: {
                dxh_data_id: props.currentRow.dxhdata_id
            }
        }
        let requestData = BuildGet(`${API}/comments_dxh_data`, parameters);
        let _this = this;
        this.setState({ modal_loading_IsOpen: _this.state.actualDxH_Id !== props.currentRow.dxhdata_id }, () => {
            requestData.then((response) => {
                _this.setState({ comments: response.data, modal_loading_IsOpen: false, actualDxH_Id: props.currentRow.dxhdata_id });
            }).catch(function (error) {
                _this.setState({ comments: [], modal_loading_IsOpen: false })
            });
        });
    }

    submitComment(e) {
        this.setState({ modal_loading_IsOpen: true }, () => {
            const response = sendPost({
                first_name: this.props.user.first_name,
                last_name: this.props.user.last_name,
                comment: this.state.value,
                dxh_data_id: this.props.currentRow ? this.props.currentRow.dxhdata_id : undefined,
                row_timestamp: formatDateWithTime(this.props.currentRow.started_on_chunck),
                timestamp: getCurrentTime(this.props.user.timezone),
                asset_code: this.props.parentData[0]
            }, '/dxh_new_comment')
            response.then((res) => {
                if (res !== 200 || !res) {
                    this.setState({ modal_error_IsOpen: true })
                } else {
                    this.setState({ request_status: res, modal_confirm_IsOpen: true, modal_loading_IsOpen: false })
                }
                this.props.Refresh(this.props.parentData);
                this.setState({ value: '' })
                this.props.onRequestClose();
            })
        })
    }

    closeModal() {
        this.setState({ modal_confirm_IsOpen: false, modal_loading_IsOpen: false, modal_error_IsOpen: false });
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
            <React.Fragment>
                <Modal
                    isOpen={this.props.isOpen}
                    //  onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.props.onRequestClose}
                    style={styles}
                    contentLabel="Example Modal">
                    <span className="close-modal-icon" onClick={this.props.onRequestClose}>X</span>
                    <div className={"comments-table"}>
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
                    </div>
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
                            <Button variant="outline-primary" style={{ marginTop: '10px' }} disabled={this.props.readOnly} onClick={this.submitComment}>{t('Submit')}</Button>
                        </Col>
                        <Col sm={6} md={2}>
                            {this.props.readOnly ? <p style={{ marginTop: '15px', color: 'grey' }}>{t('Read-Only')}</p> : void (0)}
                        </Col>
                    </Row>
                </Modal>
                <ConfirmModal
                    isOpen={this.state.modal_confirm_IsOpen}
                    //  onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    contentLabel="Example Modal"
                    shouldCloseOnOverlayClick={false}
                    message={'Comment was inserted'}
                    title={'Request Successful'}
                    t={this.props.t}
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