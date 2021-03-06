import React from 'react';
import Modal from 'react-modal';
import { Button, Row, Col } from 'react-bootstrap';
import ReactSelect from 'react-select';
import * as _ from 'lodash';
import './ManualEntryModal.scss';
import { API } from '../Utils/Constants';
import { getResponseFromGeneric, formatDateWithTime, getCurrentTime } from '../Utils/Requests';
import LoadingModal from './LoadingModal';
import MessageModal from './MessageModal';

class ManualEntryModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = Object.assign(this.getInitialState(props), this.fetchLoadUOMOptions(props));
    }

    getInitialState(props) {
        return {
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
            modal_loading_IsOpen: false,
            site: props.user.site,
            modal_message_isOpen: false,
            modal_type: '',
            modal_message: ''
        }
    }

    submit = (e) => {

        if (this.validate()) {
            let data = {
                dxh_data_id: this.props.currentRow ? this.props.currentRow.dxhdata_id : null,
                actual: 'signoff',
                setup_scrap: 'signoff',
                other_scrap: 'signoff',
                asset_code: this.props.parentData[0],
                override: 0,
                part_number: this.state.part_number,
                order_quantity: this.state.quantity,
                uom_code: this.state.uom.value,
                row_timestamp: formatDateWithTime(this.props.currentRow.started_on_chunck),
                production_status: this.state.production_status,
                clocknumber: this.props.user.clock_number ? this.props.user.clock_number : undefined,
                first_name: this.props.user.clock_number ? undefined : this.props.user.first_name,
                last_name: this.props.user.clock_number ? undefined : this.props.user.last_name,
                timestamp: getCurrentTime(this.props.user.timezone)
            };
            if (this.state.routed_cycle_time !== '') {
                data.routed_cycle_time = this.state.routed_cycle_time;
            }
            if (this.state.setup_time !== '') {
                data.setup_time = this.state.setup_time;
            }

            this.setState({ modal_loading_IsOpen: true }, async () => {
                let res = await getResponseFromGeneric('put', API, '/create_order_data', {}, {}, data);
                if (res.status !== 200) {
                    this.setState({ modal_loading_IsOpen: false, modal_message_isOpen: true, modal_type: 'Error', modal_message: 'Order not created' });
                } else {
                    this.setState({ modal_loading_IsOpen: true }, async () => {
                        let res = await getResponseFromGeneric('put', API, '/production_data', {}, {}, data);
                        if (res.status !== 200 || !res) {
                            this.setState({ modal_loading_IsOpen: false, modal_message_isOpen: true, modal_type: 'Error', modal_message: 'Production row not created' });
                        }
                        this.setState({ request_status: res, modal_loading_IsOpen: false, modal_message_isOpen: true, modal_type: 'Success', modal_message: 'Manual Entry Succesfully Inserted' });
                        this.props.Refresh(this.props.parentData);
                        this.props.onRequestClose();
                    });
                    this.setState({
                        request_status: res,
                        modal_loading_IsOpen: false,
                        modal_confirm_IsOpen: true,
                        modal_validate_IsOpen: false
                    })
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
            });
        } else {
            this.setState({ allowSubmit: false, modal_message_isOpen: true, modal_type: 'Error', modal_message: 'Missing required fields' });
        }
    }

    fetchLoadUOMOptions(props) {
        let uoms_options = [];
        _.forEach(props.user.uoms, uom => {
            uoms_options.push({ value: uom.UOM_code, label: `${uom.UOM_code} - ${uom.UOM_name}` });
        });
        return { uoms: uoms_options };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.currentRow) {
            let actualUoms = this.state.uoms;
            if (nextProps.user.site === this.state.site) {
                let uom = actualUoms.length === 1 ? actualUoms[0] : this.state.uom;
                this.setState({
                    isOpen: nextProps.isOpen,
                    currentRow: nextProps.currentRow,
                    uom
                });
            } else {
                actualUoms = this.fetchLoadUOMOptions(nextProps).uoms;
                let uom = actualUoms.length === 1 ? actualUoms[0] : '';
                this.setState({
                    isOpen: nextProps.isOpen,
                    currentRow: nextProps.props.currentRow,
                    uoms: actualUoms,
                    site: nextProps.user.site,
                    uom
                });
            }
        }
    }

    validate = () => {
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

    closeModal = () => {
        this.setState({ modal_message_isOpen: false });
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
                                <p style={{ marginBottom: '1px' }}>{`${t('Part Cycle Time (Seconds)')}:`}</p>
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
                                <p style={{ marginBottom: '1px' }}>{`${t('Setup Time (Minutes)')}:`}</p>
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
                <MessageModal
                    isOpen={this.state.modal_message_isOpen}
                    onRequestClose={this.closeModal}
                    type={this.state.modal_type}
                    message={this.state.modal_message}
                    t={this.props.t}
                />
                <LoadingModal
                    isOpen={this.state.modal_loading_IsOpen}
                    onRequestClose={this.closeModal}
                    contentLabel="Example Modal"
                    t={this.props.t}
                />
            </React.Fragment >
        )
    }
}

Modal.setAppElement('#root');
export default ManualEntryModal;