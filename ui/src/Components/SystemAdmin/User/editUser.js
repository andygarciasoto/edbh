import Axios from "axios";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as UserActions from "../../../redux/actions/userActions";
import { API } from "../../../Utils/Constants";
import { Modal, Button } from "react-bootstrap";
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

  handleChangeRole = (event) => {
    this.setState({ role_id: event.target.value });
  };

  handleChangeStatus = (event) => {
    this.setState({ status: event.target.value });
  };

  handleChangeEscalation = (event) => {
    this.setState({ escalation_id: event.target.value });
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

    var url = `${API}/insert_user`;

    if (username !== "" && firstname !== "" && lastname !== "") {
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
        modalError: true,
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
    } = this.state;

    const t = this.props.t;

    return (
      <div>
        <Modal show={this.props.showForm} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{t('Edit User')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <label>
                {t('Badge')}:
                <input
                  className="input-badge"
                  type="text"
                  name="badge"
                  value={badge}
                  autoComplete={"false"}
                  readOnly={true}
                  onChange={this.handleChange}
                />
              </label>
              <label>
                {t('Username')}:
                <input
                  type="text"
                  name="username"
                  className="input-username"
                  value={username}
                  autoComplete={"false"}
                  onChange={this.handleChange}
                />
              </label>
              <label>
                {t('First Name')}:
                <input
                  type="text"
                  name="firstname"
                  className="input-firstname"
                  value={firstname}
                  autoComplete={"false"}
                  onChange={this.handleChange}
                />
              </label>
              <label>
                {t('Last Name')}:
                <input
                  type="text"
                  name="lastname"
                  className="input-lastname"
                  value={lastname}
                  autoComplete={"false"}
                  onChange={this.handleChange}
                />
              </label>
              <label>
                {t('Escalation')}:
                <select
                  value={escalation_id}
                  className="input-escalation"
                  onChange={this.handleChangeEscalation}
                >
                  {this.state.escalationArray.map(this.renderEscalation)}
                  <option value="">None</option>
                </select>
              </label>
              <label>
                {t('Role')}:
                <select
                  value={role_id}
                  className="input-role"
                  onChange={this.handleChangeRole}
                >
                  {this.state.rolesArray.map(this.renderRoles)}
                </select>
              </label>
              <label>
                {t('Status')}:
                <select
                  value={status}
                  className="input-status"
                  onChange={this.handleChangeStatus}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
            </form>
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
