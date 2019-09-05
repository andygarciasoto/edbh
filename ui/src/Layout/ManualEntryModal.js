import React from 'react';
import Modal from 'react-modal';
import { Button, Row, Col } from 'react-bootstrap';
import ReactSelect from 'react-select';
import * as _ from 'lodash';
import './ManualEntryModal.scss';
import { sendPut } from '../Utils/Requests';
import ConfirmModal from './ConfirmModal';
import LoadingModal from './LoadingModal';
import ErrorModal from './ErrorModal';
import {
    getUOMS,
    formatNumber
} from '../Utils/Requests';



class ManualEntryModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentRow: props.currentRow,
            part_number: 0,
            ideal: 0,
            target: 0,
            quantity: 0,
            uom: '',
            uoms: [],
            part_cycle_time: '',
            setup_time: '',
            validationMessage: '',
            allowSubmit: true,
            isOpen: false,
            modal_confirm_IsOpen: false,
            modal_loading_IsOpen: false,
            modal_error_IsOpen: false
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

    clear = () => {

    }

    onChange(e) {
        this.setState({ newValue: e.target.value });
    }


    componentWillMount() {
        this.fetchConfiguration();
    }

    fetchConfiguration() {
        const uoms = getUOMS();
        uoms.then((res) => this.setState({
            uoms: res,
        }))
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.currentRow) {
            this.setState({
                currentRow: nextProps.currentRow,
                part_number: nextProps.currentRow.summary_product_code,
                ideal: nextProps.currentRow.summary_ideal,
                target: nextProps.currentRow.summary_target,
                isOpen: nextProps.isOpen
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
            styles.content.width = '50%';
            styles.content.overflow = 'visible';
        };
        const uoms = [];
        if (this.state.uoms) {
            for (let uom of this.state.uoms)
                uoms.push({ value: uom.UOM.UOM_id, label: `${uom.UOM.UOM_code} - ${uom.UOM.UOM_name}` })
        };
        const t = this.props.t;
        return (
            <React.Fragment>
                <Modal
                    isOpen={this.state.isOpen}
                    onRequestClose={this.props.onRequestClose}
                    style={styles}
                    contentLabel="Example Modal">
                    <span className="close-modal-icon" onClick={this.props.onRequestClose}>X</span>
                    <span><h4 style={{ marginLeft: '10px' }}>{t('Manual Entry')}</h4></span>
                    <div className={'new-manualentry-close'}>
                        <Button variant="outline-primary"
                            style={{ marginTop: '10px', marginLeft: '10px', marginBottom: '10px' }}
                            onClick={this.clear}>{t('New Entry')}</Button>
                    </div>
                    <div className="new-manualentry">
                        <Row style={{ marginBottom: '1px' }}>
                            <Col sm={6} md={6}>
                                <p style={{ marginBottom: '1px' }}>{`${t('Part Number')}:`}</p>
                                <input className={'manualentry-field col-md-8 col-sm-8'}
                                    type={this.props.formType}
                                    onChange={(val) => this.onChange(val)}
                                    value={this.state.part_number}></input>
                            </Col>
                            <Col sm={6} md={6}>
                                <p style={{ marginBottom: '1px' }}>{`${t('Ideal')}:`}</p>
                                <input className={'manualentry-field col-md-8 col-sm-8'}
                                    type={this.props.formType}
                                    onChange={(val) => this.onChange(val)}
                                    value={this.state.ideal}></input>
                            </Col>
                            <Col sm={6} md={6}>
                                <p style={{ marginBottom: '1px' }}>{`${t('Target')}:`}</p>
                                <input className={'manualentry-field col-md-8 col-sm-8'}
                                    type={this.props.formType}
                                    onChange={(val) => this.onChange(val)}
                                    value={this.state.target}></input>
                            </Col>
                            <Col sm={6} md={6}>
                                <p style={{ marginBottom: '1px' }}>{`${t('Part Cycle Time')}:`}</p>
                                <input className={'manualentry-field col-md-8 col-sm-8'}
                                    type={this.props.formType}
                                    onChange={(val) => this.onChange(val)}
                                    value={this.state.part_cycle_time}></input>
                            </Col>
                            <Col sm={6} md={6}>
                                <p style={{ marginBottom: '1px' }}>{`${t('Quantity')}:`}</p>
                                <input className={'manualentry-field col-md-8 col-sm-8'}
                                    type={this.props.formType}
                                    onChange={(val) => this.onChange(val)}
                                    value={this.state.quantity}></input>
                            </Col>
                            <Col sm={6} md={6}>
                                <p style={{ marginBottom: '1px' }}>{`${t('Setup Time')}:`}</p>
                                <input className={'manualentry-field col-md-8 col-sm-8'}
                                    type={this.props.formType}
                                    onChange={(val) => this.onChange(val)}
                                    value={this.state.setup_time}></input>
                            </Col>
                            <Col sm={6} md={6}>
                                <p style={{ marginBottom: '1px' }}>{`${t('UOM')}:`}</p>
                                <ReactSelect
                                    value={this.state.uom}
                                    onChange={(e) => this.setState({ uom: e })}
                                    options={uoms}
                                    className={'manualentry-field col-md-8 col-sm-8'}
                                    classNamePrefix={"manualentry-field"}
                                />
                            </Col>
                            <Col sm={12} md={12}>
                                <Button variant="outline-primary"
                                    style={{ marginLeft: '40%' }}
                                    onClick={this.submit}>{t('Submit')}</Button>
                            </Col>
                        </Row>
                    </div>
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
            </React.Fragment >
        )
    }
}

Modal.setAppElement('#root');
export default ManualEntryModal;