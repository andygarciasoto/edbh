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
      role_id: 1,
      status: "Active",
      show: false,
      showForm: true,
    };
  }

  componentDidMount() {
    const { actions } = this.props;

    return actions
      .getUserInfo(this.props.user.site, this.props.badge)
      .then((response) => {
        this.setState({
          badge: response.Badge,
          username: response.Username,
          firstname: response.First_Name,
          lastname: response.Last_Name,
          role: response.name,
          role_id: response.role_id,
          status: response.status,
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

  handleChangeStatus = (event) => {
    this.setState({ status: event.target.value });
  };

  createUser = (e) => {
    e.preventDefault();
    const { badge, username, firstname, lastname, role, status } = this.state;

    var url = `${API}/insert_user`;

    Axios.put(url, {
      badge: badge,
      username: username,
      first_name: firstname,
      last_name: lastname,
      role_id: role,
      site_id: this.props.user.site,
      status: status,
    }).then(
      () => {
        this.setState({
          show: true,
        });
      },
      (error) => {
        console.log(error);
      }
    );
  };

  renderRoles(roles, index) {
    return (
      <option value={roles.role_id} key={index}>
        {roles.name}
      </option>
    );
  }

  handleClose = () => {
    this.props.closeForm();
  };

  render() {
    const {
      badge,
      username,
      firstname,
      lastname,
      role,
      role_id,
      status,
    } = this.state;

    console.log(this.state);
    return (
      <div>
        <Modal show={this.props.showForm} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Edit User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <label>
                Badge:
                <input
                  className="input-badge"
                  type="text"
                  name="badge"
                  value={badge}
                  autoComplete={"false"}
                  onChange={this.handleChange}
                />
              </label>
              <label>
                Username:
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
                First Name:
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
                Last Name:
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
                Role:
                <select
                  value={role}
                  className="input-role"
                  onChange={this.handleChangeRole}
                >
                  <option value="grapefruit">Grapefruit</option>
                  <option value="lime">Lime</option>
                  <option value="coconut">Coconut</option>
                  <option value="mango">Mango</option>
                </select>
              </label>
              <label>
                Status:
                <select
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
              Confirm
            </Button>
            <Button variant="secondary" onClick={this.handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Sucess</Modal.Title>
          </Modal.Header>
          <Modal.Body>User has been added</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose}>
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
