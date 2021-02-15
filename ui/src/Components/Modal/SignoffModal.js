import React from 'react';
import moment from 'moment-timezone';
import { Modal, Row, Col, Button } from 'react-bootstrap';
import { API } from '../../Utils/Constants';
import MessageModal from '../Common/MessageModal';
import LoadingModal from '../Common/LoadingModal';
import BarcodeScannerModal from '../Common/BarcodeScannerModal';
import { getResponseFromGeneric, getCurrentTime, formatDateWithTime, convertNumber } from '../../Utils/Requests';
import * as _ from 'lodash';
import '../../sass/SignoffModal.scss';


class SignoffModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            value: '',
            signOffRole: props.signOffModalType,
            headerMessage: props.t(props.user.role + ' Sign Off') +
                ' (' + props.t('Logged in as') + ' ' + props.t(props.user.role) + ')',
            signoffMessage: props.t("By clicking 'Accept' you confirm that all the values for this hour are correct"),
            modal_message_IsOpen: false,
            modal_type: '',
            modal_message: '',
            row: this.props.dxh_parent || {},
            modal_validate_IsOpen: false
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.isOpen && (!_.isEqual(nextProps.selectedAssetOption, prevState.selectedAssetOption) || !_.isEqual(nextProps.signOffModalType, prevState.signOffRole))) {
            return {
                signOffRole: nextProps.signOffModalType,
                headerMessage: nextProps.t(nextProps.user.role + ' Sign Off') +
                    ' (' + nextProps.t('Logged in as') + ' ' + nextProps.t(nextProps.user.role) + ')',
                signoffMessage: nextProps.t("By clicking 'Accept' you confirm that all the values for this hour are correct")
            }
        }
        return null;
    }

    closeModal = () => {
        this.setState({
            modal_message_IsOpen: false,
            modal_loading_IsOpen: false,
            modal_validate_IsOpen: false
        });
        this.props.onRequestClose();
    }

    submitSignOff = () => {
        const props = this.props;
        if (this.state.signOffRole === 'Operator') {
            if (props.selectedAssetOption.is_multiple) {
                if (props.activeOperators.length > 1) {
                    this.setState({ modal_validate_IsOpen: true });
                } else {
                    this.signOff(props.activeOperators[0].badge);
                }
            } else {
                this.signOff(props.user.clock_number);
            }
        } else if (this.state.signOffRole === 'Supervisor') {
            this.setState({ modal_validate_IsOpen: true });
        }
    }

    handleScan = (badge) => {
        this.setState({ modal_validate_IsOpen: false, modal_loading_IsOpen: true }, async () => {
            const parameters = {
                badge: badge,
                site_id: this.props.user.site
            };
            let res = await getResponseFromGeneric('get', API, '/find_user_information', {}, parameters, {}) || [];
            if (!res[0]) {
                this.setState({
                    modal_loading_IsOpen: false,
                    modal_type: 'Error',
                    modal_message: 'Error finding the user. Please Try again',
                    modal_message_IsOpen: true
                });
            } else {
                this.setState({
                    modal_loading_IsOpen: false
                });
                if (this.state.signOffRole === 'Supervisor' && res[0].role !== 'Supervisor' && res[0].role !== 'Administrator') {
                    this.setState({
                        modal_type: 'Error',
                        modal_message: 'The user is not a Supervisor. Please Try again',
                        modal_message_IsOpen: true
                    });
                    return;
                }
                this.signOff(badge);
            }
        });
    }

    signOff(badge) {
        let rowData = {}
        if (this.props.currentRow) {
            rowData = this.props.currentRow
        }
        let data = {
            dxh_data_id: rowData ? rowData.dxhdata_id : null,
            actual: rowData.actual || "signoff",
            setup_scrap: rowData.summary_setup_scrap || 'signoff',
            other_scrap: rowData.summary_other_scrap || 'signoff',
            clocknumber: badge,
            override: 0,
            asset_code: this.props.selectedAssetOption.asset_code,
            row_timestamp: formatDateWithTime(rowData ? rowData.started_on_chunck : this.state.row.started_on_chunck),
            timestamp: getCurrentTime(this.props.user.timezone),
        }
        this.setState({ modal_loading_IsOpen: true }, async () => {
            await getResponseFromGeneric('put', API, `/${this.state.signOffRole}_sign_off`, {}, {}, data);
            if (data.dxh_data_id === null) {
                data.timestamp = formatDateWithTime(rowData ? rowData.started_on_chunck : this.state.row.started_on_chunck);
                this.setState({ modal_loading_IsOpen: true }, async () => {
                    let res = await getResponseFromGeneric('put', API, '/production_data', {}, {}, data);
                    if (res.status !== 200) {
                        this.setState({ modal_message_IsOpen: true, modal_type: 'Error', modal_message: 'Could not complete request' })
                    }
                    this.setState({ actual: '' });
                    this.props.Refresh(this.props.parentData);
                    this.props.onRequestClose();
                })
            } else {
                if (this.state.signOffRole === 'Operator') {
                    localStorage.setItem("signoff", false);
                    var currentHour = moment(rowData.started_on_chunck).hours();
                    localStorage.setItem("currentHour", currentHour);
                }
                this.setState({
                    modal_loading_IsOpen: false,
                    modal_message_IsOpen: true,
                    modal_type: 'Success',
                    modal_message: 'Signoff was successful'
                })
                this.props.Refresh(this.props.parentData);
                this.props.onRequestClose();
            }
        });
    }

    render() {
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
                    centered
                    show={this.props.isOpen}
                    onHide={this.props.onRequestClose}
                    className='signOffModal'>
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            {this.state.headerMessage}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className={"wrap-signoff"}>
                            <ul className={'signoff-list-parent'}>
                                <li><p className={'signoff-list'}>{this.props.t('Ideal') + ': '}</p><p className={'signoff-list'}>
                                    {row.summary_ideal === '' ? 0 : convertNumber(row.summary_ideal, this.props.uom_asset)}
                                </p></li>
                                <li><p className={'signoff-list'}>{this.props.t('Target') + ': '}</p><p className={'signoff-list'}>
                                    {row.summary_target === '' ? 0 : convertNumber(row.summary_target, this.props.uom_asset)}
                                </p></li>
                                <li><p className={'signoff-list'}>{this.props.t('Recorded Actual') + ': '}</p><p style={{ color: isred === 'red' ? isred : isgreen }} className={'signoff-list'}>
                                    {row.summary_actual === '' ? 0 : convertNumber(row.summary_actual, this.props.uom_asset)}
                                </p></li>
                                <li><p className={'signoff-list'}>{this.props.t('Scrap') + ': '}</p><p className={'signoff-list'}>
                                    {parseInt(row.summary_scrap || 0, 10)}</p></li>
                                <li><p className={'signoff-list'}>{this.props.t('Adjusted Actual') + ': '}</p><p className={'signoff-list'}>
                                    {parseInt(row.summary_adjusted_actual || row.summary_actual || 0, 10)}</p></li>
                            </ul>
                            <p style={{ textAlign: 'center', marginTop: '20px' }}>{this.state.signoffMessage}</p>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Row className='divButtonsSignOff'>
                            <Col md={12}>
                                <Button variant={!this.props.isEditable ? "outline-default" : "outline-success"} style={{ marginTop: '20px', textAlign: 'center' }}
                                    className="error-button signoff-buttons" disabled={!this.props.isEditable} onClick={this.submitSignOff}>{this.props.t('Accept')}</Button>
                            </Col>
                            <Col md={12}>
                                <Button variant="outline-default" style={{ marginTop: '20px', textAlign: 'center' }}
                                    className="error-button signoff-buttons" onClick={this.props.onRequestClose}>{this.props.t('Cancel')}</Button>
                            </Col>
                        </Row>
                    </Modal.Footer>
                </Modal> : null}
                <LoadingModal
                    isOpen={this.state.modal_loading_IsOpen}
                    onRequestClose={this.closeModal}
                    contentLabel="Example Modal"
                    t={this.props.t}
                />
                <MessageModal
                    isOpen={this.state.modal_message_IsOpen}
                    onRequestClose={this.closeModal}
                    type={this.state.modal_type}
                    message={this.state.modal_message}
                    t={this.props.t}
                />
                <BarcodeScannerModal
                    isOpen={this.state.modal_validate_IsOpen}
                    modalTitle={this.state.signOffRole + ' Sign Off'}
                    inputText={'Please scan the badge to Sign Off...'}
                    onRequestClose={this.closeModal}
                    t={this.props.t}
                    responseScan={this.handleScan}
                />
            </React.Fragment>
        )
    }
}

export default SignoffModal;