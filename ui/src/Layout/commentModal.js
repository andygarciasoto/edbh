import React from  'react';
import Modal from 'react-modal';
import { Form, Button, Table } from 'react-bootstrap';
import './CommentsModal.scss';
import * as _ from 'lodash';

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

    componentDidMount() {
    }

    render() {
        const styles = _.cloneDeep(this.props.style);
        if (!_.isEmpty(styles)) {
            styles.content.width = '60%';
        }
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
                        <th>#</th>
                        <th>User</th>
                        <th>Comment</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                        <td>1</td>
                        <td>Jim - Operator</td>
                        <td className={"commentsModal-comment"}>We need more staples</td>
                        </tr>
                        <tr>
                        <td>2</td>
                        <td>Dwight - Operator</td>
                        <td className={"commentsModal-comment"}>We already have enough staples</td>
                        </tr>
                        <tr>
                        <td>3</td>
                        <td>Michael - Supervisor</td>
                        <td className={"commentsModal-comment"}>What about lasers</td>
                        </tr>
                    </tbody>
                </Table>
                <span className="dashboard-modal-field-group"><p>Enter new comment:</p>
                    <Form.Control style={{paddingTop: '5px'}} type="text" value={this.state.value} onChange={this.onChange}></Form.Control>
                </span>
                <Button variant="outline-primary" style={{marginTop: '10px'}} onClick={this.validateBarcode}>Submit</Button>
            </Modal>
        )
    }
}

Modal.setAppElement('#root');
export default CommentsModal;