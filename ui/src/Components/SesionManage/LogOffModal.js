import React from 'react';
import { Modal, Row, Col, Button } from 'react-bootstrap';
import { getResponseFromGeneric, getCurrentTime } from '../../Utils/Requests';
import { API } from '../../Utils/Constants';
import MessageModal from '../Common/MessageModal';
import LoadingModal from '../Common/LoadingModal';
import BarcodeScannerModal from '../Common/BarcodeScannerModal';
import '../../sass/LogOffModal.scss';
import configuration from '../../config.json';
import _ from 'lodash';


class LogOffModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            modal_loading_IsOpen: false,
            modal_message_Is_Open: false,
            messageModalType: '',
            messageModalMessage: '',
            modal_validate_IsOpen: false,
            reason: ''
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.isOpen !== prevState.isOpen) {
            return {
                isOpen: nextProps.isOpen
            };
        }
        return null;
    }

    logOffReason = (reason) => {
        if (this.props.activeOperators.length > 1) {
            this.setState({
                reason,
                modal_validate_IsOpen: true
            });
        } else {
            this.setState({ modal_loading_IsOpen: true }, async () => {
                const parameters = {
                    badge: this.props.activeOperators[0].badge,
                    site_id: this.props.user.site
                };
                let res = await getResponseFromGeneric('get', API, '/find_user_information', {}, parameters, {}) || [];
                if (!res[0]) {
                    this.setState({
                        modal_loading_IsOpen: false,
                        messageModalType: 'Error',
                        messageModalMessage: 'Error finding the user. Please Try again',
                        modal_message_Is_Open: true
                    });
                } else {
                    this.setState({
                        modal_loading_IsOpen: false
                    });
                    const user = res[0];
                    this.checkOut(reason, user);
                }
            });
        }
    }

    handleScan = (badge) => {
        const userFound = _.find(this.props.activeOperators, { badge: badge });
        if (userFound) {
            this.setState({ modal_validate_IsOpen: false, modal_loading_IsOpen: true }, async () => {
                const parameters = {
                    badge: badge,
                    site_id: this.props.user.site
                };
                let res = await getResponseFromGeneric('get', API, '/find_user_information', {}, parameters, {}) || [];
                if (!res[0]) {
                    this.setState({
                        modal_loading_IsOpen: false,
                        messageModalType: 'Error',
                        messageModalMessage: 'Error finding the user. Please Try again',
                        modal_message_Is_Open: true
                    });
                } else {
                    this.setState({
                        modal_loading_IsOpen: false
                    });
                    const user = res[0];
                    this.checkOut(this.state.reason, user);
                }
            });
        } else {
            this.setState({
                modal_loading_IsOpen: false,
                messageModalType: 'Error',
                messageModalMessage: 'This user is not working in this station. Please Try again',
                modal_message_Is_Open: true,
                modal_validate_IsOpen: false
            });
        }
    }

    checkOut(reason, user) {

        this.setState({ modal_loading_IsOpen: true }, async () => {
            const data = {
                badge: user.badge,
                first_name: user.first_name,
                last_name: user.last_name,
                asset_id: this.props.selectedAssetOption.asset_id,
                timestamp: getCurrentTime(user.timezone),
                reason: reason,
                status: 'Inactive',
                site_id: this.props.user.site,
                break_minutes: reason === 'Break' ? user.break_minutes : 0,
                lunch_minutes: reason === 'Lunch' ? user.lunch_minutes : 0
            };

            let res = await getResponseFromGeneric('put', API, '/new_scan', {}, {}, data);
            if (res.status !== 200) {
                this.setState({ modal_loading_IsOpen: false, messageModalType: 'Error', messageModalMessage: 'Error signing out from the EDxH. Please Try again', modal_message_Is_Open: true })
            } else {
                this.setState({ modal_loading_IsOpen: false });
                this.props.onRequestClose();
                if (this.props.activeOperators.length === 1) {
                    // remove stored data
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('st');
                    // Redirect to login
                    window.location.replace(configuration['root']);
                } else {
                    const newActiveUsers = _.filter(this.props.activeOperators, (activeUser) => { return activeUser.badge !== user.badge; });
                    this.props.changeActiveOperators(newActiveUsers);
                }
            }
        });
    }

    closeModal = () => {
        this.setState({
            modal_loading_IsOpen: false,
            modal_message_Is_Open: false,
            modal_validate_IsOpen: false
        });
    }

    render() {
        const t = this.props.t;
        const props = this.props;
        return (
            <React.Fragment>
                <Modal
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    show={this.state.isOpen} onHide={props.onRequestClose}
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            {t('Sign Out Reason') + '?'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row>
                            <Col md={12} lg={12}><span className='LogOffMessage'>{t('Please select what is the reason to sign out')}</span></Col>
                            <Col md={12} lg={12} className="d-flex justify-content-center logoffbuttons">
                                <Button onClick={() => this.logOffReason('Lunch')} className='btnYellow'>{t('Begin Lunch')}</Button>
                                <Button onClick={() => this.logOffReason('Break')} className='btnGreen'>{t('Begin Break')}</Button>
                                <Button onClick={() => this.logOffReason('Check-Out')} variant='outline-primary'>{t('Exit Station')}</Button>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={props.onRequestClose} variant='outline-danger'>{t('Cancel')}</Button>
                    </Modal.Footer>
                </Modal>
                <MessageModal
                    isOpen={this.state.modal_message_Is_Open}
                    onRequestClose={this.closeModal}
                    type={this.state.messageModalType}
                    message={this.state.messageModalMessage}
                    t={t}
                />
                <LoadingModal
                    isOpen={this.state.modal_loading_IsOpen}
                    onRequestClose={this.closeModal}
                    t={t}
                />
                <BarcodeScannerModal
                    isOpen={this.state.modal_validate_IsOpen}
                    modalTitle={'Operator Checkout'}
                    inputText={'Please scan the badge to Checkout...'}
                    onRequestClose={this.closeModal}
                    t={t}
                    responseScan={this.handleScan}
                />
            </React.Fragment>
        )
    }
}

export default LogOffModal;