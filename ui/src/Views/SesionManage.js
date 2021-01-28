import React from 'react';
import LogOffModal from '../Components/SesionManage/LogOffModal';
import SupervisorLogInModal from '../Components/SesionManage/SupervisorLogInModal';
import MessageModal from '../Components/Common/MessageModal';
import LoadingModal from '../Components/Common/LoadingModal';
import _ from 'lodash';
import configuration from '../config.json';

class SesionManage extends React.Component {
    constructor(props) {
        super(props);
        this.state = Object.assign(this.getInitialState(props));
    }

    getInitialState(props) {
        const selectedMachine = props.search.mc || props.machineData.asset_code;
        let selectedAssetOption = {};
        _.forEach(props.user.machines, (machine) => {
            if (machine.asset_code === selectedMachine) {
                selectedAssetOption = machine;
            }
        });
        return {
            site: props.user.site,
            selectedMachine,
            selectedAssetOption,
            openLogOffModal: false,
            tryToOpenModalLogOff: props.tryToOpenModalLogOff,
            tryToOpenSupervisorModal: false,
            modal_loading_IsOpen: false,
            modal_message_Is_Open: false,
            messageModalType: '',
            messageModalMessage: ''
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.tryToOpenModalLogOff !== prevState.tryToOpenModalLogOff) {
            if (!nextProps.tryToOpenModalLogOff) {
                return {
                    tryToOpenModalLogOff: nextProps.tryToOpenModalLogOff,
                    openLogOffModal: nextProps.tryToOpenModalLogOff
                }
            } else {
                return {
                    tryToOpenModalLogOff: nextProps.tryToOpenModalLogOff
                }
            }
        } else if ((!_.isEmpty(nextProps.search) && prevState.selectedMachine !== nextProps.search.mc) || prevState.site !== nextProps.user.site) {
            const selectedMachine = nextProps.user.site === prevState.site ?
                (nextProps.search.mc || prevState.selectedMachine) :
                (nextProps.search.mc || nextProps.machineData.asset_code);
            let selectedAssetOption = {};
            _.forEach(nextProps.user.machines, (machine) => {
                if (machine.asset_code === selectedMachine) {
                    selectedAssetOption = machine;
                }
            });
            return {
                selectedMachine,
                selectedAssetOption,
                site: nextProps.user.site === prevState.site ? prevState.site : nextProps.user.site,
            }
        }
        return null;
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.tryToOpenModalLogOff && !this.state.openLogOffModal && !this.state.modal_loading_IsOpen && !this.state.modal_message_Is_Open) {
            this.logOffLogic(this.props);
        }
    }

    async logOffLogic(props) {
        const user = props.user;
        if (user.role === 'Operator' && this.state.selectedAssetOption.is_multiple) {
            this.setState({ openLogOffModal: true });
        } else {
            // remove stored data
            localStorage.removeItem('accessToken');
            localStorage.removeItem('st');
            // Redirect to login
            window.location.replace(configuration['root']);
        }
    }

    closeModal = () => {
        this.setState({
            openLogOffModal: false,
            modal_loading_IsOpen: false,
            modal_message_Is_Open: false
        });
        this.props.displayModalLogOff(false);

    }

    render() {
        const props = this.props;
        const openSupervisorSignInModal = !props.user.assing_role && props.user.role === 'Supervisor' && this.state.selectedAssetOption.is_multiple;
        return (
            <React.Fragment>
                <LogOffModal
                    isOpen={this.state.openLogOffModal}
                    selectedAssetOption={this.state.selectedAssetOption}
                    activeOperators={props.activeOperators}
                    changeActiveOperators={props.changeActiveOperators}
                    onRequestClose={() => props.displayModalLogOff(false)}
                    user={props.user}
                    search={props.search}
                    t={props.t}
                />
                <SupervisorLogInModal
                    isOpen={openSupervisorSignInModal}
                    onRequestClose={props.changeCurrentUser}
                    selectedAssetOption={this.state.selectedAssetOption}
                    user={props.user}
                    search={props.search}
                    t={props.t}
                />
                <MessageModal
                    isOpen={this.state.modal_message_Is_Open}
                    onRequestClose={this.closeModal}
                    type={this.state.messageModalType}
                    message={this.state.messageModalMessage}
                    t={props.t}
                />
                <LoadingModal
                    isOpen={this.state.modal_loading_IsOpen}
                    onRequestClose={this.closeModal}
                    t={props.t}
                />
            </React.Fragment>
        );
    }
};

export default SesionManage;