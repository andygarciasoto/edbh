import React from  'react';
import Modal from 'react-modal';
import './ErrorModal.scss';
import BlinkDots from  './BlinkDots';
import Spinner from '../Spinner';
import * as _ from 'lodash';


class LoadingModal extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            value : '',
        } 
    }

    componentDidMount() {
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
                <div><p className="dashboard-modal-error-field-head">Please Wait</p>
                <p className="warning-message">Loading </p><BlinkDots />
                <Spinner/>
                </div>
            </Modal>
        )
    }
}

Modal.setAppElement('#root');
export default LoadingModal;