import Axios from "axios";
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as BreakActions from '../../../redux/actions/breakActions';
import * as AssetActions from '../../../redux/actions/assetActions';
import { API } from '../../../Utils/Constants';
import { validateBreakForm } from '../../../Utils/FormValidations';
import { Modal, Button, Form, Col, Row } from 'react-bootstrap';
import moment from 'moment-timezone';
import _ from 'lodash';
import '../../../sass/SystemAdmin.scss';

class BreakForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      unavailable_id: props.unavailable_id,
      unavailable_name: '',
      unavailable_description: '',
      start_time: '',
      end_time: '',
      asset_id: 0,
      status: 'Active',
      show: false,
      modalError: false,
      action: props.action,
      validation: {},
      assetsOptions: []
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.action !== prevState.action || nextProps.unavailable_id !== prevState.unavailable_id) {
      return {
        action: nextProps.action,
        modalTitle: nextProps.action === 'create' ? nextProps.t('Add Break') : nextProps.t('Update Break'),
        unavailable_id: nextProps.unavailable_id,
        unavailable_name: '',
        unavailable_description: '',
        start_time: '',
        end_time: '',
        asset_id: 0,
        status: 'Active',
        validation: {}
      };
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.action !== this.state.action && this.state.action === 'update' && this.state.unavailable_id !== 0) {
      this.fetchData();
    }
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.getAssets(this.props.user.site).then(response => {
      this.setState({
        assetsOptions: _.filter(response, { asset_level: 'Cell' })
      });
    });
  }

  fetchData() {
    const { actions } = this.props;

    const params = {
      site_id: this.props.user.site,
      unavailable_id: this.state.unavailable_id
    };

    actions.getBreakFilter(params).then((responses) => {
      this.setState({
        unavailable_name: responses[0].unavailable_name,
        unavailable_description: responses[0].unavailable_description || '',
        asset_id: responses[0].asset_id || 0,
        start_time: responses[0].start_time,
        end_time: responses[0].end_time,
        status: responses[0].status
      });
    });
  }

  handleChange = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({
      [name]: value,
    });
  };

  handleClose = () => {
    this.setState({ showForm: false });
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
      unavailable_id,
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
                <Col sm={10}>
                  <Form.Control
                    type="text"
                    name="unavailable_name"
                    value={this.state.unavailable_name}
                    autoComplete={"false"}
                    onChange={this.handleChange}
                  />
                  <Form.Text className='validation'>{validation.unavailable_name}</Form.Text>
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={2}>{t('Description')}:</Form.Label>
                <Col sm={10}>
                  <Form.Control
                    as="textarea"
                    name="unavailable_description"
                    onChange={this.handleChange}
                    value={this.state.unavailable_description}
                    rows={3} />
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={2}>{t('Start Time')}:</Form.Label>
                <Col sm={4}>
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
                <Form.Label column sm={2}>{t('Start Time')}:</Form.Label>
                <Col sm={4}>
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
                <Form.Label column sm={2}>{t('Asset')}:</Form.Label>
                <Col sm={4}>
                  <Form.Control
                    as="select"
                    name="asset_id"
                    onChange={this.handleChange}
                    value={this.state.asset_id}
                  >
                    <option value={0}>None</option>
                    {_.map(this.state.assetsOptions, asset => { return (<option value={asset.asset_id}>{asset.asset_name}</option>) })}
                  </Form.Control>
                  <Form.Text className='validation'>{validation.asset_id}</Form.Text>
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
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

export default connect(null, mapDispatch)(BreakForm);
