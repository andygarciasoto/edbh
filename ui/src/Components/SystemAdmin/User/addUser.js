import Axios from "axios";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as UserActions from "../../../redux/actions/userActions";
import { API } from "../../../Utils/Constants";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { validateUserForm } from '../../../Utils/FormValidations';
import _ from 'lodash';
import "../../../sass/SystemAdmin.scss";

class AddUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      badge: '',
      username: '',
      firstname: '',
      lastname: '',
      role: 1,
      status: "Active",
      escalation_id: 1,
      site: props.user.site,
      roles: [],
      show: false,
      showForm: true,
      escalation: [],
      sites: [],
      modalError: false,
      validation: {}
    };
  }

  componentDidMount() {
    const { actions } = this.props;

    return Promise.all([
      actions.getRoles(),
      actions.getEscalation(),
      actions.getSites(),
    ]).then((response) => {
      this.setState({
        roles: response[0],
        escalation: response[1],
        sites: response[2],
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

  createUser = (e) => {
    e.preventDefault();
    const {
      badge,
      username,
      firstname,
      lastname,
      role,
      status,
      escalation_id,
      site,
    } = this.state;

    let url = `${API}/insert_user`;

    let validation = validateUserForm(this.state);

    if (
      _.isEmpty(validation)
    ) {
      Axios.put(url, {
        badge: badge,
        username: username,
        first_name: firstname,
        last_name: lastname,
        role_id: role,
        site_id: this.props.user.site,
        escalation_id: parseInt(escalation_id, 10),
        site: site,
        status: status,
      }).then(
        () => {
          this.props.Refresh();
          this.setState({
            show: true,
          });
          this.handleClose();
        },
        (error) => {
          console.log(error);
        }
      );
    } else {
      this.setState({
        validation
      });
    }
  };

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

  handleClose = () => {
    this.setState({ showForm: false });
  };

  closeModalError = () => {
    this.setState({ modalError: false });
  };

  closeSuccessModal = () => {
    this.setState({ show: false });
  };

  render() {
    const t = this.props.t;
    const validation = this.state.validation;
    return (
      <div>
        <Modal show={this.state.showForm} onHide={this.handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>{t('Add User')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group as={Row}>
                <Form.Label column sm={2}>{t('Badge')}:</Form.Label>
                <Col sm={10}>
                  <Form.Control
                    type="text"
                    name="badge"
                    value={this.state.badge}
                    autoComplete={"false"}
                    onChange={this.handleChange}
                  />
                  <Form.Text className='validation'>{validation.badge}</Form.Text>
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={2}>{t('Username')}:</Form.Label>
                <Col sm={10}>
                  <Form.Control
                    type="text"
                    name="username"
                    value={this.state.username}
                    autoComplete={"false"}
                    onChange={this.handleChange}
                  />
                  <Form.Text className='validation'>{validation.username}</Form.Text>
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={2}>{t('First Name')}:</Form.Label>
                <Col sm={10}>
                  <Form.Control
                    type="text"
                    name="firstname"
                    value={this.state.firstname}
                    autoComplete={"false"}
                    onChange={this.handleChange}
                  />
                  <Form.Text className='validation'>{validation.firstname}</Form.Text>
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={2}>{t('Last Name')}:</Form.Label>
                <Col sm={10}>
                  <Form.Control
                    type="text"
                    name="lastname"
                    value={this.state.lastname}
                    autoComplete={"false"}
                    onChange={this.handleChange}
                  />
                  <Form.Text className='validation'>{validation.lastname}</Form.Text>
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={2}>{t('Escalation')}:</Form.Label>
                <Col sm={10}>
                  <Form.Control
                    as="select"
                    value={this.state.escalation_id}
                    name='escalation_id'
                    autoComplete={"false"}
                    onChange={this.handleChange}
                  >
                    {this.state.escalation.map(this.renderEscalation)}
                  </Form.Control>
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={2}>{t('Role')}:</Form.Label>
                <Col sm={10}>
                  <Form.Control
                    as="select"
                    value={this.state.role}
                    autoComplete={"false"}
                    name='role'
                    onChange={this.handleChange}
                  >
                    {this.state.roles.map(this.renderRoles)}
                  </Form.Control>
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={2}>{t('Status')}:</Form.Label>
                <Col sm={10}>
                  <Form.Control
                    as="select"
                    value={this.state.status}
                    name='status'
                    autoComplete={"false"}
                    onChange={this.handleChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </Form.Control>
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={2}>{t('Site')}:</Form.Label>
                <Col sm={10}>
                  <Form.Control
                    as='select'
                    name='site'
                    value={this.state.site}
                    autoComplete={"false"}
                    onChange={this.handleChange}
                  >
                    {this.state.sites.map(this.renderSites)}
                  </Form.Control>
                </Col>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="Primary" onClick={(e) => this.createUser(e)}>
              {t('Confirm')}
            </Button>
            <Button variant="secondary" onClick={this.handleClose}>
              {t('Close')}
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal show={this.state.show} onHide={this.closeSuccessModal}>
          <Modal.Header closeButton>
            <Modal.Title>Sucess</Modal.Title>
          </Modal.Header>
          <Modal.Body>User has been added</Modal.Body>
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
    actions: bindActionCreators(UserActions, dispatch),
  };
};

export default connect(null, mapDispatch)(AddUser);
