import Axios from "axios";
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as BreakActions from '../../../redux/actions/breakActions';
import * as AssetActions from '../../../redux/actions/assetActions';
import { API } from '../../../Utils/Constants';
import { validateBreakForm } from '../../../Utils/FormValidations';
import { Modal, Button, Form, Col, Row } from 'react-bootstrap';
import ConfigurationTabGeneric from '../../Common/ConfigurationTabGeneric';
import moment from 'moment-timezone';
import _ from 'lodash';
import '../../../sass/SystemAdmin.scss';

class UpdateBreak extends Component {
  constructor(props) {
    super(props);
    this.state = {
      unavailable: props.unavailable,
      unavailable_name: '',
      unavailable_description: '',
      start_time: '',
      end_time: '',
      asset_level: 'Site',
      status: 'Active',
      show: false,
      modalError: false,
      action: props.action,
      validation: {},
      assetsOptions: [],
      assetsAreaOptions: [],
      asset_area: 0,
      completeListTabs: [],
      availableListTabs: [],
      selectedListTabs: []
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.action !== prevState.action || !_.isEqual(nextProps.unavailable, prevState.unavailable)) {
      return {
        action: nextProps.action,
        modalTitle: nextProps.action === 'create' ? nextProps.t('Add Break') : nextProps.t('Update Break'),
        unavailable: nextProps.unavailable,
        unavailable_name: '',
        unavailable_description: '',
        start_time: '',
        end_time: '',
        asset_level: 'Site',
        status: 'Active',
        validation: {},
        asset_area: 0,
        completeListTabs: [],
        availableListTabs: [],
        selectedListTabs: []
      };
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.isOpen && (!_.isEqual(this.state.unavailable, prevState.unavailable) || !_.isEqual(this.state.action, prevState.action))) {
      this.fetchData();
    }
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.getAssets(this.props.user.site).then(response => {
      this.setState({
        assetsOptions: response,
        assetsAreaOptions: _.filter(response, { asset_level: 'Area' })
      });
    });
  }

  fetchData() {
    console.log('call fetch data');
    if (this.state.action === 'create') {
      this.loadDataCreate();
    } else {
      this.loadDataUpdate();
    }
  }

  loadDataCreate() {
    let availableListTabs = [];
    _.forEach(_.filter(this.state.assetsOptions, { asset_level: this.state.asset_level }), asset => {
      availableListTabs.push({ id: asset.asset_id.toString(), content: asset.asset_name });
    });
    this.setState({
      availableListTabs,
      completeListTabs: availableListTabs
    });
  }

  loadDataUpdate() {
    this.setState((state) => ({
      unavailable_name: state.unavailable.unavailable_name,
      unavailable_description: state.unavailable.unavailable_description,
      start_time: state.unavailable.start_time,
      end_time: state.unavailable.end_time,
      status: state.unavailable.status
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
    let availableListTabs = [];
    _.forEach(_.filter(this.state.assetsOptions, { asset_level: event.target.value }), asset => {
      availableListTabs.push({ id: asset.asset_id.toString(), content: asset.asset_name });
    });;
    this.setState({
      [event.target.name]: event.target.value,
      availableListTabs,
      completeListTabs: availableListTabs,
      selectedListTabs: []
    });
  };

  closeModalError = () => {
    this.setState({ modalError: false });
  };

  closeSuccessModal = () => {
    this.setState({ show: false });
  };

  submitUnavailable = (e) => {
    e.preventDefault();
    const {
      unavailable_name,
      unavailable_description,
      start_time,
      end_time,
      asset_id,
      status
    } = this.state;
    let url = `${API}/insert_unavailable`;

    let startTime1 = moment('1970-01-01 ' + start_time);
    let endTime1 = moment('1970-01-01 ' + end_time);
    let difference = endTime1.diff(startTime1, 'minutes');

    const validation = validateBreakForm(this.state);

    if (
      _.isEmpty(validation)
    ) {
      Axios.put(url, {
        unavailable_code: `${this.props.user.site_prefix} - ${unavailable_name}`,
        unavailable_id: this.props.unavailable_id,
        unavailable_name: unavailable_name,
        unavailable_description: unavailable_description,
        start_time: start_time,
        end_time: end_time,
        duration_in_minutes: difference,
        valid_from: moment().tz(this.props.user.timezone).format('YYYY-MM-DD HH:mm:ss'),
        status: status,
        asset_id: asset_id,
        site_id: this.props.user.site
      }).then(
        () => {
          this.props.Refresh();
          this.props.onRequestClose();
          this.setState({
            show: true,
            validation: {}
          });
        },
        (error) => {
          console.log(error);
        }
      );
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
            <Modal.Title>{this.state.modalTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group as={Row}>
                <Form.Label column sm={2}>{t('Name')}:</Form.Label>
                <Col sm={5}>
                  <Form.Control
                    type="text"
                    name="unavailable_name"
                    value={this.state.unavailable_name}
                    autoComplete={"false"}
                    onChange={this.handleChange}
                  />
                  <Form.Text className='validation'>{validation.unavailable_name}</Form.Text>
                </Col>
                <Form.Label column sm={1}>{t('Start Time')}:</Form.Label>
                <Col sm={3}>
                  <Form.Control
                    type='time'
                    name='start_time'
                    onChange={this.handleChange}
                    value={this.state.start_time}
                  />
                  <Form.Text className='validation'>{validation.start_time}</Form.Text>
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={2}>{t('Description')}:</Form.Label>
                <Col sm={5}>
                  <Form.Control
                    as="textarea"
                    name="unavailable_description"
                    onChange={this.handleChange}
                    value={this.state.unavailable_description}
                    rows={3} />
                </Col>
                <Form.Label column sm={1}>{t('End Time')}:</Form.Label>
                <Col sm={3}>
                  <Form.Control
                    type='time'
                    name='end_time'
                    onChange={this.handleChange}
                    value={this.state.end_time}
                  />
                  <Form.Text className='validation'>{validation.end_time}</Form.Text>
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
                <Form.Label column sm={{ span: 1, offset: 3 }}>{t('Status')}:</Form.Label>
                <Col sm={2}>
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
              {this.state.asset_level === 'Area' ?
                <Form.Group as={Row}>
                  <Form.Label column sm={2}>{t('Select Area')}:</Form.Label>
                  <Col sm={2}>
                    <Form.Control
                      as="select"
                      name="asset_area"
                      onChange={this.handleChangeAssetArea}
                      value={this.state.asset_area}
                    >
                      <option value='0'>None</option>
                      {_.map(this.state.assetsAreaOptions, asset => { return (<option value={asset.asset_id}>{asset.asset_name}</option>) })}
                    </Form.Control>
                  </Col>
                </Form.Group>
                : null}
              <Col md='12'>
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
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="Primary" onClick={(e) => this.submitUnavailable(e)}>
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
          <Modal.Body>Break has been added</Modal.Body>
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
      </div >
    );
  }
}

export const mapDispatch = (dispatch) => {
  return {
    actions: Object.assign(bindActionCreators(BreakActions, dispatch), bindActionCreators(AssetActions, dispatch)),
  };
};

export default connect(null, mapDispatch)(UpdateBreak);
