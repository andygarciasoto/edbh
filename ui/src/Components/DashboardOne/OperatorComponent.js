
import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import BadgeScannerModal from '../Common/BarcodeScannerModal';
import {
    getResponseFromGeneric,
    getCurrentTime,
    formatDate
} from '../../Utils/Requests';
import { API } from '../../Utils/Constants';
import LoadingModal from '../Common/LoadingModal';
import MessageModal from '../Common/MessageModal';
import ActiveOperatorsModal from '../Modal/OperatorComponent/ActiveOperatorsModal';
import SupervisorLogInModal from '../Modal/OperatorComponent/SupervisorLogInModal';
import LogOffModal from '../Modal/OperatorComponent/LogOffModal';
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
            selectedAssetOption: props.selectedAssetOption,
            modal_validate_IsOpen: false,
            modal_loading_IsOpen: false,
            modal_message_Is_Open: false,
            modal_active_op_Is_Open: false
        };
    }

    componentDidMount() {
        this.fetchData();
        try {
            this.props.socket.on('message', response => {
                if (response.message) {
                    this.fetchData(this.props);
                }
            });
        } catch (e) { console.log(e) }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (!_.isEqual(nextProps.selectedAssetOption, prevState.selectedAssetOption)) {
            return {
                activeOperators: [],
                selectedAssetOption: nextProps.selectedAssetOption
            }
        }
        else return null
    }

    componentDidUpdate(prevProps, prevState) {
        if (!_.isEqual(this.state.selectedAssetOption, prevState.selectedAssetOption)) {
            this.fetchData();
        }
    }

    fetchData = () => {
        const currentShift = _.find(this.props.user.shifts, { shift_id: this.props.user.shift_id });
        const parameters = {
            asset_id: this.state.selectedAssetOption.asset_id,
            start_time: formatDate(currentShift.start_date_time_today),
            end_time: formatDate(currentShift.end_date_time_today)
        };

        getResponseFromGeneric('get', API, '/get_scan', null, parameters, null, null).then(response => {
            let user_list = response || [];
            const activeOperators = _.filter(user_list, { status: 'Active', is_current_scan: true });
            this.props.updateActiveOperators(activeOperators);
            this.setState({
                activeOperators
            });
        });
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
                        this.fetchData();
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
        const props = this.props;
        const { t } = props;
        const openSupervisorSignInModal = !props.user.assing_role && props.user.role === 'Supervisor';
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
                <SupervisorLogInModal
                    isOpen={openSupervisorSignInModal}
                    updateCurrentUser={props.updateCurrentUser}
                    selectedAssetOption={this.state.selectedAssetOption}
                    user={props.user}
                    search={props.search}
                    t={t}
                    Refresh={this.fetchData}
                />
                <LogOffModal
                    isOpen={props.showModalLogOff}
                    selectedAssetOption={this.state.selectedAssetOption}
                    activeOperators={this.state.activeOperators}
                    Refresh={this.fetchData}
                    onRequestClose={() => props.displayModalLogOff(false)}
                    user={props.user}
                    search={props.search}
                    t={t}
                />
            </React.Fragment >
        )
    }
};

export default OperatorComponent;