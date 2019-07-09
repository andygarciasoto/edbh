
import React from 'react';
import { Button, Table, Form } from 'react-bootstrap';
import './Comments.scss';
import ThreadModal from '../Layout/ThreadModal';
import FontAwesome from  'react-fontawesome';

class Comments extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            modal_thread_IsOpen: false,
        } 
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }  

    enterCommunication(comm) {
        console.log(comm);
    }

    closeModal() {
        this.setState({modal_thread_IsOpen: false});
    }

    openModal() {
        this.setState({modal_thread_IsOpen: true});
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
                        <tr>
                            <td><span>Jim - Operator</span><div className={'intershift-comment-date'}>19/07/2019 - 14:23</div></td>
                            <td className={"intershift-comment"}><div>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt 
                                ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.</div>
                            <span className="intershift-read-more" onClick={this.openModal}>Read More<FontAwesome name="angle-right" style={{paddingLeft: 5}}/></span></td>
                        </tr>
                    </tbody>
                </Table>
                </div>
                <span className="dashboard-modal-field-group"><p>{t('Enter new communication:')}</p>
                    <Form.Control style={{paddingTop: '5px'}} type="text" value={this.state.value} onChange={this.onChange}></Form.Control>
                </span>
                <Button variant="outline-primary" style={{marginTop: '10px'}} onClick={this.enterCommunication}>{t('Submit')}</Button>
                <ThreadModal
                    isOpen={this.state.modal_thread_IsOpen}
                    //  onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    style={this.state.modalStyle}
                    contentLabel="Example Modal"/>
            </div>
        )
    }
};

export default Comments;


