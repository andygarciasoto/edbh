import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as AssetActions from '../../../redux/actions/assetActions';
import { API } from "../../../Utils/Constants";
import { Modal, Button, Form, Col, Row } from 'react-bootstrap';
import ConfigurationTabGeneric from '../../Common/ConfigurationTabGeneric';
import { getResponseFromGeneric } from '../../../Utils/Requests';
import { validateReasonForm } from '../../../Utils/FormValidations';
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
      options.push({ id: asset.asset_code, content: asset.asset_name });
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

  handleChangeType = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
      level: ''
    });
  };

  handleChangeAssetLevel = (event) => {
    let options = [];
    _.forEach(_.filter(this.state.assetsOptions, { asset_level: event.target.value }), asset => {
      options.push({ id: asset.asset_code, content: asset.asset_name });
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

  submitReason = async (e) => {
    e.preventDefault();

    const validation = validateReasonForm(this.state);

    if (
      _.isEmpty(validation)
    ) {
      let arrayData = _.map(this.state.selectedListTabs, selection => {
        return {
          dtreason_code: `${this.props.user.site_prefix}-${this.state.name}`.replace(/\s+/g, ''),
          dtreason_name: this.state.name,
          dtreason_description: this.state.description,
          dtreason_category: this.state.category,
          asset_code: selection.id,
          reason1: this.state.reason1,
          reason2: this.state.reason2,
          status: this.state.status,
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
            <Modal.Title>{t('Add Reason')}</Modal.Title>
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
    actions: bindActionCreators(AssetActions, dispatch),
  };
};

export default connect(null, mapDispatch)(AddReason);
