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

class UpdateBreak extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: props.isOpen,
      unavailable: props.unavailable,
      unavailable_name: '',
      unavailable_description: '',
      start_time: '',
      end_time: '',
      asset_level: 'Site',
      status: 'Active',
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

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.isOpen !== prevState.isOpen) {
      return {
        isOpen: nextProps.isOpen,
        unavailable: nextProps.unavailable,
        unavailable_name: nextProps.unavailable.unavailable_name,
        unavailable_description: nextProps.unavailable.unavailable_description,
        start_time: nextProps.unavailable.start_time,
        end_time: nextProps.unavailable.end_time,
        asset_level: 'Site',
        status: nextProps.unavailable.status,
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
    if (this.props.isOpen && !_.isEqual(this.state.unavailable, prevState.unavailable)) {
      this.fetchData();
    }
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

  fetchData() {
    const { actions } = this.props;
    const params = {
      unavailable_code: this.state.unavailable.unavailable_code
    };
    actions.getAssetsUnavailable(params).then((response) => {
      const originalUnAssets = response;
      const activeUnAssets = _.filter(originalUnAssets, { status: 'Active' });
      const unselectedAssetsUn = _.filter(_.differenceWith(this.state.assetsOptions, activeUnAssets, _.isEqual), { asset_level: 'Cell' });
      let availableListTabs = _.map(unselectedAssetsUn, asset => {
        return { id: asset.asset_id.toString(), content: asset.asset_name };
      });
      let selectedListTabs = _.map(activeUnAssets, asset => {
        return { id: asset.asset_id.toString(), content: asset.asset_name };
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
        return { id: asset.asset_id.toString(), content: asset.asset_name };
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

  submitUnavailable = (e) => {
    const { activeUnAssets, selectedListTabs } = this.state;

    const orginalActivateTabs = _.map(activeUnAssets, asset => {
      return { id: asset.asset_id.toString(), content: asset.asset_name };
    });
    //primero tenemos que sacar los que si siguen activos de los orginales
    const stillActive = _.intersectionWith(orginalActivateTabs, selectedListTabs, _.isEqual);
    //y luego esa lista compararla con la total de activos originales y la diferencia no están son los que tenemos que pasar a Inactive
    const changeToInactive = _.map(_.differenceWith(orginalActivateTabs, stillActive, _.isEqual), tab => {
      tab.status = 'Inactive';
      return tab;
    });
    const tabsToInsert = _.concat(selectedListTabs, changeToInactive);

    let startTime1 = moment('1970-01-01 ' + this.state.start_time);
    let endTime1 = moment('1970-01-01 ' + this.state.end_time);
    let difference = endTime1.diff(startTime1, 'minutes');

    const validation = validateBreakForm(this.state);
    if (_.isEmpty(validation)) {
      let message = [];
      _.forEach(tabsToInsert, async (selected, index) => {
        const data = {
          unavailable_code: this.state.unavailable.unavailable_code,
          unavailable_name: this.state.unavailable_name,
          unavailable_description: this.state.unavailable_description,
          start_time: this.state.start_time,
          end_time: this.state.end_time,
          duration_in_minutes: difference,
          valid_from: moment().tz(this.props.user.timezone).format('YYYY-MM-DD HH:mm:ss'),
          status: selected.status || this.state.status,
          asset_level: 'Cell',
          asset_id: parseInt(selected.id, 10),
          site_id: this.props.user.site
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
            <Modal.Title>{t('Update Break')}</Modal.Title>
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
                      onChange={this.handleChangeArea}
                      value={this.state.asset_area}
                    >
                      <option value=''>None</option>
                      {_.map(this.state.assetsAreaOptions, asset => { return (<option value={asset.asset_code} key={'option_' + asset.asset_code}>{asset.asset_name}</option>) })}
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
