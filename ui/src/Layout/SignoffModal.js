import React from 'react';
import Modal from 'react-modal';
import './ErrorModal.scss';
import moment from 'moment-timezone';
import { Button } from 'react-bootstrap';
import * as _ from 'lodash';
import ConfirmModal from '../Layout/ConfirmModal';
import LoadingModal from '../Layout/LoadingModal';
import ErrorModal from '../Layout/ErrorModal';
import ValidateModal from '../Layout/ValidateModal';
import { sendPut, getCurrentTime, formatDateWithTime } from '../Utils/Requests';


class SignoffModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            signoffMessage: props.t(props.message) ||
                props.t("By clicking 'Accept' you confirm that all the values for this hour are correct"),
            headerMessage: '',
            errorMessage: '',
            row: this.props.dxh_parent || {},
            modal_validate_IsOpen: false,
            isOpen: false,
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
        this.signOff = this.signOff.bind(this);
        this.signOffSupervisor = this.signOffSupervisor.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    closeModal() {
        this.setState({
            modal_confirm_IsOpen: false,
            modal_loading_IsOpen: false,
            modal_error_IsOpen: false,
            modal_validate_IsOpen: false
        });
        this.props.onRequestClose();
    }

    signOffSupervisor(number) {
        let rowData = {}
        if (this.props.currentRow) {
            rowData = this.props.currentRow
        }
        const data = {
            dxh_data_id: rowData ? rowData.dxhdata_id : null,
            actual: rowData && rowData.actual_pcs !== "" ? rowData.actual_pcs : "signoff",
            setup_scrap: rowData.summary_setup_scrap || 'signoff',
            other_scrap: rowData.summary_other_scrap || 'signoff',
            adjusted_actual: rowData.summary_adjusted_actual || 'signoff',
            clocknumber: number,
            first_name: this.props.user.clock_number ? undefined : this.props.user.first_name,
            last_name: this.props.user.clock_number ? undefined : this.props.user.last_name,
            override: 0,
            asset_code: this.props.parentData[0],
            row_timestamp: formatDateWithTime(rowData ? rowData.hour_interval_start : this.state.row.hour_interval_start),
            timestamp: getCurrentTime(this.props.timezone),
        }
        this.setState({ modal_loading_IsOpen: true, modal_validate_IsOpen: false, isOpen: false }, () => {
            const response = sendPut({
                ...data
            }, `/${this.state.signOffRole}_sign_off`)
            response.then((res) => {
                if (res !== 200 || !res) {
                    this.setState({
                        modal_loading_IsOpen: false,
                        modal_error_IsOpen: true,
                        modal_validate_IsOpen: false,
                        errorMessage: 'Invalid Clock Number'
                    })
                } else {
                    if (data.dxh_data_id === null) {
                        this.setState({ modal_loading_IsOpen: true, isOpen: false }, () => {
                            const resp = sendPut({
                                ...data
                            }, '/production_data')
                            resp.then((res) => {
                                if (res !== 200 || !res) {
                                    this.setState({ modal_error_IsOpen: true, errorMessage: 'Could not complete request' })
                                }
                                this.setState({ actual: '' });
                                this.props.Refresh(this.props.parentData);
                                this.props.onRequestClose();
                            })
                        })
                    }
                }
                this.setState({
                    request_status: res,
                    modal_loading_IsOpen: false,
                    modal_confirm_IsOpen: true,
                    modal_validate_IsOpen: false
                })
            })
            this.props.Refresh(this.props.parentData);
            this.props.onRequestClose();
        })
    }

    signOff() {
        let rowData = {}
        if (this.props.currentRow) {
            rowData = this.props.currentRow
        }
        if (this.state.signOffRole === 'operator') {
            const data = {
                dxh_data_id: rowData ? rowData.dxhdata_id : null,
                actual: rowData && rowData.actual_pcs !== "" ? rowData.actual_pcs : "signoff",
                setup_scrap: rowData.setup_scrap || 'signoff',
                other_scrap: rowData.other_scrap || 'signoff',
                adjusted_actual: rowData.adjusted_actual || 'signoff',
                clocknumber: this.props.user.clock_number ? this.props.user.clock_number : null,
                first_name: this.props.user.clock_number ? undefined : this.props.user.first_name,
                last_name: this.props.user.clock_number ? undefined : this.props.user.last_name,
                override: 0,
                asset_code: this.props.parentData[0],
                row_timestamp: formatDateWithTime(rowData ? rowData.hour_interval_start : this.state.row.hour_interval_start),
                timestamp: getCurrentTime(this.props.timezone),
            }
            this.setState({ modal_loading_IsOpen: true, isOpen: false }, () => {
                const response = sendPut({
                    ...data
                }, `/${this.state.signOffRole}_sign_off`)
                response.then((res) => {
                    if (res !== 200 || !res) {
                        this.setState({
                            modal_loading_IsOpen: false,
                            modal_error_IsOpen: true,
                            modal_validate_IsOpen: false
                        })
                    } else {
                        if (data.dxh_data_id === null) {
                            this.setState({ modal_loading_IsOpen: true }, () => {
                                const resp = sendPut({
                                    ...data
                                }, '/production_data')
                                resp.then((res) => {
                                    if (res !== 200 || !res) {
                                        this.setState({ modal_error_IsOpen: true, errorMessage: 'Could not complete request' })
                                    }
                                    this.setState({ actual: '' });
                                    this.props.Refresh(this.props.parentData);
                                    this.props.onRequestClose();
                                })
                            })
                        }
                        localStorage.setItem("signoff", false);
                        var currentHour = moment(rowData.hour_interval_start).hours();
                        localStorage.setItem("currentHour", currentHour);
                        this.setState({
                            request_status: res,
                            modal_loading_IsOpen: false,
                            modal_confirm_IsOpen: true,
                            modal_validate_IsOpen: false
                        })
                    }
                    this.props.Refresh(this.props.parentData);
                    this.props.onRequestClose();
                })
            })
        } else if (this.props.signOffRole === 'supervisor') {
            this.setState({ isOpen: false, modal_validate_IsOpen: true })
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            signOffRole: nextProps.signOffRole,
            headerMessage: nextProps.t(nextProps.signOffRole + ' Sign Off') +
                ' (' + nextProps.t('Logged in as') + ' ' + nextProps.t(nextProps.user.role) + ')',
            isOpen: nextProps.isOpen,
            signoffMessage: nextProps.t("By clicking 'Accept' you confirm that all the values for this hour are correct")
        })
    }

    render() {
        const styles = _.cloneDeep(this.props.style || this.state.style);
        if (!_.isEmpty(styles)) {
            styles.content.width = '50%';
        }
        let row;
        let isred;
        let isgreen;
        if (this.props.currentRow) {
            row = this.props.currentRow;
            isred = (row.actual_pcs === '') ? 'red' : 'black';
            isgreen = row.actual_pcs > row.target_pcs ? 'green' : 'black';
        }

        return (
            <React.Fragment>
                {row ? <Modal
                    isOpen={this.state.isOpen}
                    //  onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.props.onRequestClose}
                    style={styles}
                    contentLabel="Example Modal">
                    <span className="close-modal-icon" onClick={this.props.onRequestClose}>X</span>
                    <div className={"wrap-signoff"}>
                        <p style={{ fontWeight: 'bold' }} className="dashboard-modal-signoff-header">{this.state.headerMessage}</p>
                        <ul className={'signoff-list-parent'}>
                            <li><p className={'signoff-list'}>{'Ideal: '}</p><p className={'signoff-list'}>{row.ideal === '' ? 0 : row.ideal}</p></li>
                            <li><p className={'signoff-list'}>{'Target: '}</p><p className={'signoff-list'}>
                                {row.target_pcs === '' ? 0 : row.target_pcs}</p></li>
                            <li><p className={'signoff-list'}>{'Actual: '}</p><p style={{ color: isred === 'red' ? isred : isgreen }} className={'signoff-list'}>
                                {/* <li><p className={'signoff-list'}>{'Actual Recorded: '}</p><p style={{ color: isred === 'red' ? isred : isgreen }} className={'signoff-list'}> */}
                                {row.actual_pcs === '' ? 0 : row.actual_pcs}</p></li>
                            {false ?
                                <ul>
                                    <li><p className={'signoff-list'}>{'Scrap: '}</p><p className={'signoff-list'}>
                                        {parseInt(row.summary_setup_scrap || 0, 10) + parseInt(row.summary_other_scrap || 0, 10)}</p></li>
                                    <li><p className={'signoff-list'}>{'Adjusted Actual: '}</p><p className={'signoff-list'}>
                                        {parseInt(row.summary_adjusted_actual || 0, 10)}</p></li>
                                </ul>
                                : null}
                        </ul>
                        <p style={{ textAlign: 'center', marginTop: '20px' }}>{this.state.signoffMessage}</p>
                        <Button variant="outline-success" style={{ marginTop: '20px', textAlign: 'center' }}
                            className="error-button signoff-buttons" onClick={this.signOff}>{this.props.t('Accept')}</Button>
                        <Button variant="outline-default" style={{ marginTop: '20px', textAlign: 'center' }}
                            className="error-button signoff-buttons" onClick={this.props.onRequestClose}>{this.props.t('Cancel')}</Button>
                    </div>
                </Modal> : null}
                <ConfirmModal
                    isOpen={this.state.modal_confirm_IsOpen}
                    //  onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    contentLabel="Example Modal"
                    shouldCloseOnOverlayClick={false}
                    message={'Signoff was successful.'}
                    title={'Request Successful'}
                />
                <LoadingModal
                    isOpen={this.state.modal_loading_IsOpen}
                    //  onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    contentLabel="Example Modal"
                    t={this.props.t}
                />
                <ErrorModal
                    isOpen={this.state.modal_error_IsOpen}
                    //  onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    contentLabel="Example Modal"
                    t={this.props.t}
                    message={this.state.errorMessage}
                />
                <ValidateModal
                    isOpen={this.state.modal_validate_IsOpen}
                    onRequestClose={this.closeModal}
                    contentLabel="Example Modal"
                    label={'Please scan your clocknumber'}
                    t={this.props.t}
                    signOffSupervisor={this.signOffSupervisor}
                />
            </React.Fragment>
        )
    }
}

Modal.setAppElement('#root');
export default SignoffModal;