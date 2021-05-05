import Axios from 'axios';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UserActions from '../../../redux/actions/userActions';
import { API } from '../../../Utils/Constants';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { validateUserForm } from '../../../Utils/FormValidations';
import _ from 'lodash';

class UserModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedUser: props.selectedUser,
      badge: '',
      username: '',
      firstname: '',
      lastname: '',
      role_name: 'Operator',
      escalation_id: '',
      status: 'Active',
      site: props.user.site,
      roles: [],
      escalationArray: [],
      sites: _.filter(props.user.sites, { Role: 'Administrator' }),
      showForm: true,
      modalError: false,
      validation: {},
      messageTitle: ''
    };
  }

  componentDidMount() {
    const { actions } = this.props;
    const params = {
      site_id: this.props.user.site
    }
    return Promise.all([
      actions.getRoles(),
      actions.getEscalationFilter(params)
    ]).then((response) => {
      this.setState({
        roles: response[0],
        escalationArray: response[1]
      });
    });
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!_.isEqual(nextProps.selectedUser, prevState.selectedUser)) {
      const badge = nextProps.action === 'Update' ? nextProps.selectedUser.Badge : '';
      return {
        selectedUser: nextProps.selectedUser,
        badge: badge,
        username: nextProps.selectedUser.Username || '',
        firstname: nextProps.selectedUser.First_Name || '',
        lastname: nextProps.selectedUser.Last_Name || '',
        role_name: nextProps.selectedUser.Role || 'Operator',
        escalation_id: nextProps.selectedUser.escalation_level || '',
        site: nextProps.selectedUser.Site || nextProps.user.site,
        status: nextProps.selectedUser.status || 'Status',
        validation: {}
      };
    }
    return null;
  }

  renderRoles(roles, index) {
    return (
      <option value={roles.role_name} key={index}>
        {roles.name}
      </option>
    );
  }

  renderEscalation(escalation, index) {
    return (
      <option value={escalation.escalation_id} key={index}>
        {escalation.escalation_name + ' - ' + escalation.escalation_hours + ' hours'}
      </option>
    );
  }

  renderSites(sites, index) {
    return (
      <option value={sites.asset_id} key={index}>
        {sites.asset_name}
      </option>
    );
  }

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  createUser = (e) => {
    e.preventDefault();
    const {
      badge,
      username,
      firstname,
      lastname,
      role_name,
      status,
      escalation_id,
      roles
    } = this.state;

    let url = `${API}/insert_user`;
    let validation = validateUserForm(this.state);
    const messageTitle = this.props.action;
    if (_.isEmpty(validation)) {
      Axios.put(url, {
        badge: badge,
        username: username,
        first_name: firstname,
        last_name: lastname,
        role_id: _.find(roles, { name: role_name }).role_id,
        site_id: this.props.user.site,
        escalation_id: parseInt(escalation_id, 10),
        status: status,
      }).then(
        () => {
          this.props.Refresh();
          this.props.handleClose();
          this.setState({
            show: true,
            messageTitle
          });
        },
        (error) => {
          this.setState({
            modalError: true,
            messageTitle
          });
        }
      );
    } else {
      this.setState({
        validation
      });
    }
  };

  closeModalMessage = () => {
    this.setState({
      show: false,
      modalError: false,
      messageTitle: ''
    });
  };

  render() {
    const {
      badge,
      username,
      firstname,
      lastname,
      role_name,
      status,
      escalation_id,
      site,
      sites,
      validation,
      messageTitle
    } = this.state;

    const t = this.props.t;

    return (
      <div>
        <Modal show={this.props.isOpen} onHide={this.props.handleClose} centered className='general2-modal'>
          <Modal.Header closeButton>
            <Modal.Title>{t(this.props.action + ' User')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group as={Row}>
                <Form.Label column sm={3}>{t('Badge')}:</Form.Label>
                <Col sm={9}>
                  <Form.Control
                    type='text'
                    name='badge'
                    value={badge}
                    autoComplete={'false'}
                    onChange={this.handleChange}
                  />
                  <Form.Text className='validation'>{validation.badge}</Form.Text>
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={3}>{t('Username')}:</Form.Label>
                <Col sm={9}>
                  <Form.Control
                    type='text'
                    name='username'
                    value={username}
                    autoComplete={'false'}
                    onChange={this.handleChange}
                  />
                  <Form.Text className='validation'>{validation.username}</Form.Text>
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={3}>{t('First Name')}:</Form.Label>
                <Col sm={9}>
                  <Form.Control
                    type='text'
                    name='firstname'
                    value={firstname}
                    autoComplete={'false'}
                    onChange={this.handleChange}
                  />
                  <Form.Text className='validation'>{validation.firstname}</Form.Text>
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={3}>{t('Last Name')}:</Form.Label>
                <Col sm={9}>
                  <Form.Control
                    type='text'
                    name='lastname'
                    value={lastname}
                    autoComplete={'false'}
                    onChange={this.handleChange}
                  />
                  <Form.Text className='validation'>{validation.lastname}</Form.Text>
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={3}>{t('Escalation')}:</Form.Label>
                <Col sm={7}>
                  <Form.Control
                    as='select'
                    value={escalation_id}
                    name='escalation_id'
                    autoComplete={'false'}
                    onChange={this.handleChange}
                  >
                    {this.state.escalationArray.map(this.renderEscalation)}
                    <option value=''>None</option>
                  </Form.Control>
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={3}>{t('Role')}:</Form.Label>
                <Col sm={7}>
                  <Form.Control
                    as='select'
                    value={role_name}
                    autoComplete={'false'}
                    name='role_name'
                    onChange={this.handleChange}
                  >
                    {this.state.roles.map(this.renderRoles)}
                  </Form.Control>
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={3}>{t('Site')}:</Form.Label>
                <Col sm={7}>
                  <Form.Control
                    as='select'
                    name='site'
                    value={site}
                    autoComplete={'false'}
                    onChange={this.handleChange}
                  >
                    {sites.map(this.renderSites)}
                  </Form.Control>
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={3}>{t('Status')}:</Form.Label>
                <Col sm={7}>
                  <Form.Control
                    as='select'
                    value={status}
                    name='status'
                    autoComplete={'false'}
                    onChange={this.handleChange}
                  >
                    <option value='Active'>Active</option>
                    <option value='Inactive'>Inactive</option>
                  </Form.Control>
                </Col>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant='Primary' onClick={(e) => this.createUser(e)}>
              {t('Confirm')}
            </Button>
            <Button variant='secondary' onClick={this.props.handleClose}>
              {t('Close')}
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal show={this.state.show} onHide={this.closeModalMessage}>
          <Modal.Header closeButton>
            <Modal.Title>Success</Modal.Title>
          </Modal.Header>
          <Modal.Body>User has been {messageTitle === 'Create' ? 'created' : (messageTitle === 'Update' ? 'updated' : 'copied')}</Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={this.closeModalMessage}>
              {t('Close')}
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal show={this.state.modalError} onHide={this.closeModalMessage}>
          <Modal.Header closeButton>
            <Modal.Title>Error</Modal.Title>
          </Modal.Header>
          <Modal.Body>User has not been {messageTitle === 'Create' ? 'created' : (messageTitle === 'Update' ? 'updated' : 'copied')}</Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={this.closeModalMessage}>
              {t('Close')}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export const mapDispatch = (dispatch) => {
  return {
    actions: bindActionCreators(UserActions, dispatch),
  };
};

export default connect(null, mapDispatch)(UserModal);
