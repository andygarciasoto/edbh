import Axios from "axios";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as UserActions from "../../../redux/actions/userActions";
import { API } from "../../../Utils/Constants";
//import { Col, Form, Row } from "react-bootstrap";
import "../../../sass/SystemAdmin.scss";

class AddUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      badge: "",
      username: "",
      firstname: "",
      lastname: "",
      role: "",
      status: "",
      roles: [],
    };
  }

  componentDidMount() {
    const { actions } = this.props;

    return actions.getRoles().then((response) => {
      this.setState({
        roles: response,
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
      (response) => {
        console.log(response);
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

  render() {
    return (
      <div className="user-box">
        <form>
          <label>
            Badge:
            <input
              type="text"
              name="badge"
              value={this.state.badge}
              autoComplete={"false"}
              onChange={this.handleChange}
            />
          </label>
          <label>
            Username:
            <input
              type="text"
              name="username"
              value={this.state.username}
              autoComplete={"false"}
              onChange={this.handleChange}
            />
          </label>
          <label>
            First Name:
            <input
              type="text"
              name="firstname"
              value={this.state.firstname}
              autoComplete={"false"}
              onChange={this.handleChange}
            />
          </label>
          <label>
            Last Name:
            <input
              type="text"
              name="lastname"
              value={this.state.lastname}
              autoComplete={"false"}
              onChange={this.handleChange}
            />
          </label>
          <label>
            Role:
            <select onChange={this.handleChangeRole}>
              {this.state.roles.map(this.renderRoles)}
            </select>
          </label>
          <label>
            Status:
            <select onChange={this.handleChangeStatus}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>
          <button type="submit" onClick={(e) => this.createUser(e)}>
            Agregar
          </button>
        </form>
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
