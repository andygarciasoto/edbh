import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as UserActions from "../../redux/actions/userActions";
import Table from "react-bootstrap/Table";
import Filter from "../CustomComponents/filter";
import AddUser from "./User/addUser";
import EditUser from "./User/editUser";

import EditIcon from "../../resources/u668.svg";

class UserTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      usersData: [],
      user: false,
      edit: false,
      badge: ""
    };
  }

  componentDidMount() {
    const { actions } = this.props;

    return actions.getAllUsers(this.props.user.site).then((response) => {
      this.setState({
        usersData: response,
      });
    });
  }

  showAddUser = () => {
    this.setState({
      user: true,
    });
  };

  showEditUser = (badge) => {
    this.setState({
      edit: true,
      badge: badge
    });
    console.log(badge);
  };

  closeAddUser = () => {
    this.setState({
      user: false,
    });
  };

  render() {
    return (
      <div>
        <Filter
          className="filter-user"
          buttonName={"+ User"}
          role={true}
          onClick={() => this.showAddUser()}
        ></Filter>
        {this.state.user === true && (
          <AddUser
            user={this.props.user}
            showForm={this.state.user}
            closeForm={this.closeAddUser}
          />
        )}
        {this.state.edit === true && (
          <EditUser
            user={this.props.user}
            showForm={this.state.edit}
            closeForm={this.closeAddUser}
            badge={this.state.badge}
          />
        )}
        <Table responsive="sm" bordered={true}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Badge</th>
              <th>Username</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Escalation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {this.state.usersData.map((user, index) => (
              <tr key={index}>
                <td>{user.role_id}</td>
                <td>{user.Badge}</td>
                <td>{user.Username}</td>
                <td>{user.First_Name}</td>
                <td>{user.Last_Name}</td>
                <td>{user.Role}</td>
                <td>{user.status}</td>
                <td>{user.escalation_name}</td>
                <td>
                  <img
                    src={EditIcon}
                    alt={`edit-icon`}
                    className="icon"
                    onClick={() => this.showEditUser(user.Badge)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  }
}

export const mapDispatch = (dispatch) => {
  return {
    actions: bindActionCreators(UserActions, dispatch),
  };
};

export default connect(null, mapDispatch)(UserTable);
