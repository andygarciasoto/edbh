import React from 'react';
import { Modal, Row, Col, Button, FormCheck } from 'react-bootstrap';
import { getResponseFromGeneric, getCurrentTime } from '../../../Utils/Requests';
import { API } from '../../../Utils/Constants';
import MessageModal from '../../Common/MessageModal';
import LoadingModal from '../../Common/LoadingModal';
import _ from 'lodash';
import '../../../sass/CheckOutModal.scss';

class CheckOutModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            modal_loading_IsOpen: false,
            modal_message_Is_Open: false,
            messageModalType: '',
            messageModalMessage: '',
            selectedOperators: [],
            allOperators: false
        }
    }

    closeModal = () => {
        this.setState({
            modal_loading_IsOpen: false,
            modal_message_Is_Open: false
        });

    }

    handleChange = (e) => {
        this.setState({
            allOperators: !this.state.allOperators,
            selectedOperators: []
        });
    }

    onClickOperator = (operator) => {
        let selectedOperators = this.state.selectedOperators;
        if (_.find(selectedOperators, { scan_id: operator.scan_id })) {
            selectedOperators = _.filter(selectedOperators, (selectOperator) => { return selectOperator.scan_id !== operator.scan_id; });
        } else {
            selectedOperators.push(operator);
        }
        this.setState({ selectedOperators });
    }

    getCheckOptions() {
        return _.map(this.props.activeOperators, operator => {
            const checked = _.find(this.state.selectedOperators, { scan_id: operator.scan_id }) ? true : false;
            return (<FormCheck
                key={'checkbox_' + operator.scan_id}
                type='checkbox'
                label={operator.name}
                disabled={this.state.allOperators}
                checked={checked}
                onChange={() => { }}
                onClick={(e) => this.onClickOperator(operator)}
            />);
        });
    }

    CheckOut = () => {
        if (this.state.allOperators) {
            this.handleCheckoutOperators(this.props.activeOperators);
        } else if (!_.isEmpty(this.state.selectedOperators)) {
            this.handleCheckoutOperators(this.state.selectedOperators);
        } else {
            this.setState({
                messageModalType: 'Error',
                messageModalMessage: 'Any Operator selected to check-out',
                modal_message_Is_Open: true
            });
        }
    }

    handleCheckoutOperators(operators) {
        const user = this.props.user;
        this.setState({ modal_loading_IsOpen: true }, () => {
            let message = [];
            _.forEach(operators, async (operator, index) => {
                const data = {
                    badge: operator.badge,
                    closed_by: user.badge,
                    first_name: operator.first_name,
                    last_name: operator.last_name,
                    asset_id: this.props.selectedAssetOption.asset_id,
                    timestamp: getCurrentTime(user.timezone),
                    reason: 'Check-Out',
                    status: 'Inactive',
                    site_id: user.site,
                    break_minutes: 0,
                    lunch_minutes: 0
                };
                let res = await getResponseFromGeneric('put', API, '/new_scan', {}, {}, data);
                if (res.status !== 200) {
                    message.push(operator);
                }
                if (index === (operators.length - 1)) {
                    if (_.isEmpty(message)) {
                        this.setState({
                            modal_loading_IsOpen: false,
                            messageModalType: 'Success',
                            messageModalMessage: this.props.t('All operators could be checked-out from the station'),
                            modal_message_Is_Open: true
                        });
                    } else {
                        const first_part_message = message.length > 1 ? 'These operators' : 'This operator';
                        const messageModalMessage = this.props.t(first_part_message + ' could not be checked-out from the station') + ' : ' + _.map(message, 'name').join(', ');
                        this.setState({
                            modal_loading_IsOpen: false,
                            messageModalType: 'Error',
                            messageModalMessage,
                            modal_message_Is_Open: true
                        });
                    }
                    this.props.Refresh();
                }
            });
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
                    show={this.props.isOpen}
                    onHide={props.onRequestClose}
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            {t('Check Out Operators') + '?'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {!_.isEmpty(this.props.activeOperators) ?
                            <Row className='container'>
                                <Col md={12} lg={12}><span className='supervisorMessage'>{t('Please select which role you will perform at this station today') + ':'}</span></Col>
                                <Col className='operatorsCheckBoxDiv'>
                                    <FormCheck
                                        type='checkbox'
                                        label={t('Select All')}
                                        checked={this.state.allOperators}
                                        onChange={() => { }}
                                        onClick={(e) => this.handleChange(e)}
                                    />
                                    {this.getCheckOptions()}
                                </Col>
                            </Row>
                            : <h5>{t('No active operators to check-out')}</h5>
                        }
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            onClick={this.CheckOut}
                            disabled={_.isEmpty(this.props.activeOperators)}
                            variant={_.isEmpty(this.props.activeOperators) ? 'outline-dark' : 'outline-success'}>
                            {t('Check Out')}
                        </Button>
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
            </React.Fragment>
        )
    }
}

export default CheckOutModal;