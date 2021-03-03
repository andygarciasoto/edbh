import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Table from "react-bootstrap/Table";
import Filter from "../../CustomComponents/filter";
import AddShift from "./addShift";

class Shifts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      usersData: [],
      addShift: false,
      editShift: false,
      badge: "",
    };
  }

  showAddShift = () => {
    this.setState({
      addShift: true,
    });
  };

  closeAddShift = () => {
    this.setState({
        addShift: false,
    });
  };

  render() {
    return (
      <div>
        <Filter
          className="filter-user"
          buttonName={"+ Shift"}
          buttonFilter={"Search"}
          role={false}
          onClick={() => this.showAddShift()}
        ></Filter>
        {this.state.addShift === true && (
          <AddShift
            user={this.props.user}
            showForm={this.state.addShift}
            closeForm={this.closeAddShift}
          />
        )}
        <Table responsive="sm" bordered={true}>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Description</th>
              <th>Sequence</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Duration (minutes)</th>
              <th>Valid From</th>
              <th>Valid To</th>
              <th>First Shift</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* {this.state.usersData.map((user, index) => (
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
            ))} */}
          </tbody>
        </Table>
      </div>
    );
  }
}

export default Shifts;
