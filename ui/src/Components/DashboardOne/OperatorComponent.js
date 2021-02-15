
import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import BadgeScannerModal from '../Common/BarcodeScannerModal';
import {
    getResponseFromGeneric,
    getCurrentTime
} from '../../Utils/Requests';
import { API } from '../../Utils/Constants';
import LoadingModal from '../Common/LoadingModal';
import MessageModal from '../Common/MessageModal';
import ActiveOperatorsModal from '../Modal/ActiveOperatorsModal';
import '../../sass/Operator.scss';
import _ from 'lodash';


class OperatorComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = Object.assign(this.getInitialState(props));
    }

    getInitialState(props) {
        return {
            activeOperators: [],
            asset_code: null,
            modal_validate_IsOpen: false,
            modal_loading_IsOpen: false,
            modal_message_Is_Open: false,
            modal_active_op_Is_Open: false
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (!_.isEqual(nextProps.activeOperators, prevState.activeOperators)) {
            return {
                activeOperators: nextProps.activeOperators
            }
        }
        else return null
    }

    openModal = (modal) => {
        this.setState({ [modal]: true })
    }

    closeModal = () => {
        this.setState({
            modal_validate_IsOpen: false,
            modal_loading_IsOpen: false,
            modal_message_Is_Open: false,
            modal_active_op_Is_Open: false
        })
    }

    responseScan = (badge) => {
        this.setState({ modal_loading_IsOpen: true }, async () => {
            const parameters = {
                badge: badge,
                site_id: this.props.user.site
            };

            let res = await getResponseFromGeneric('get', API, '/find_user_information', {}, parameters, {}) || [];
            if (!res[0]) {
                this.setState({
                    modal_loading_IsOpen: false,
                    messageModalType: 'Error',
                    messageModalMessage: 'Error finding the user. Please try again',
                    modal_message_Is_Open: true
                });
            } else {
                const user = res[0];
                const userFound = _.find(this.state.activeOperators, { badge: user.badge });
                if (!userFound) {
                    const data = {
                        badge: user.badge,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        asset_id: this.props.selectedAssetOption.asset_id,
                        timestamp: getCurrentTime(user.timezone),
                        reason: 'Check-In',
                        status: 'Active',
                        site_id: user.site,
                        break_minutes: 0,
                        lunch_minutes: 0
                    };

                    res = await getResponseFromGeneric('put', API, '/new_scan', {}, {}, data);
                    if (res.status !== 200) {
                        this.setState({
                            modal_loading_IsOpen: false,
                            messageModalType: 'Error',
                            messageModalMessage: 'Error signing out from the EDxH. Please try again',
                            modal_message_Is_Open: true
                        });
                    } else {
                        this.setState({
                            modal_loading_IsOpen: false,
                            messageModalType: 'Success',
                            messageModalMessage: 'Operator checked in successfully',
                            modal_message_Is_Open: true,
                            modal_validate_IsOpen: false
                        });
                        this.props.Refresh();
                    }
                } else {
                    this.setState({
                        modal_loading_IsOpen: false,
                        messageModalType: 'Error',
                        messageModalMessage: 'This user is already checked in. Please try again with a different user',
                        modal_message_Is_Open: true
                    });
                }
            }
        });
    }

    render() {
        const t = this.props.t;
        return (
            <React.Fragment>
                <Row className='d-flex justify-content-end operatorComponent'>
                    <Col md={3} lg={3}>
                        {this.props.isEditable ?
                            <Button className='btnOperator' variant='outline-primary' onClick={() => this.openModal('modal_validate_IsOpen')}>{t('New Operator Check-In')}</Button>
                            : null}
                        <Button className='activeOp' variant='outline-primary' onClick={() => this.openModal('modal_active_op_Is_Open')}>
                            {t('Active Operators')}: {this.state.activeOperators.length}
                        </Button>
                    </Col>
                </Row>
                <BadgeScannerModal
                    isOpen={this.state.modal_validate_IsOpen}
                    modalTitle={'New Operator Check-In'}
                    inputText={'Please scan the badge to check-in the operator...'}
                    onRequestClose={this.closeModal}
                    t={t}
                    responseScan={this.responseScan}
                />
                <LoadingModal
                    isOpen={this.state.modal_loading_IsOpen}
                    onRequestClose={this.closeModal}
                    t={t}
                />
                <MessageModal
                    isOpen={this.state.modal_message_Is_Open}
                    onRequestClose={this.closeModal}
                    type={this.state.messageModalType}
                    message={this.state.messageModalMessage}
                    t={t}
                />
                <ActiveOperatorsModal
                    isOpen={this.state.modal_active_op_Is_Open}
                    onRequestClose={this.closeModal}
                    activeOperators={this.state.activeOperators}
                    t={t}
                />
            </React.Fragment >
        )
    }
};

export default OperatorComponent;