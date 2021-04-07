import Axios from "axios";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as UserActions from "../../../redux/actions/userActions";
import { API } from "../../../Utils/Constants";
import { Modal, Button } from "react-bootstrap";
import "../../../sass/SystemAdmin.scss";

class AddUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      badge: "",
      username: "",
      firstname: "",
      lastname: "",
      role: 1,
      status: "Active",
      escalation_id: 1,
      site: "",
      roles: [],
      show: false,
      showForm: true,
      escalation: [],
      sites: [],
      modalError: false,
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

  handleChangeRole = (event) => {
    this.setState({ role: event.target.value });
  };

  handleChangeEscalation = (event) => {
    this.setState({ escalation_id: event.target.value });
  };

  handleChangeStatus = (event) => {
    this.setState({ status: event.target.value });
  };

  handleChangeSite = (event) => {
    this.setState({ site: event.target.value });
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

    var url = `${API}/insert_user`;
    if (
      badge !== "" &&
      username !== "" &&
      firstname !== "" &&
      lastname !== ""
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
        modalError: true,
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
    return (
      <div>
        <Modal show={this.state.showForm} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{t('Add User')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <label>
                {t('Badge')}:
                <input
                  className="input-badge"
                  type="text"
                  name="badge"
                  value={this.state.badge}
                  autoComplete={"false"}
                  onChange={this.handleChange}
                />
              </label>
              <label>
                {t('Username')}:
                <input
                  type="text"
                  name="username"
                  className="input-username"
                  value={this.state.username}
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
                  value={this.state.firstname}
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
                  value={this.state.lastname}
                  autoComplete={"false"}
                  onChange={this.handleChange}
                />
              </label>
              <label>
                {t('Escalation')}:
                <select
                  className="input-escalation"
                  onChange={this.handleChangeEscalation}
                >
                  {this.state.escalation.map(this.renderEscalation)}
                </select>
              </label>
              <label>
                {t('Role')}:
                <select className="input-role" onChange={this.handleChangeRole}>
                  {this.state.roles.map(this.renderRoles)}
                </select>
              </label>
              <label>
                {t('Status')}:
                <select
                  className="input-status"
                  onChange={this.handleChangeStatus}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
              <label>
                {t('Site')}:
                <select className="input-role" onChange={this.handleChangeSite}>
                  {this.state.sites.map(this.renderSites)}
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
