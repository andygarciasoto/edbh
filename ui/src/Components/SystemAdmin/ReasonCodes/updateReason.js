import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as AssetActions from '../../../redux/actions/assetActions';
import * as ReasonActions from '../../../redux/actions/reasonActions';
import { API } from "../../../Utils/Constants";
import { Modal, Button, Form, Col, Row } from 'react-bootstrap';
import ConfigurationTabGeneric from '../../Common/ConfigurationTabGeneric';
import { getResponseFromGeneric } from '../../../Utils/Requests';
import { validateReasonForm } from '../../../Utils/FormValidations';
import _ from 'lodash';
import '../../../sass/SystemAdmin.scss';

class UpdateReason extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: props.isOpen,
            reason: props.reason,
            name: '',
            description: '',
            category: 'Cost',
            reason1: '',
            reason2: '',
            status: 'Active',
            type: 'Downtime',
            level: '',
            asset_level: 'Site',
            show: false,
            modalError: false,
            validation: {},
            assetsOptions: [],
            assetsAreaOptions: [],
            asset_area: '',
            originalUnAssets: [],
            activeUnAssets: [],
            unselectedAssetsUn: [],
            availableListTabs: [],
            completeListTabs: [],
            selectedListTabs: [],
            originalSelectedListTabs: []
        };
    }

    componentDidMount() {
        const { actions } = this.props;
        actions.getAssets(this.props.user.site).then(response => {
            const assetsOptions = _.filter(response, { status: 'Active' });
            this.setState({
                assetsOptions,
                assetsAreaOptions: _.filter(assetsOptions, { asset_level: 'Area' })
            });
        });
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.isOpen !== prevState.isOpen) {
            return {
                isOpen: nextProps.isOpen,
                reason: nextProps.reason,
                name: nextProps.reason.dtreason_name,
                description: nextProps.reason.dtreason_description,
                category: nextProps.reason.dtreason_category,
                reason1: nextProps.reason.reason1,
                reason2: nextProps.reason.reason2,
                status: nextProps.reason.status,
                type: nextProps.reason.type,
                level: nextProps.reason.level,
                asset_level: 'Site',
                status: nextProps.reason.status,
                validation: {},
                asset_area: '',
                originalUnAssets: [],
                activeUnAssets: [],
                unselectedAssetsUn: [],
                availableListTabs: [],
                completeListTabs: [],
                selectedListTabs: [],
                originalSelectedListTabs: []
            };
        }
        return null;
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.isOpen && !_.isEqual(this.state.reason, prevState.reason)) {
            this.fetchData();
        }
    }

    fetchData() {
        const { actions } = this.props;
        const params = {
            dtreason_code: this.state.reason.dtreason_code
        };
        actions.getAssetsReasons(params).then((response) => {
            const originalUnAssets = response;
            const activeUnAssets = _.filter(originalUnAssets, { status: 'Active' });
            const unselectedAssetsUn = _.filter(_.differenceWith(this.state.assetsOptions, activeUnAssets, _.isEqual), { asset_level: 'Cell' });
            let availableListTabs = _.map(unselectedAssetsUn, asset => {
                return { id: asset.asset_code, content: asset.asset_name };
            });
            let selectedListTabs = _.map(activeUnAssets, asset => {
                return { id: asset.asset_code, content: asset.asset_name };
            });
            this.setState({
                originalUnAssets,
                activeUnAssets,
                unselectedAssetsUn,
                availableListTabs,
                completeListTabs: availableListTabs,
                selectedListTabs,
                originalSelectedListTabs: selectedListTabs
            });
        });
    }

    updateTabsImported = (availableListTabs, selectedListTabs) => {
        this.setState({ availableListTabs, selectedListTabs });
    }

    importAllTabs = () => {
        this.updateTabsImported([], _.concat(this.state.completeListTabs, this.state.originalSelectedListTabs));
    };

    resetTabs = () => {
        this.updateTabsImported(this.state.completeListTabs, this.state.originalSelectedListTabs);
    }

    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value,
        });
    };

    handleChangeType = (event) => {
        this.setState({
            [event.target.name]: event.target.value,
            level: ''
        });
    };

    handleChangeAssetLevel = (event) => {
        const { completeListTabs, originalSelectedListTabs } = this.state;
        this.setState({
            [event.target.name]: event.target.value,
            availableListTabs: completeListTabs,
            selectedListTabs: originalSelectedListTabs,
            asset_area: ''
        });
    };

    handleChangeArea = (event) => {
        const { completeListTabs, originalSelectedListTabs, unselectedAssetsUn } = this.state;
        let newAvailable = event.target.value !== '' ?
            _.map(_.filter(unselectedAssetsUn, { parent_asset_code: event.target.value }), asset => {
                return { id: asset.asset_code, content: asset.asset_name };
            }) : completeListTabs;
        this.setState({
            [event.target.name]: event.target.value,
            availableListTabs: newAvailable,
            selectedListTabs: originalSelectedListTabs
        });
    };

    closeModalError = () => {
        this.setState({ modalError: false });
    };

    closeSuccessModal = () => {
        this.setState({ show: false });
    };

    submitReason = async (e) => {
        e.preventDefault();

        const { activeUnAssets, selectedListTabs } = this.state;

        const orginalActivateTabs = _.map(activeUnAssets, asset => {
            return { id: asset.asset_code, content: asset.asset_name };
        });
        //check assets that still active
        const stillActive = _.intersectionWith(orginalActivateTabs, selectedListTabs, _.isEqual);
        //compare the list of still Ative with the original list to know what assets change to inactive
        const changeToInactive = _.map(_.differenceWith(orginalActivateTabs, stillActive, _.isEqual), tab => {
            tab.status = 'Inactive';
            return tab;
        });
        const tabsToInsert = _.concat(selectedListTabs, changeToInactive);

        const validation = validateReasonForm(this.state);

        if (
            _.isEmpty(validation)
        ) {
            let arrayData = _.map(tabsToInsert, selection => {
                return {
                    dtreason_code: this.state.reason.dtreason_code,
                    dtreason_name: this.state.name,
                    dtreason_description: this.state.description,
                    dtreason_category: this.state.category,
                    asset_code: selection.id,
                    reason1: this.state.reason1,
                    reason2: this.state.reason2,
                    status: selection.status || this.state.status,
                    type: this.state.type,
                    level: this.state.level,
                    site_code: this.props.user.site_code
                };
            });
            const data = {
                site_id: this.props.user.site,
                table: 'DTReason',
                data: arrayData
            };

            let res = await getResponseFromGeneric('put', API, '/dragndrop', {}, {}, data);
            if (res.status !== 200) {
                this.setState({
                    modalError: true,
                    validation: {}
                });
            } else {
                this.props.Refresh();
                this.props.onRequestClose();
                this.setState({
                    show: true,
                    validation: {}
                });
            }
        } else {
            this.setState({ validation });
        }
    }

    render() {
        const t = this.props.t;
        const validation = this.state.validation;
        return (
            <div>
                <Modal
                    show={this.props.isOpen}
                    className='general-modal'
                    onHide={this.props.onRequestClose}
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>{t('Update Reason')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>{t('Name')}:</Form.Label>
                                <Col sm={4}>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={this.state.name}
                                        autoComplete={"false"}
                                        onChange={this.handleChange}
                                    />
                                    <Form.Text className='validation'>{validation.name}</Form.Text>
                                </Col>
                                <Form.Label column sm={1}>{t('Type')}:</Form.Label>
                                <Col sm={4}>
                                    <Form.Control
                                        as="select"
                                        name="type"
                                        onChange={this.handleChangeType}
                                        value={this.state.type}
                                    >
                                        <option value="Downtime">Downtime</option>
                                        <option value="Scrap">Scrap</option>
                                    </Form.Control>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>{t('Reason 1')}:</Form.Label>
                                <Col sm={4}>
                                    <Form.Control
                                        type="text"
                                        name="reason1"
                                        value={this.state.reason1}
                                        autoComplete={"false"}
                                        onChange={this.handleChange}
                                    />
                                </Col>
                                <Form.Label column sm={1}>{t('Category')}:</Form.Label>
                                <Col sm={4}>
                                    <Form.Control
                                        as="select"
                                        name="category"
                                        onChange={this.handleChange}
                                        value={this.state.category}
                                    >
                                        <option value="Cost">Cost</option>
                                        <option value="Quality">Quality</option>
                                    </Form.Control>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>{t('Reason 2')}:</Form.Label>
                                <Col sm={4}>
                                    <Form.Control
                                        type="text"
                                        name="reason2"
                                        value={this.state.reason2}
                                        autoComplete={"false"}
                                        onChange={this.handleChange}
                                    />
                                </Col>
                                <Form.Label column sm={1}>{t('Level')}:</Form.Label>
                                <Col sm={4}>
                                    <Form.Control
                                        as="select"
                                        name="level"
                                        onChange={this.handleChange}
                                        value={this.state.level}
                                        disabled={this.state.type !== 'Scrap'}
                                    >
                                        <option value="">None</option>
                                        <option value="Setup">Setup</option>
                                        <option value="Production">Production</option>
                                    </Form.Control>
                                    <Form.Text className='validation'>{validation.level}</Form.Text>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>{t('Description')}:</Form.Label>
                                <Col sm={4}>
                                    <Form.Control
                                        as="textarea"
                                        name="description"
                                        onChange={this.handleChange}
                                        value={this.state.description}
                                        rows={3} />
                                </Col>
                                <Form.Label column sm={1}>{t('Status')}:</Form.Label>
                                <Col sm={4}>
                                    <Form.Control
                                        as="select"
                                        name="status"
                                        onChange={this.handleChange}
                                        value={this.state.status}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </Form.Control>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>{t('Asset Level')}:</Form.Label>
                                <Col sm={2}>
                                    <Form.Control
                                        as="select"
                                        name="asset_level"
                                        onChange={this.handleChangeAssetLevel}
                                        value={this.state.asset_level}
                                    >
                                        <option value="Site">Site</option>
                                        <option value="Area">Area</option>
                                        <option value="Cell">Cell</option>
                                    </Form.Control>
                                </Col>
                            </Form.Group>
                            {this.state.asset_level === 'Area' ?
                                <Form.Group as={Row}>
                                    <Form.Label column sm={2}>{t('Select Area')}:</Form.Label>
                                    <Col sm={2}>
                                        <Form.Control
                                            as="select"
                                            name="asset_area"
                                            onChange={this.handleChangeArea}
                                            value={this.state.asset_area}
                                        >
                                            <option value=''>None</option>
                                            {_.map(this.state.assetsAreaOptions, asset => { return (<option value={asset.asset_code} key={'option_' + asset.asset_code}>{asset.asset_name}</option>) })}
                                        </Form.Control>
                                    </Col>
                                </Form.Group>
                                : null}
                            <Form.Group as={Row}>
                                <Col sm={12}>
                                    <ConfigurationTabGeneric
                                        availableListTabs={this.state.availableListTabs}
                                        selectedListTabs={this.state.selectedListTabs}
                                        selectedAction={this.state.selectedAction}
                                        onUpdateTabsImported={this.updateTabsImported}
                                        importAllTabs={this.importAllTabs}
                                        resetTabs={this.resetTabs}
                                        height={'350px'}
                                        t={t}
                                        genericTitle='Assets'
                                    />
                                </Col>
                                <Form.Text className='validation'>{validation.selectedListTabs}</Form.Text>
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="Primary" onClick={(e) => this.submitReason(e)}>
                            {t('Confirm')}
                        </Button>
                        <Button variant="secondary" onClick={this.props.onRequestClose}>
                            {t('Close')}
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Modal show={this.state.show} onHide={this.closeSuccessModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Sucess</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Reason has been added</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.closeSuccessModal}>
                            Close
            </Button>
                    </Modal.Footer>
                </Modal>
                <Modal show={this.state.modalError} onHide={this.closeModalError}>
                    <Modal.Header closeButton>
                        <Modal.Title>Error</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Error when try to create the new Reason</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.closeModalError}>
                            Close
            </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

export const mapDispatch = (dispatch) => {
    return {
        actions: Object.assign(bindActionCreators(AssetActions, dispatch), bindActionCreators(ReasonActions, dispatch)),
    };
};

export default connect(null, mapDispatch)(UpdateReason);
