import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as BreakActions from '../../../redux/actions/breakActions';
import * as AssetActions from '../../../redux/actions/assetActions';
import { API } from '../../../Utils/Constants';
import { validateBreakForm } from '../../../Utils/FormValidations';
import { Modal, Button, Form, Col, Row } from 'react-bootstrap';
import ConfigurationTabGeneric from '../../Common/ConfigurationTabGeneric';
import { getResponseFromGeneric } from '../../../Utils/Requests';
import moment from 'moment-timezone';
import _ from 'lodash';
import '../../../sass/SystemAdmin.scss';

class BreakForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: props.isOpen,
      unavailable_name: '',
      unavailable_description: '',
      start_time: '',
      end_time: '',
      asset_level: 'Cell',
      status: 'Active',
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
        unavailable_name: '',
        unavailable_description: '',
        start_time: '',
        end_time: '',
        asset_level: 'Cell',
        status: 'Active',
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

  submitUnavailable = async (e) => {
    e.preventDefault();

    let startTime1 = moment('1970-01-01 ' + this.state.start_time);
    let endTime1 = moment('1970-01-01 ' + this.state.end_time);
    let difference = endTime1.diff(startTime1, 'minutes');

    const validation = validateBreakForm(this.state, this.props);

    if (
      _.isEmpty(validation)
    ) {
      let arrayData = _.map(this.state.selectedListTabs, selection => {
        return {
          unavailable_code: `${this.props.user.site_prefix}-${this.state.unavailable_name}`.replace(/\s+/g, ''),
          unavailable_name: this.state.unavailable_name,
          unavailable_description: this.state.unavailable_description,
          start_time: this.state.start_time,
          end_time: this.state.end_time,
          duration_in_minutes: difference,
          valid_from: moment().tz(this.props.user.timezone).format('YYYY-MM-DD HH:mm:ss'),
          asset_code: selection.id,
          site_code: this.props.user.site_code,
          status: this.state.status
        };
      });
      const data = {
        site_id: this.props.user.site,
        table: 'Unavailable',
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
            <Modal.Title>{t('Add Break')}</Modal.Title>
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
            <Modal.Title>Error</Modal.Title>
          </Modal.Header>
          <Modal.Body>Error when try to create the new break</Modal.Body>
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

export default connect(null, mapDispatch)(BreakForm);
