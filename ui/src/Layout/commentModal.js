import React from  'react';
import Modal from 'react-modal';
import { Form, Button, Table } from 'react-bootstrap';
import './CommentsModal.scss';
import * as _ from 'lodash';
import FontAwesome from 'react-fontawesome';

class CommentsModal extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            value : '',
        } 
        this.validateBarcode = this.validateBarcode.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    validateBarcode(e) {
        console.log(this.state.value);
    }

    onChange(e) {
        this.setState({value: e.target.value});
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
                <Table striped bordered hover>
                    <thead>
                        <tr>
                        <th>{t('Date')}</th>
                        <th>{t('User')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className={"commentsModal-user"}><span>Jim - Operator</span><div className={'commentsModal-date'}>19/07/2019 - 14:23</div></td>
                            <td className={"commentsModal-comment"}><div>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt 
                                ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.</div></td>
                        </tr>
                        <tr>
                            <td className={"commentsModal-user"}><span>Brian - Operator</span><div className={'commentsModal-date'}>19/07/2019 - 14:23</div></td>
                            <td className={"commentsModal-comment"}><div>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt 
                                ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud. dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt 
                                ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.</div></td>
                        </tr>
                        <tr>
                            <td className={"commentsModal-user"}><span>Dwight - Operator</span><div className={'commentsModal-date'}>19/07/2019 - 14:23</div></td>
                            <td className={"commentsModal-comment"}><div>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt 
                                ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.</div></td>
                        </tr>
                    </tbody>
                </Table>
                <span className="dashboard-modal-field-group"><p>{t('Enter new comment')}:</p>
                    <Form.Control style={{paddingTop: '5px'}} type="text" value={this.state.value} onChange={this.onChange}></Form.Control>
                </span>
                <Button variant="outline-primary" style={{marginTop: '10px'}} onClick={this.validateBarcode}>{t('Submit')}</Button>
            </Modal>
        )
    }
}

Modal.setAppElement('#root');
export default CommentsModal;