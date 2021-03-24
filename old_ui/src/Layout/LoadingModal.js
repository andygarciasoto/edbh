import React from 'react';
import Modal from 'react-modal';
import './ErrorModal.scss';
import Spinner from '../Spinner';
import * as _ from 'lodash';
import { withRouter } from 'react-router-dom'


class LoadingModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            loadingMessage: this.props.t(this.props.message) || this.props.t('Loading'),
            headerMessage: 'Please Wait',
            style: {
                content: {
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    marginRight: '-50%',
                    transform: 'translate(-50%, -50%)',
                },
                overlay: {
                    backgroundColor: 'rgba(0,0,0, 0.6)'
                }
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        setTimeout(function () {
            void (0)
        },
            3000);
    }

    render() {
        const styles = _.cloneDeep(this.props.style || this.state.style);
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
                <div><p className="dashboard-modal-loading-field-head">{this.props.t(this.state.headerMessage)}</p>
                    <Spinner />
                </div>
            </Modal>
        )
    }
}

Modal.setAppElement('#root');
export default withRouter(LoadingModal);