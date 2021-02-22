import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as UserActions from "../../redux/actions/userActions";
import Table from "react-bootstrap/Table";
import Filter from "../CustomComponents/filter";
import AddUser from "./User/addUser";

class UserTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      usersData: [],
      show: false,
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
      show: true,
    });
  };

  renderUsersTable(user,index) {
    return (
      <tr key={index}>
        <td>{user.role_id}</td>
        <td>{user.Badge}</td>
        <td>{user.Username}</td>
        <td>{user.First_Name}</td>
        <td>{user.Last_Name}</td>
        <td>{user.Role}</td>
        <td>{user.status}</td>
      </tr>
    )
  }

  render() {
    return (
      <div>
        <Filter
          className="filter-user"
          buttonName={"+ User"}
          role={true}
          onClick={() => this.showAddUser()}
        ></Filter>
        <AddUser show={this.state.show} />
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
            </tr>
          </thead>
          <tbody>
           {this.state.usersData.map(this.renderUsersTable)}
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
