import React from  'react';
import Modal from 'react-modal';
import './ErrorModal.scss';
import {Button} from 'react-bootstrap'
import * as _ from 'lodash';
import { withRouter } from 'react-router-dom'


class SignoffModal extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            value : '',
            signoffMessage: this.props.t(this.props.message) || this.props.t('You have signed off for this hour. You are aware that all the values for this hour are correct.'),
            headerMessage: `${this.props.roletype} ${this.props.t('Sign Off')}`,
            style: {
                content : {
                    top                   : '50%',
                    left                  : '50%',
                    right                 : 'auto',
                    bottom                : 'auto',
                    marginRight           : '-50%',
                    transform             : 'translate(-50%, -50%)',
                  },
                  overlay : {
                    backgroundColor: 'rgba(0,0,0, 0.6)'
                }
            }
        } 
    }

    componentWillReceiveProps(nextProps) {
        console.log(nextProps)
    }

    render() {
        const styles = _.cloneDeep(this.props.style || this.state.style);
        if (!_.isEmpty(styles)) {
            styles.content.width = '50%';
        }
        return (
            <Modal
                isOpen={this.props.isOpen}
                //  onAfterOpen={this.afterOpenModal}
                onRequestClose={this.props.onRequestClose}
                style={styles}
                contentLabel="Example Modal">
                <span className="close-modal-icon" onClick={this.props.onRequestClose}>X</span>
                <div className={"wrap-signoff"}>
                    <p style={{fontWeight: 'bold'}} className="dashboard-modal-signoff-header">{this.state.headerMessage}</p>
                    <p style={{textAlign: 'center'}}>{this.state.signoffMessage}</p>
                    <Button variant="outline-default" style={{marginTop: '20px', textAlign: 'center'}} className="error-button" onClick={this.props.onRequestClose}>
                    {this.props.t('Accept')}</Button>
                </div>
            </Modal>
        )
    }
}

Modal.setAppElement('#root');
export default withRouter(SignoffModal);