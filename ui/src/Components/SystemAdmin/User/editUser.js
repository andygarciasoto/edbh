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

class EditUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      badge: "",
      username: "",
      firstname: "",
      lastname: "",
      role: "",
      role_id: 0,
      status: "",
      show: false,
      showForm: true,
      rolesArray: [],
      escalation_id: 0,
      escalationArray: [],
      modalError: false,
      validation: {}
    };
  }

  componentDidMount() {
    const { actions } = this.props;

    return Promise.all([
      actions.getUserInfo(this.props.user.site, this.props.badge),
      actions.getRoles(),
      actions.getEscalation(),
    ]).then((response) => {
      this.setState({
        badge: response[0].Badge,
        username: response[0].Username,
        firstname: response[0].First_Name,
        lastname: response[0].Last_Name,
        role: response[0].name,
        role_id: response[0].role_id,
        escalation_id: response[0].escalation_level || '',
        status: response[0].status,
        rolesArray: response[1],
        escalationArray: response[2],
      });
    });
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
        badge: this.props.badge,
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
          this.setState({
            show: true,
          });
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

  closeModalError = () => {
    this.setState({ modalError: false });
  };

  handleClose = () => {
    this.props.closeForm();
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
      validation
    } = this.state;

    const t = this.props.t;

    return (
      <div>
        <Modal show={this.state.showForm} onHide={this.handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>{t('Edit User')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group as={Row}>
                <Form.Label column sm={2}>{t('Badge')}:</Form.Label>
                <Col sm={10}>
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
                <Form.Label column sm={2}>{t('Username')}:</Form.Label>
                <Col sm={10}>
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
                <Form.Label column sm={2}>{t('First Name')}:</Form.Label>
                <Col sm={10}>
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
                <Form.Label column sm={2}>{t('Last Name')}:</Form.Label>
                <Col sm={10}>
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
                <Form.Label column sm={2}>{t('Escalation')}:</Form.Label>
                <Col sm={10}>
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
                <Form.Label column sm={2}>{t('Role')}:</Form.Label>
                <Col sm={10}>
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
                <Form.Label column sm={2}>{t('Status')}:</Form.Label>
                <Col sm={10}>
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
            <Button variant="secondary" onClick={this.handleClose}>
              {t('Close')}
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Sucess</Modal.Title>
          </Modal.Header>
          <Modal.Body>User has been updated</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal show={this.state.modalError} onHide={this.handleClose}>
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

export default connect(null, mapDispatch)(EditUser);
