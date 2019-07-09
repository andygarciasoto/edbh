import React from  'react';
import Modal from 'react-modal';
import { Table } from 'react-bootstrap';
import './ThreadModal.scss';
import * as _ from 'lodash';

class ThreadModal extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            value : '',
            modalStyle: {},
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
        const modalStyle = {
            content : {
              top                   : '50%',
              left                  : '50%',
              right                 : 'auto',
              bottom                : 'auto',
              marginRight           : '-50%',
              transform             : 'translate(-50%, -50%)',
              maxHeight: '60%',
              overflowY: 'scroll'
            },
            overlay : {
              backgroundColor: 'rgba(0,0,0, 0.6)'
            }
          };
          
          this.setState({modalStyle})
    }
    

    render() {
        const styles = _.cloneDeep(this.state.modalStyle);
        if (!_.isEmpty(styles)) {
            styles.content.width = '70%';
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
                            <th>User</th>
                            <th>Comment</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className={"intershift-info"}><span>Jim - Operator</span><div className={'intershift-date-modal'}>19/07/2019 - 14:23</div></td>
                            <td className={"intershift-comment-modal"}><div>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.</div></td>
                        </tr>
                        <tr>
                            <td className={"intershift-info"}><span>Jim - Operator</span><div className={'intershift-date-modal'}>19/07/2019 - 14:23</div></td>
                            <td className={"intershift-comment-modal"}><div>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.</div></td>
                        </tr>
                        <tr>
                            <td className={"intershift-info"}><span>Jim - Operator</span><div className={'intershift-date-modal'}>19/07/2019 - 14:23</div></td>
                            <td className={"intershift-comment-modal"}><div>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.</div></td>
                        </tr>
                        <tr>
                            <td className={"intershift-info"}><span>Jim - Operator</span><div className={'intershift-date-modal'}>19/07/2019 - 14:23</div></td>
                            <td className={"intershift-comment-modal"}><div>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.</div></td>
                        </tr>
                        <tr>
                            <td className={"intershift-info"}><span>Jim - Operator</span><div className={'intershift-date-modal'}>19/07/2019 - 14:23</div></td>
                            <td className={"intershift-comment-modal"}><div>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.</div></td>
                        </tr>
                    </tbody>
                </Table>
            </Modal>
        )
    }
}

Modal.setAppElement('#root');
export default ThreadModal;