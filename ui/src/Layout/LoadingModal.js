import React from  'react';
import Modal from 'react-modal';
import './errorModal.scss';
import BlinkDots from  './BlinkDots';
import Spinner from '../Spinner';
import * as _ from 'lodash';
import { withRouter } from 'react-router-dom'


class LoadingModal extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            value : '',
            loadingMessage: this.props.t('Logging you in'),
            headerMessage: this.props.t('Please Wait')
        } 
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.login === true) {
            setTimeout(function(){
                nextProps.history.push('/dashboard')},
            3000);
        }
    }

    render() {
        const styles = _.cloneDeep(this.props.style);
        if (!_.isEmpty(styles)) {
            styles.content.width = '20%';
        }
        return (
            <Modal
                isOpen={this.props.isOpen}
                //  onAfterOpen={this.afterOpenModal}
                onRequestClose={this.props.onRequestClose}
                style={styles}
                contentLabel="Example Modal">
                <span className="close-modal-icon" onClick={this.props.onRequestClose}>X</span>
                <div><p className="dashboard-modal-error-field-head">{this.state.headerMessage}</p>
                <p className="warning-message">{this.state.loadingMessage}</p><BlinkDots />
                <Spinner/>
                </div>
            </Modal>
        )
    }
}

Modal.setAppElement('#root');
export default withRouter(LoadingModal);