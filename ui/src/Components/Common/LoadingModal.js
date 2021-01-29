import React from 'react';
import Spinner from './Spinner';
import { Modal } from 'react-bootstrap';
import * as _ from 'lodash';
import { withRouter } from 'react-router-dom';
import '../../sass/LoadingModal.scss';
import '../../sass/Spinner.scss';


class LoadingModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loadingMessage: this.props.t(this.props.message) || this.props.t('Loading'),
            headerMessage: 'Please Wait'
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
                size="xl"
                show={this.props.isOpen}
                onHide={this.props.onRequestClose}
                className='loadingModal'
                aria-labelledby="example-modal-sizes-title-xl"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        {this.props.t(this.state.headerMessage)}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Spinner />
                </Modal.Body>
            </Modal>
        )
    }
}

export default withRouter(LoadingModal);