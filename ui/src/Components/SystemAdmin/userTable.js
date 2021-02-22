import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as UserActions from "../../redux/actions/userActions";
import Table from "react-bootstrap/Table";
import Filter from "../CustomComponents/filter";

class UserTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      usersData: {},
    };
  }

  componentDidMount() {
    const { actions } = this.props;

    return actions.getAllUsers(this.props.user.site, null,null).then((response) => {
      this.setState({
        usersData: response,
      });
    });
  }

  render() {
    return (
      <div>
        <Filter
          className="filter-user"
          buttonName={"+ User"}
          role={true}
        ></Filter>
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
            <tr>
              <td>1</td>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
            </tr>
            <tr>
              <td>3</td>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
            </tr>
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
