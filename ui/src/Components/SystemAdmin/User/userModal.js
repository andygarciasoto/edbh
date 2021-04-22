import Axios from "axios";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as UserActions from "../../../redux/actions/userActions";
import { API } from "../../../Utils/Constants";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
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
      role: '',
      role_id: 0,
      escalation_id: '',
      status: '',
      site: props.user.site,
      rolesArray: [],
      escalationArray: [],
      sites: _.filter(props.user.sites, { Role: 'Administrator' }),
      showForm: true,
      modalError: false,
      validation: {}
    };
  }

  componentDidMount() {
    const { actions } = this.props;
    return Promise.all([
      actions.getRoles(),
      actions.getEscalation(),
    ]).then((response) => {
      const role_id = _.find(response[0], { name: 'Operator' }).role_id;
      this.setState({
        rolesArray: response[0],
        escalationArray: response[1],
        role_id
      });
    });
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!_.isEqual(nextProps.selectedUser, prevState.selectedUser)) {
      const badge = nextProps.action === 'Edit' ? nextProps.selectedUser.Badge : '';
      return {
        selectedUser: nextProps.selectedUser,
        badge: badge,
        username: nextProps.selectedUser.Username || '',
        firstname: nextProps.selectedUser.First_Name || '',
        lastname: nextProps.selectedUser.Last_Name || '',
        role: nextProps.selectedUser.name || '',
        role_id: nextProps.selectedUser.role_id || prevState.role_id,
        escalation_id: nextProps.selectedUser.escalation_level || "",
        site: nextProps.selectedUser.Site || nextProps.user.site,
        status: nextProps.selectedUser.status || '',
        validation: {}
      };
    }
    return null;
  }

  renderRoles(roles, index) {
    return (
      <option value={roles.role_id} key={index}>
        {roles.name}
      </option>
    );
  }

  renderEscalation(escalation, index) {
    return (
      <option value={escalation.escalation_id} key={index}>
        {escalation.escalation_name}
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
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value,
    });
  };

  createUser = (e) => {
    e.preventDefault();
    const {
      badge,
      username,
      firstname,
      lastname,
      role_id,
      status,
      escalation_id,
    } = this.state;

    let url = `${API}/insert_user`;
    let validation = validateUserForm(this.state);

    if (_.isEmpty(validation)) {
      Axios.put(url, {
        badge: badge,
        username: username,
        first_name: firstname,
        last_name: lastname,
        role_id: role_id,
        site_id: this.props.user.site,
        escalation_id: parseInt(escalation_id, 10),
        status: status,
      }).then(
        () => {
          this.props.Refresh();
          this.props.handleClose();
          this.setState({
            show: true,
          });
        },
        (error) => {
          this.setState({
            modalError: true,
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
      modalError: false
    });
  };

  render() {
    const {
      badge,
      username,
      firstname,
      lastname,
      role_id,
      status,
      escalation_id,
      site,
      sites,
      validation
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
                    type="text"
                    name="badge"
                    value={badge}
                    autoComplete={"false"}
                    onChange={this.handleChange}
                  />
                  <Form.Text className='validation'>{validation.badge}</Form.Text>
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={3}>{t('Username')}:</Form.Label>
                <Col sm={9}>
                  <Form.Control
                    type="text"
                    name="username"
                    value={username}
                    autoComplete={"false"}
                    onChange={this.handleChange}
                  />
                  <Form.Text className='validation'>{validation.username}</Form.Text>
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={3}>{t('First Name')}:</Form.Label>
                <Col sm={9}>
                  <Form.Control
                    type="text"
                    name="firstname"
                    value={firstname}
                    autoComplete={"false"}
                    onChange={this.handleChange}
                  />
                  <Form.Text className='validation'>{validation.firstname}</Form.Text>
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={3}>{t('Last Name')}:</Form.Label>
                <Col sm={9}>
                  <Form.Control
                    type="text"
                    name="lastname"
                    value={lastname}
                    autoComplete={"false"}
                    onChange={this.handleChange}
                  />
                  <Form.Text className='validation'>{validation.lastname}</Form.Text>
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={3}>{t('Escalation')}:</Form.Label>
                <Col sm={5}>
                  <Form.Control
                    as="select"
                    value={escalation_id}
                    name='escalation_id'
                    autoComplete={"false"}
                    onChange={this.handleChange}
                  >
                    {this.state.escalationArray.map(this.renderEscalation)}
                    <option value="">None</option>
                  </Form.Control>
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={3}>{t('Role')}:</Form.Label>
                <Col sm={5}>
                  <Form.Control
                    as="select"
                    value={role_id}
                    autoComplete={"false"}
                    name='role_id'
                    onChange={this.handleChange}
                  >
                    {this.state.rolesArray.map(this.renderRoles)}
                  </Form.Control>
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={3}>{t('Site')}:</Form.Label>
                <Col sm={5}>
                  <Form.Control
                    as='select'
                    name='site'
                    value={site}
                    autoComplete={"false"}
                    onChange={this.handleChange}
                  >
                    {sites.map(this.renderSites)}
                  </Form.Control>
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={3}>{t('Status')}:</Form.Label>
                <Col sm={5}>
                  <Form.Control
                    as="select"
                    value={status}
                    name='status'
                    autoComplete={"false"}
                    onChange={this.handleChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </Form.Control>
                </Col>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="Primary" onClick={(e) => this.createUser(e)}>
              {t('Confirm')}
            </Button>
            <Button variant="secondary" onClick={this.props.handleClose}>
              {t('Close')}
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal show={this.state.show} onHide={this.closeModalMessage}>
          <Modal.Header closeButton>
            <Modal.Title>Sucess</Modal.Title>
          </Modal.Header>
          <Modal.Body>User has been copied</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.closeModalMessage}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal show={this.state.modalError} onHide={this.closeModalMessage}>
          <Modal.Header closeButton>
            <Modal.Title>Error</Modal.Title>
          </Modal.Header>
          <Modal.Body>User has not been copied</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.closeModalMessage}>
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
    actions: bindActionCreators(UserActions, dispatch),
  };
};

export default connect(null, mapDispatch)(UserModal);
