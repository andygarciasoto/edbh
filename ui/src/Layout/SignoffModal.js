import React from 'react';
import Modal from 'react-modal';
import './ErrorModal.scss';
import moment from 'moment-timezone';
import { Button } from 'react-bootstrap';
import * as _ from 'lodash';
import { API } from '../Utils/Constants';
import ConfirmModal from '../Layout/ConfirmModal';
import LoadingModal from '../Layout/LoadingModal';
import ErrorModal from '../Layout/ErrorModal';
import ValidateModal from '../Layout/ValidateModal';
import { getResponseFromGeneric, getCurrentTime, formatDateWithTime, convertNumber } from '../Utils/Requests';


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
        let data = {
            dxh_data_id: rowData ? rowData.dxhdata_id : null,
            actual: rowData.actual || "signoff",
            setup_scrap: rowData.summary_setup_scrap || 'signoff',
            other_scrap: rowData.summary_other_scrap || 'signoff',
            clocknumber: number,
            first_name: undefined,
            last_name: undefined,
            override: 0,
            asset_code: this.props.parentData[0],
            row_timestamp: formatDateWithTime(rowData ? rowData.started_on_chunck : this.state.row.started_on_chunck),
            timestamp: getCurrentTime(this.props.user.timezone),
        }
        this.setState({ modal_loading_IsOpen: true, modal_validate_IsOpen: false, isOpen: false }, async () => {
            let res = await getResponseFromGeneric('put', API, `/${this.state.signOffRole}_sign_off`, {}, {}, data);
            if (res.status !== 200) {
                this.setState({
                    modal_loading_IsOpen: false,
                    modal_error_IsOpen: true,
                    modal_validate_IsOpen: false,
                    errorMessage: 'Invalid Clock Number'
                })
            } else {
                if (data.dxh_data_id === null) {
                    data.timestamp = formatDateWithTime(rowData ? rowData.started_on_chunck : this.state.row.started_on_chunck);
                    this.setState({ modal_loading_IsOpen: true, isOpen: false }, async () => {
                        let res = await getResponseFromGeneric('put', API, '/production_data', {}, {}, data);
                        if (res.status !== 200) {
                            this.setState({ modal_error_IsOpen: true, errorMessage: 'Could not complete request' })
                        }
                        this.setState({ actual: '' });
                        this.props.Refresh(this.props.parentData);
                        this.props.onRequestClose();
                    })
                }
            }
            this.setState({
                request_status: res,
                modal_loading_IsOpen: false,
                modal_confirm_IsOpen: true,
                modal_validate_IsOpen: false
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
        if (this.state.signOffRole === 'Operator') {
            let data = {
                dxh_data_id: rowData ? rowData.dxhdata_id : null,
                actual: rowData.actual || "signoff",
                setup_scrap: rowData.setup_scrap || 'signoff',
                other_scrap: rowData.other_scrap || 'signoff',
                clocknumber: this.props.user.clock_number ? this.props.user.clock_number : null,
                first_name: this.props.user.clock_number ? undefined : this.props.user.first_name,
                last_name: this.props.user.clock_number ? undefined : this.props.user.last_name,
                override: 0,
                asset_code: this.props.parentData[0],
                row_timestamp: formatDateWithTime(rowData ? rowData.started_on_chunck : this.state.row.started_on_chunck),
                timestamp: getCurrentTime(this.props.timezone),
            }
            this.setState({ modal_loading_IsOpen: true, isOpen: false }, async () => {
                let res = await getResponseFromGeneric('put', API, `/${this.state.signOffRole}_sign_off`, {}, {}, data);
                if (res.status !== 200) {
                    this.setState({
                        modal_loading_IsOpen: false,
                        modal_error_IsOpen: true,
                        modal_validate_IsOpen: false
                    })
                } else {
                    if (data.dxh_data_id === null) {
                        data.timestamp = formatDateWithTime(rowData ? rowData.started_on_chunck : this.state.row.started_on_chunck);
                        this.setState({ modal_loading_IsOpen: true }, async () => {
                            let res = await getResponseFromGeneric('put', API, '/production_data', {}, {}, data);


                            if (res.status !== 200) {
                                this.setState({ modal_error_IsOpen: true, errorMessage: 'Could not complete request' })
                            }
                            this.setState({ actual: '' });
                            this.props.Refresh(this.props.parentData);
                            this.props.onRequestClose();

                        })
                    }
                    localStorage.setItem("signoff", false);
                    var currentHour = moment(rowData.started_on_chunck).hours();
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
        } else if (this.state.signOffRole === 'Supervisor') {
            this.setState({ isOpen: false, modal_validate_IsOpen: true });
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            signOffRole: nextProps.signOffModalType,
            headerMessage: nextProps.t(nextProps.user.role + ' Sign Off') +
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
            isred = (row.actual === '') ? 'red' : 'black';
            isgreen = row.actual > row.target_pcs ? 'green' : 'black';
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
                            <li><p className={'signoff-list'}>{this.props.t('Ideal') + ': '}</p><p className={'signoff-list'}>
                                {row.summary_ideal === '' ? 0 : convertNumber(row.summary_ideal, this.props.uom_asset)}
                            </p></li>
                            <li><p className={'signoff-list'}>{this.props.t('Target') + ': '}</p><p className={'signoff-list'}>
                                {row.summary_target === '' ? 0 : convertNumber(row.summary_target, this.props.uom_asset)}
                            </p></li>
                            <li><p className={'signoff-list'}>{'Actual Recorded: '}</p><p style={{ color: isred === 'red' ? isred : isgreen }} className={'signoff-list'}>
                                {row.summary_actual === '' ? 0 : convertNumber(row.summary_actual, this.props.uom_asset)}
                            </p></li>
                            <li><p className={'signoff-list'}>{'Scrap: '}</p><p className={'signoff-list'}>
                                {parseInt(row.summary_scrap || 0, 10)}</p></li>
                            <li><p className={'signoff-list'}>{'Adjusted Actual: '}</p><p className={'signoff-list'}>
                                {parseInt(row.summary_adjusted_actual || row.summary_actual || 0, 10)}</p></li>
                        </ul>
                        <p style={{ textAlign: 'center', marginTop: '20px' }}>{this.state.signoffMessage}</p>
                        <Button variant={this.props.readOnly ? "outline-default" : "outline-success"} style={{ marginTop: '20px', textAlign: 'center' }}
                            className="error-button signoff-buttons" disabled={this.props.readOnly} onClick={this.signOff}>{this.props.t('Accept')}</Button>
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
                    message={'Signoff was successful'}
                    title={'Request Successful'}
                    t={this.props.t}
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