import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as AssetActions from '../../../redux/actions/assetActions';
import { API } from "../../../Utils/Constants";
import { Modal, Button, Form, Col, Row } from 'react-bootstrap';
import ConfigurationTabGeneric from '../../Common/ConfigurationTabGeneric';
import { getResponseFromGeneric } from '../../../Utils/Requests';
import _ from 'lodash';
import '../../../sass/SystemAdmin.scss';

class AddReason extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: props.isOpen,
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
      completeListTabs: [],
      availableListTabs: [],
      selectedListTabs: []
    };
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.getAssets(this.props.user.site).then(response => {
      this.setState({
        assetsOptions: _.filter(response, { status: 'Active' })
      });
    });
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.isOpen !== prevState.isOpen) {
      return {
        isOpen: nextProps.isOpen,
        name: '',
        description: '',
        category: 'Cost',
        reason1: '',
        reason2: '',
        status: 'Active',
        type: 'Downtime',
        level: '',
        asset_level: 'Site',
        validation: {},
        completeListTabs: [],
        availableListTabs: [],
        selectedListTabs: []
      };
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.isOpen && this.state.isOpen !== prevState.isOpen) {
      this.fetchData();
    }
  }

  fetchData() {
    let options = [];
    _.forEach(_.filter(this.state.assetsOptions, { asset_level: this.state.asset_level }), asset => {
      options.push({ id: asset.asset_id.toString(), content: asset.asset_name });
    });
    this.setState((state) => ({
      availableListTabs: state.asset_level === 'Site' ? [] : options,
      completeListTabs: options,
      selectedListTabs: state.asset_level === 'Site' ? options : []
    }));
  }

  updateTabsImported = (availableListTabs, selectedListTabs) => {
    this.setState({ availableListTabs, selectedListTabs });
  }

  importAllTabs = () => {
    this.updateTabsImported([], this.state.completeListTabs);
  };

  resetTabs = () => {
    this.updateTabsImported(this.state.completeListTabs, []);
  }

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  handleChangeAssetLevel = (event) => {
    let options = [];
    _.forEach(_.filter(this.state.assetsOptions, { asset_level: event.target.value }), asset => {
      options.push({ id: asset.asset_id.toString(), content: asset.asset_name });
    });
    this.setState({
      [event.target.name]: event.target.value,
      availableListTabs: event.target.value === 'Site' ? [] : options,
      completeListTabs: options,
      selectedListTabs: event.target.value === 'Site' ? options : []
    });
  };

  closeModalError = () => {
    this.setState({ modalError: false });
  };

  closeSuccessModal = () => {
    this.setState({ show: false });
  };

  submitReason = (e) => {
    e.preventDefault();

    const validation = [];//validateBreakForm(this.state);

    if (
      _.isEmpty(validation)
    ) {
      let message = [];
      _.forEach(this.state.selectedListTabs, async (selected, index) => {
        const data = {

        };
        let res = await getResponseFromGeneric('put', API, '/insert_unavailable', {}, {}, data);
        if (res.status !== 200) {
          message.push(selected);
        }
        if (index === (this.state.selectedListTabs.length - 1)) {
          this.props.Refresh();
          if (_.isEmpty(message)) {
            this.props.onRequestClose();
            this.setState({
              show: true,
              validation: {}
            });
          } else {
            console.log('Error', _.map(message, 'content').join(', '));
          }
        }
      });
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
            <Modal.Title>Add Reason</Modal.Title>
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
                <Form.Label column sm={2}>{t('Type')}:</Form.Label>
                <Col sm={4}>
                  <Form.Control
                    as="select"
                    name="type"
                    onChange={this.handleChange}
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
                <Form.Label column sm={2}>{t('Category')}:</Form.Label>
                <Col sm={4}>
                  <Form.Control
                    as="select"
                    name="quality"
                    onChange={this.handleChange}
                    value={this.state.quality}
                  >
                    <option value="Active">Cost</option>
                    <option value="Inactive">Quality</option>
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
                <Form.Label column sm={2}>{t('Level')}:</Form.Label>
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
                <Form.Label column sm={2}>{t('Status')}:</Form.Label>
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
            <Modal.Title>Warning</Modal.Title>
          </Modal.Header>
          <Modal.Body>All inputs must be filled</Modal.Body>
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
    actions: bindActionCreators(AssetActions, dispatch),
  };
};

export default connect(null, mapDispatch)(AddReason);
