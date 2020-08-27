import React from 'react';
import Modal from 'react-modal';
import { Form, Button, Row, Col, Nav } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import ReactTable from 'react-table';
import MessageModal from './MessageModal';
import LoadingModal from './LoadingModal';
import { getResponseFromGeneric, formatNumber, getCurrentTime } from '../Utils/Requests';
import ReactSelect from 'react-select';
import { API } from '../Utils/Constants';
import './CommentsModal.scss';
import * as _ from 'lodash';

class ScrapModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = Object.assign(this.getInitialState(props), this.getTextTranslations(props));
    }

    getInitialState(props) {
        return {
            actualRow: {},
            setup_scrap: 0,
            other_scrap: 0,
            other_scrap_adjusted: 0,
            adjusted_actual: 0,
            quantity: 0,
            isOpen: props.isOpen,
            modal_message_isOpen: false,
            modal_type: '',
            modal_message: '',
            modal_loading_IsOpen: false,
            scrapList: [],
            scrapsOptions: [],
            new_tl_scrap: '',
            editScrapReason: false,
            currentScrapReason: {},
            newScrapReason: {},
            allScrapsReason: []
        }
    }

    getTextTranslations(props) {
        return {
            setupScrapText: props.t('Setup Scrap'),
            otherScrapText: props.t('Other Scrap'),
            scraptCodeText: props.t('Scrap Code'),
            scrapDefinitionText: props.t('Scrap Definition')
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.currentRow && nextProps.currentRow.productiondata_id !== null) {
            this.loadData(nextProps);
        }
    }

    async loadData(props) {
        let asset = _.find(props.user.sites, { asset_id: props.user.site });

        const parameters = {
            mc: asset.asset_code,
            dxh_data_id: props.currentRow.dxhdata_id,
            productiondata_id: props.currentRow.productiondata_id,
            type: 'scrap'
        }

        let resReason = await getResponseFromGeneric('get', API, '/timelost_reasons', {}, parameters, {}) || [];

        let scrapsOption = [];
        if (resReason) {
            _.forEach(resReason, reason => {
                scrapsOption.push({ value: reason.dtreason_code, label: `${reason.dtreason_code} - ${reason.dtreason_name}`, scrap_reason_id: reason.dtreason_id });
            })
        }

        this.setState({
            isOpen: props.isOpen,
            actualRow: props.currentRow,
            setup_scrap: props.currentRow.setup_scrap || 0,
            other_scrap: props.currentRow.other_scrap || 0,
            other_scrap_adjusted: props.currentRow.other_scrap || 0,
            adjusted_actual: props.currentRow.adjusted_actual || props.currentRow.actual,
            quantity: 0,
            scrapsOptions: scrapsOption,
            editScrapReason: false,
            allScrapsReason: resReason,
            new_tl_scrap: ''
        });

        let responseScrap = await getResponseFromGeneric('get', API, '/timelost_dxh_data', {}, parameters, {}) || [];

        this.setState({
            modal_loading_IsOpen: false,
            scrapList: responseScrap
        });

    }

    onChangeSetupScrap = (e) => {
        e.target.value = e.target.value < 0 && e.target.value !== '' ? 0 : e.target.value;
        let setupScrap = parseInt(e.target.value, 10);
        let otherScrap = this.state.other_scrap;
        let quantity = this.state.quantity;
        this.onChangeInput(setupScrap, otherScrap, quantity);
    }

    onChangeQuantity = (e) => {
        e.target.value = e.target.value < 0 && e.target.value !== '' ? 0 : e.target.value;
        let setupScrap = this.state.setup_scrap;
        let otherScrap = this.state.other_scrap;
        let quantity = parseInt(e.target.value, 10);
        this.onChangeInput(setupScrap, otherScrap, quantity);
    }

    onChangeInput(setupScrap, otherScrap, quantity) {
        let totalScrap = setupScrap + otherScrap + quantity;
        if (totalScrap <= this.state.actualRow.actual) {
            this.setState({
                setup_scrap: setupScrap,
                quantity: quantity,
                other_scrap_adjusted: otherScrap + quantity,
                adjusted_actual: this.state.actualRow.actual - totalScrap
            });
        }
    }

    getColumns() {
        let columns = [
            {
                Header: this.getHeader(this.state.otherScrapText),
                accessor: 'quantity',
                maxWidth: 256,
                Cell: c => this.renderCell(c.original, 'quantity')
            },
            {
                Header: this.getHeader(this.state.scraptCodeText),
                accessor: 'dtreason_code',
                maxWidth: 256,
                Cell: c => this.renderCell(c.original, 'dtreason_code')
            },
            {
                Header: this.getHeader(this.state.scrapDefinitionText),
                accessor: 'dtreason_name',
                maxWidth: 256,
                Cell: c => this.renderCell(c.original, 'dtreason_name')
            }
        ];

        if (this.state.editScrapReason) {
            columns.push(
                {
                    maxWidth: 50,
                    Cell: c => this.renderEditAcceptDeleteButton(c.original, 'accept')
                }
            );
            columns.push(
                {
                    maxWidth: 50,
                    Cell: c => this.renderEditAcceptDeleteButton(c.original, 'cancel')
                }
            );
        } else {
            columns.push(
                {
                    maxWidth: 50,
                    Cell: c => this.renderEditAcceptDeleteButton(c.original, 'edit')
                }
            );
        }

        return columns;
    }

    getHeader(text) {
        return <span className={'wordwrap left-align'} style={{ float: 'left' }} data-tip={text}><b>{text}</b></span>
    }

    renderCell(row, prop) {
        if (!this.state.editScrapReason || row.dtdata_id !== this.state.currentScrapReason.dtdata_id) {
            return <span>{row[prop]}</span>;
        } else {
            if (prop === 'quantity') {
                return <input type='number' autoFocus={this.state.editScrapReason}
                    min='1' max={formatNumber(this.state.adjusted_actual) + formatNumber(this.state.currentScrapReason.quantity)} value={this.state.newScrapReason[prop]}
                    onChange={(e) => this.changeInputValue(e)}></input>
            } else if (prop === 'dtreason_code') {
                return <ReactSelect
                    value={{
                        value: this.state.newScrapReason.dtreason_code,
                        label: `${this.state.newScrapReason.dtreason_code} - ${this.state.newScrapReason.dtreason_name}`,
                        reason_id: this.state.newScrapReason.dtreason_id
                    }}
                    onChange={(e) => this.changeSelectTable(e)}
                    options={this.state.scrapsOptions}
                />;
            } else {
                return <span>{this.state.newScrapReason[prop]}</span>;
            }
        }
    }

    changeInputValue(e) {
        let newScrapReason = this.state.newScrapReason;
        newScrapReason.quantity = parseInt(e.target.value);
        this.setState({ newScrapReason });
    }

    changeSelectTable(e) {
        let newScrapReason = _.find(this.state.allScrapsReason, ['dtreason_id', e.scrap_reason_id]);
        newScrapReason.quantity = this.state.newScrapReason.quantity;
        this.setState({ newScrapReason });
    }

    renderEditAcceptDeleteButton(row, action) {
        if (action === 'edit') {
            return <Nav.Link onClick={() => this.editScrapRow(row)}><FontAwesome name='edit' /></Nav.Link>;
        } else if (action === 'accept' && row.dtdata_id === this.state.currentScrapReason.dtdata_id) {
            return <Nav.Link onClick={() => this.acceptNewScrap(row)}><FontAwesome name='check' /></Nav.Link>;
        } else if (action === 'cancel' && row.dtdata_id === this.state.currentScrapReason.dtdata_id) {
            return <Nav.Link onClick={() => this.cancelEditScrap()}><FontAwesome name='window-close' /></Nav.Link>;
        } else {
            return <span></span>;
        }
    }

    editScrapRow(row) {
        this.setState({
            editScrapReason: true,
            currentScrapReason: _.clone(row),
            newScrapReason: _.clone(row)
        });
    }

    acceptNewScrap() {
        if ((this.state.currentScrapReason.quantity !== this.state.newScrapReason.quantity) ||
            (this.state.currentScrapReason.dtreason_id !== this.state.newScrapReason.dtreason_id)) {
            const data = {
                dxh_data_id: this.state.actualRow.dxhdata_id,
                productiondata_id: this.state.actualRow.productiondata_id,
                dt_reason_id: this.state.newScrapReason.dtreason_id,
                setup_scrap: this.state.setup_scrap,
                other_scrap: this.state.other_scrap - this.state.currentScrapReason.quantity + this.state.newScrapReason.quantity,
                clocknumber: this.props.user.clock_number ? this.props.user.clock_number : undefined,
                first_name: this.props.user.clock_number ? undefined : this.props.user.first_name,
                last_name: this.props.user.clock_number ? undefined : this.props.user.last_name,
                quantity: this.state.newScrapReason.quantity,
                dtdata_id: parseInt(this.state.currentScrapReason.dtdata_id),
                timestamp: getCurrentTime(this.props.user.timezone)
            }
            this.setState({ modal_loading_IsOpen: true }, async () => {
                let res = await getResponseFromGeneric('put', API, '/scrap_values', {}, {}, data);

                if (res.status !== 200) {
                    this.setState({ modal_loading_IsOpen: false, modal_message_isOpen: true, modal_type: 'Error', modal_message: 'Scrap Entries unsaved' });
                } else {
                    this.setState({ request_status: res, modal_loading_IsOpen: false, modal_message_isOpen: true, modal_type: 'Success', modal_message: 'Scrap Entries Saved' });
                }
                this.props.Refresh(this.props.parentData);
                this.setState({ new_tl_reason: '', allowSubmit: true, time_to_allocate: 0 });
            });
        } else {
            this.setState({
                modal_message_isOpen: true,
                modal_type: 'Error',
                modal_message: `Any change detected`
            });
        }
    }

    cancelEditScrap() {
        this.setState({
            editScrapReason: false,
            currentScrapReason: {},
            newScrapReason: {}
        });
    }

    submit = (e) => {
        if (this.state.new_tl_scrap.scrap_reason_id || this.state.quantity > 0) {
            if ((this.state.new_tl_scrap.scrap_reason_id && this.state.quantity === 0) ||
                (!this.state.new_tl_scrap.scrap_reason_id && this.state.quantity > 0)) {
                this.setState({ modal_message_isOpen: true, modal_type: 'Error', modal_message: 'You need to define a scrap reason or the other scrap quantity' });
                return;
            }
        }
        const data = {
            dxh_data_id: this.state.actualRow.dxhdata_id,
            productiondata_id: this.state.actualRow.productiondata_id,
            dt_reason_id: this.state.new_tl_scrap.scrap_reason_id,
            setup_scrap: this.state.setup_scrap,
            other_scrap: this.state.new_tl_scrap.scrap_reason_id ? this.state.other_scrap_adjusted : this.state.other_scrap,
            clocknumber: this.props.user.clock_number ? this.props.user.clock_number : undefined,
            first_name: this.props.user.clock_number ? undefined : this.props.user.first_name,
            last_name: this.props.user.clock_number ? undefined : this.props.user.last_name,
            quantity: this.state.quantity,
            timestamp: getCurrentTime(this.props.user.timezone)
        }
        this.setState({ modal_loading_IsOpen: true }, async () => {
            let res = await getResponseFromGeneric('put', API, '/scrap_values', {}, {}, data);
            if (res.status !== 200) {
                this.setState({ modal_loading_IsOpen: false, modal_message_isOpen: true, modal_type: 'Error', modal_message: 'Could not complete request' });
            } else {
                this.props.Refresh(this.props.parentData);
                this.setState({ request_status: res, modal_loading_IsOpen: false, modal_message_isOpen: true, modal_type: 'Success', modal_message: 'Value was inserted' });
            }
        });
    }

    closeModal = () => {
        this.setState({ modal_message_isOpen: false, modal_loading_IsOpen: false });
        if (this.state.modal_type === 'Success') {
            this.props.onRequestClose();
        }
    }

    render() {
        const styles = _.cloneDeep(this.props.style);
        if (!_.isEmpty(styles)) {
            styles.content.width = '50%';
            styles.content.overflow = 'visible';
        }
        const selectStyles = {
            control: base => ({
                ...base,
                height: 35,
                minHeight: 35
            })
        }
        const t = this.props.t;
        return (
            this.state.isOpen ?
                <React.Fragment>
                    <Modal
                        isOpen={this.props.isOpen}
                        onRequestClose={this.props.onRequestClose}
                        style={styles}
                        contentLabel="Example Modal">
                        <span className="close-modal-icon" onClick={this.props.onRequestClose}>X</span>
                        <span><h4 style={{ marginLeft: '10px' }}>{t('Scrap')}</h4></span>
                        <Row className="new-timeloss-data" style={{ marginBottom: '5px' }}>
                            <Col sm={4} md={4}>
                                <span className="dashboard-modal-field-group">
                                    <p>{this.props.t('Part Number')}:</p>
                                    <Form.Control
                                        style={{ paddingTop: '5px' }}
                                        disabled={true}
                                        value={this.state.actualRow.product_code}>
                                    </Form.Control>
                                </span>
                            </Col>
                            <Col sm={4} md={4}>
                                <span className="dashboard-modal-field-group">
                                    <p>{this.props.t('Recorded Actual')}:</p>
                                    <Form.Control
                                        style={{ paddingTop: '5px' }}
                                        type={this.props.formType}
                                        disabled={true}
                                        value={this.state.actualRow.actual || 0}>
                                    </Form.Control>
                                </span>
                            </Col>
                            <Col sm={4} md={4}>
                                <span className="dashboard-modal-field-group"><p>{this.props.t('Setup Scrap')}:</p>
                                    <input
                                        value={this.state.setup_scrap}
                                        type="number"
                                        onChange={e => this.onChangeSetupScrap(e)}
                                        className="form-control"
                                        style={{ paddingTop: '5px' }}
                                        min='0'
                                        disabled={this.props.readOnly || this.state.editScrapReason} />
                                </span>
                            </Col>
                        </Row>
                        <ReactTable
                            className={'reactTableTReason'}
                            data={this.state.scrapList}
                            columns={this.getColumns()}
                            defaultPageSize={this.state.scrapList.length > 3 ? this.state.scrapList.length : 4}
                            showPaginationBottom={false}
                            noDataText={this.props.t('No Scrap entries yet')}
                        />
                        <span className={"new-timelost-label"}>{t('New Scrap Entry')}</span>
                        <div className="new-timeloss">
                            <Row style={{ marginBottom: '1px' }}>
                                <Col sm={4} md={4}>
                                    <span className="dashboard-modal-field-group"><p>{this.props.t('Other Scrap')}:</p>
                                        <input
                                            value={this.state.quantity}
                                            type="number"
                                            onChange={e => this.onChangeQuantity(e)}
                                            className="form-control"
                                            style={{ paddingTop: '5px' }}
                                            min='0'
                                            disabled={this.props.readOnly || this.state.editScrapReason} />
                                    </span>
                                </Col>
                                <Col sm={6} md={6}>
                                    <p style={{ paddingBottom: '1px', marginBottom: '5px' }}>{t('Search/Select Scrap Code') ? t('Search/Select Scrap Code') : t('New Value')}:</p>
                                    <Form.Group controlId="formGridState">
                                        <ReactSelect
                                            value={this.state.new_tl_scrap}
                                            onChange={(e) => this.setState({ new_tl_scrap: e })}
                                            options={this.state.scrapsOptions}
                                            className={"react-select-container"}
                                            styles={selectStyles}
                                            isDisabled={this.props.readOnly || this.state.editScrapReason}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <div className="new-timeloss-reasoncode">

                            </div>
                            <div className={'new-timeloss-button'}>
                                <Button
                                    variant="outline-primary"
                                    style={{ marginTop: '10px' }}
                                    disabled={this.props.readOnly || this.state.editScrapReason}
                                    onClick={this.submit}>{this.props.t('Submit')}</Button>
                                {this.props.readOnly ? <div><span style={{ color: 'grey' }}>{this.props.t('Read-Only')}</span></div> : null}
                            </div>
                            <Col sm={4} md={4}>
                                <span className="dashboard-modal-field-group"><p>{this.props.t('Adjusted Actual')}:</p>
                                    <input
                                        value={this.state.adjusted_actual || 0}
                                        type="number"
                                        className="form-control"
                                        style={{ paddingTop: '5px' }}
                                        disabled={true} />
                                </span>
                            </Col>
                        </div>
                        <div className={'new-timeloss-close'}>
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
                </React.Fragment>
                : null
        )
    }
}

Modal.setAppElement('#root');
export default ScrapModal;