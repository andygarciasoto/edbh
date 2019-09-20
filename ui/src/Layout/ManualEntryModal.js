import React from 'react';
import Modal from 'react-modal';
import { Button, Row, Col } from 'react-bootstrap';
import ReactSelect from 'react-select';
import * as _ from 'lodash';
import './ManualEntryModal.scss';
import { sendPut, formatDateWithTime, getCurrentTime } from '../Utils/Requests';
import ConfirmModal from './ConfirmModal';
import LoadingModal from './LoadingModal';
import ErrorModal from './ErrorModal';
import {
    getUOMS,
    formatNumber
} from '../Utils/Requests';
import { throws } from 'assert';



class ManualEntryModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentRow: props.currentRow,
            part_number: '',
            quantity: 1,
            uom: '',
            uoms: [],
            routed_cycle_time: '',
            setup_time: '',
            production_status: 'setup',
            validationMessage: '',
            allowSubmit: true,
            isOpen: false,
            modal_confirm_IsOpen: false,
            modal_loading_IsOpen: false,
            modal_error_IsOpen: false
        }
        this.submit = this.submit.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.validate = this.validate.bind(this);
    }

    submit(e) {

        if (this.validate()) {
            let data = {
                dxh_data_id: this.props.currentRow ? this.props.currentRow.dxhdata_id : null,
                actual: "zero",
                asset_code: this.props.parentData[0],
                override: 0,
                part_number: this.state.part_number,
                order_quantity: this.state.quantity,
                uom_code: this.state.uom.value,
                row_timestamp: formatDateWithTime(this.props.currentRow.hour_interval_start),
                production_status: this.state.production_status,
                clocknumber: this.props.user.clock_number ? this.props.user.clock_number : undefined,
                first_name: this.props.user.clock_number ? undefined : this.props.user.first_name,
                last_name: this.props.user.clock_number ? undefined : this.props.user.last_name,
                timestamp: getCurrentTime()
            };
            if (this.state.routed_cycle_time !== '') {
                data.routed_cycle_time = this.state.routed_cycle_time;
            }
            if (this.state.setup_time !== '') {
                data.setup_time = this.state.setup_time;
            }
            this.setState({ modal_loading_IsOpen: true }, () => {
                const response = sendPut(data, '/create_order_data');
                response.then((res) => {
                    if (res !== 200) {
                        this.setState({ modal_error_IsOpen: true })
                    } else {
                            this.setState({modal_loading_IsOpen: true}, () => {
                                const resp = sendPut({
                                    ...data
                                }, '/production_data')
                                resp.then((res) => {
                                    if (res !== 200 || !res) {
                                        this.setState({modal_error_IsOpen: true, errorMessage: 'Could not complete request'})
                                    }
                        this.setState({ request_status: res, modal_confirm_IsOpen: true, modal_loading_IsOpen: false })
                        this.props.Refresh(this.props.parentData);
                        this.props.onRequestClose();
                    })
                })
            this.setState({ 
                request_status: res, 
                modal_loading_IsOpen: false,
                modal_confirm_IsOpen: true, 
                modal_validate_IsOpen: false })
                    }
                    this.props.Refresh(this.props.parentData);
                    this.setState({
                        part_number: '',
                        quantity: 1,
                        uom: '',
                        routed_cycle_time: '',
                        setup_time: '',
                        production_status: 'setup',
                    })
                    this.props.onRequestClose();
                })
            });
        } else {
            let errorMessage = 'Missing required fields';
            this.setState({ errorMessage, allowSubmit: false, modal_error_IsOpen: true });
        }
    }

    componentWillMount() {
        this.fetchConfiguration();
    }

    async fetchConfiguration() {
        const uoms = await getUOMS();
        let uoms_options = [];
        for (let uom of uoms)
            uoms_options.push({ value: uom.UOM.UOM_code, label: `${uom.UOM.UOM_code} - ${uom.UOM.UOM_name}` });

        this.setState({
            uoms: uoms_options
        });

    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.currentRow) {
            let uom = this.state.uoms.length === 1 ? this.state.uoms[0] : this.state.uom;
            this.setState({
                isOpen: nextProps.isOpen,
                currentRow: this.props.currentRow,
                uom
            });
        }
    }

    validate() {
        let valid = true;
        if (this.state.quantity < 1) {
            valid = false;
        }
        if (this.state.part_number === '') {
            valid = false;
        }
        if (this.state.uom === '') {
            valid = false;
        }
        return valid;
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
        const t = this.props.t;
        return (
            <React.Fragment>
                <Modal
                    isOpen={this.state.isOpen}
                    onRequestClose={this.props.onRequestClose}
                    style={styles}
                    contentLabel="Example Modal">
                    <span className="close-modal-icon" onClick={this.props.onRequestClose}>X</span>
                    <span><h4 style={{ marginLeft: '10px' }}>{t('Manual Data Entry')}</h4></span>
                    {/* <div className={'new-manualentry-close'}>
                        <Button variant="outline-primary"
                            style={{ marginTop: '10px', marginLeft: '10px', marginBottom: '10px' }}
                            onClick={this.clear}>{t('New Entry')}</Button>
                    </div> */}
                    <div className="new-manualentry">
                        <Row style={{ marginBottom: '1px' }}>
                            <Col sm={6} md={6}>
                                <p style={{ marginBottom: '1px' }}>{`${t('Part Number')}:`}</p>
                                <input className={'manualentry-field col-md-8 col-sm-8'}
                                    type={'text'}
                                    onChange={(val) => this.setState({ part_number: val.target.value })}
                                    value={this.state.part_number}></input>
                            </Col>
                            <Col sm={6} md={6}>
                                <p style={{ marginBottom: '1px' }}>{`${t('Part Cycle Time')}:`}</p>
                                <input className={'manualentry-field col-md-8 col-sm-8'}
                                    type={'number'}
                                    min={0}
                                    onChange={(val) => this.setState({ routed_cycle_time: val.target.value })}
                                    value={this.state.routed_cycle_time}></input>
                            </Col>
                            <Col sm={6} md={6}>
                                <p style={{ marginBottom: '1px' }}>{`${t('Order Quantity')}:`}</p>
                                <input className={'manualentry-field col-md-8 col-sm-8'}
                                    type={'number'}
                                    min={1}
                                    onChange={(val) => this.setState({ quantity: val.target.value })}
                                    value={this.state.quantity}></input>
                            </Col>
                            <Col sm={6} md={6}>
                                <p style={{ marginBottom: '1px' }}>{`${t('Setup Time')}:`}</p>
                                <input className={'manualentry-field col-md-8 col-sm-8'}
                                    type={'number'}
                                    min={0}
                                    onChange={(val) => this.setState({ setup_time: val.target.value })}
                                    value={this.state.setup_time}></input>
                            </Col>
                            <Col sm={6} md={6}>
                                <p style={{ marginBottom: '1px' }}>{`${t('UOM')}:`}</p>
                                <ReactSelect
                                    value={this.state.uom}
                                    onChange={(e) => this.setState({ uom: e })}
                                    options={this.state.uoms}
                                    className={'manualentry-select col-md-8 col-sm-8'}
                                    classNamePrefix={"manualentry-field"}
                                />
                            </Col>
                            <Col sm={12} md={12}>
                                <Button variant="outline-primary"
                                    style={{ marginLeft: '45%', marginTop: '25px' }}
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
                    message={'Manual Entry Succesfully Inserted.'}
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