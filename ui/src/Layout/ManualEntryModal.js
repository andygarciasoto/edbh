import React from 'react';
import Modal from 'react-modal';
import { Form, Button } from 'react-bootstrap';
import * as _ from 'lodash';
import './ManualEntryModal.scss';
import { sendPut } from '../Utils/Requests';
import ConfirmModal from './ConfirmModal';
import LoadingModal from './LoadingModal';
import ErrorModal from './ErrorModal';
import {
    formatNumber
} from '../Utils/Requests';



class ManualEntryModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentRow: props.currentRow,
            part_number: props.currentRow ? props.currentRow.part_number : 0,
            ideal: props.currentRow ? props.currentRow.ideal : 0,
            target: props.currentRow ? props.currentRow.target : 0,
            validationMessage: '',
            allowSubmit: true,
            modal_confirm_IsOpen: false,
            modal_loading_IsOpen: false,
            modal_error_IsOpen: false,
        }
        this.submit = this.submit.bind(this);
        this.onChange = this.onChange.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.validate = this.validate.bind(this);
    }

    submit(e) {
        // const data = {
        //     dxh_data_id: this.props.currentRow ? this.props.currentRow.dxhdata_id : undefined,
        //     dt_reason_id: this.state.new_tl_reason.value,
        //     dt_minutes: parseInt(this.state.time_to_allocate),
        //     clocknumber: this.props.user.clock_number ? this.props.user.clock_number : undefined,
        //     first_name: this.props.user.clock_number ? undefined : this.props.user.first_name,
        //     last_name: this.props.user.clock_number ? undefined : this.props.user.last_name,
        //     asset_code: this.props.parentData[0],
        //     row_timestamp: formatDateWithTime(this.props.currentRow.hour_interval_start),
        //     timestamp: getCurrentTime(),
        // }
        // this.setState({ modal_loading_IsOpen: true }, () => {
        //     const response = sendPut(data, '/dt_data');
        //     response.then((res) => {
        //         if (res !== 200) {
        //             this.setState({ modal_error_IsOpen: true })
        //         } else {
        //             this.setState({ request_status: res, modal_confirm_IsOpen: true, modal_loading_IsOpen: false })
        //         }
        //         this.props.Refresh(this.props.parentData);
        //         this.setState({ new_tl_reason: '', allowSubmit: true, time_to_allocate: 0 })
        //         this.props.onRequestClose();
        //     })
        // })
    }

    onChange(e) {
        this.setState({ newValue: e.target.value });
    }


    componentWillMount() {
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.currentRow) {
            this.setState({
                currentRow: nextProps.currentRow,
                part_number: nextProps.currentRow.summary_product_code,
                ideal: nextProps.currentRow.summary_ideal,
                target: nextProps.currentRow.summary_target,
            });
        }
    }

    validate() {

    }

    closeModal() {
        this.setState({ modal_confirm_IsOpen: false, modal_loading_IsOpen: false, modal_error_IsOpen: false });
    }

    render() {
        const styles = _.cloneDeep(this.props.style);
        if (!_.isEmpty(styles)) {
            styles.content.width = '20%';
            styles.content.overflow = 'visible';
        }
        const t = this.props.t;
        return (
            <React.Fragment>
                <Modal
                    isOpen={this.props.isOpen}
                    onRequestClose={this.props.onRequestClose}
                    style={styles}
                    contentLabel="Example Modal">
                    <span className="close-modal-icon" onClick={this.props.onRequestClose}>X</span>
                    <span><h4 style={{ marginLeft: '10px' }}>{t('Manual Entry')}</h4></span>
                    <span className="dashboard-modal-field-group"><p>{t('Part Number')}:</p>
                        <Form.Control
                            value={this.state.part_number}
                            style={{ paddingTop: '5px' }}
                            type={this.props.formType}
                            onChange={(val) => this.onChange(val)}>
                        </Form.Control>
                    </span>
                    <br />
                    <span className="dashboard-modal-field-group"><p>{t('Ideal')}:</p>
                        <Form.Control
                            value={this.state.ideal}
                            style={{ paddingTop: '5px' }}
                            type={this.props.formType}
                            onChange={(val) => this.onChange(val)}>
                        </Form.Control>
                    </span>
                    <br />
                    <span className="dashboard-modal-field-group"><p>{t('Target')}:</p>
                        <Form.Control
                            value={this.state.target}
                            style={{ paddingTop: '5px' }}
                            type={this.props.formType}
                            onChange={(val) => this.onChange(val)}>
                        </Form.Control>
                    </span>

                    <div className={'new-manualentry-close'}>
                        <Button variant="outline-secondary"
                            style={{ marginTop: '10px', marginLeft: '10px' }}
                            onClick={this.props.onRequestClose}>{t('Close')}</Button>
                    </div>
                </Modal>
                <ConfirmModal
                    isOpen={this.state.modal_confirm_IsOpen}
                    //  onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    contentLabel="Example Modal"
                    shouldCloseOnOverlayClick={false}
                    message={'manualentry was inserted.'}
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
            </React.Fragment>
        )
    }
}

Modal.setAppElement('#root');
export default ManualEntryModal;