import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { formatDateWithTime, getResponseFromGeneric } from '../../Utils/Requests';
import { API } from '../../Utils/Constants';
import LoadingModal from '../Common/LoadingModal';
import MessageModal from '../Common/MessageModal';
import BarcodeScannerModal from '../Common/BarcodeScannerModal';
import '../../sass/ActualModal.scss';

class ActualModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            currentRow: props.currentRow,
            newActual: 0,
            modal_loading_IsOpen: false,
            modal_message_IsOpen: false,
            modal_type: '',
            modal_message: '',
            modal_validate_IsOpen: false
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.isOpen !== prevState.isOpen) {
            return {
                isOpen: nextProps.isOpen,
                currentRow: nextProps.currentRow,
                newActual: 0,
                modal_loading_IsOpen: false,
                modal_message_IsOpen: false,
                modal_type: '',
                modal_message: ''
            };
        }
        return null;
    }

    onChangeInput = (e) => {
        this.setState({
            newActual: parseInt(e.target.value)
        });
    }

    submit = async (e) => {
        const props = this.props;
        if (props.selectedAssetOption.is_multiple && props.user.role === 'Operator') {
            if (props.activeOperators.length > 1) {
                this.setState({ modal_validate_IsOpen: true });
            } else {
                this.submitActual(props.activeOperators[0].badge);
            }
        } else {
            this.submitActual(props.user.clock_number);
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
                    modal_message: 'Error finding the user. Please try again',
                    modal_message_IsOpen: true
                });
            } else {
                this.setState({
                    modal_loading_IsOpen: false
                });
                this.submitActual(badge);
            }
        });
    }

    submitActual(badge) {
        const data = {
            dxh_data_id: this.state.currentRow && this.state.currentRow.dxhdata_id ? this.state.currentRow.dxhdata_id : undefined,
            productiondata_id: this.state.currentRow && this.state.currentRow.productiondata_id ? this.state.currentRow.productiondata_id : undefined,
            actual: this.state.newActual ? this.state.newActual : null,
            clocknumber: badge,
            timestamp: formatDateWithTime(this.props.currentRow.started_on_chunck),
            asset_code: this.props.parentData[0]
        }
        if (!data.actual) {
            this.setState({ modal_message_IsOpen: true, modal_type: 'Error', modal_message: 'You have not entered a value' });
        } else {
            this.setState({ modal_loading_IsOpen: true }, async () => {
                let res = await getResponseFromGeneric('put', API, '/production_any_order', {}, {}, data);
                this.setState({ modal_loading_IsOpen: false });
                if (res.status !== 200) {
                    this.setState({ modal_message_IsOpen: true, modal_type: 'Error', modal_message: 'Could not complete request' });
                } else {
                    this.setState({ modal_loading_IsOpen: false, value: 0 });
                    this.props.Refresh(this.props.parentData);
                    this.props.onRequestClose();
                }
            });
        }
    }

    closeModal = () => {
        this.setState({
            modal_loading_IsOpen: false,
            modal_message_IsOpen: false,
            modal_type: '',
            modal_message: '',
            modal_validate_IsOpen: false
        });
    }

    render() {
        const props = this.props;
        const t = this.props.t;
        return (
            <React.Fragment>
                <Modal
                    size="sm"
                    aria-labelledby="example-modal-sizes-title-sm"
                    centered
                    show={this.state.isOpen}
                    className='actualModal'
                    onHide={props.onRequestClose}
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            {t('Actual')}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.state.currentRow && this.state.currentRow.productiondata_id ?
                            <React.Fragment>
                                <span className="dashboard-modal-field-group"><p>{t('Current Value')}:</p>
                                    <Form.Control
                                        style={{ paddingTop: '5px' }}
                                        type={'number'}
                                        disabled={true}
                                        value={this.state.currentRow.actual}>
                                    </Form.Control>
                                </span>
                                <br />
                            </React.Fragment>
                            : null}
                        <span className="dashboard-modal-field-group"><p>{t('New Value')}:</p>
                            <Form.Control
                                value={this.state.newActual}
                                style={{ paddingTop: '5px' }}
                                type={'number'}
                                min={0}
                                autoFocus
                                onChange={(e) => this.onChangeInput(e)}
                                disabled={!this.props.isEditable}>
                            </Form.Control>
                        </span>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button disabled={!this.props.isEditable} onClick={this.submit} variant="outline-info">{t('Submit')}</Button>
                        <Button onClick={props.onRequestClose} variant="outline-danger">{t('Cancel')}</Button>
                    </Modal.Footer>
                </Modal>
                <MessageModal
                    isOpen={this.state.modal_message_IsOpen}
                    onRequestClose={this.closeModal}
                    type={this.state.modal_type}
                    message={this.state.modal_message}
                    t={t}
                />
                <LoadingModal
                    isOpen={this.state.modal_loading_IsOpen}
                    onRequestClose={this.closeModal}
                    contentLabel="Example Modal"
                    t={t}
                />
                <BarcodeScannerModal
                    isOpen={this.state.modal_validate_IsOpen}
                    modalTitle={'Operator Scan'}
                    inputText={'Please scan badge to proceed'}
                    onRequestClose={this.closeModal}
                    t={t}
                    responseScan={this.handleScan}
                />
            </React.Fragment>
        );
    }
}

export default ActualModal;