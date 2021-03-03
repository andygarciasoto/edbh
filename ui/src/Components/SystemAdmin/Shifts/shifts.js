import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as ShiftActions from "../../../redux/actions/shiftsActions";
import Table from "react-bootstrap/Table";
import Filter from "../../CustomComponents/filter";
import AddShift from "./addShift";

import EditIcon from "../../../resources/u668.svg";


class Shifts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ShiftData: [],
      addShift: false,
      editShift: false,
      badge: "",
    };
  }

  componentDidMount() {
    const { actions } = this.props;

    return actions.getShifts(this.props.user.site).then((response) => {
      this.setState({
        ShiftData: response,
      });
    });
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
    console.log(this.state);
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
          {this.state.ShiftData.map((shift, index) => (
              <tr key={index}>
                <td>{shift.shift_code}</td>
                <td>{shift.shift_name}</td>
                <td>{"DESC"}</td>
                <td>{shift.shift_sequence}</td>
                <td>{shift.start_time}</td>
                <td>{shift.end_time}</td>
                <td>{shift.duration_in_minutes}</td>
                <td>{shift.valid_from}</td>
                <td>{shift.valid_to}</td>
                <td>{shift.is_first_shift_of_day}</td>
                <td>{shift.shift_id}</td>
                <td>
                  <img
                    src={EditIcon}
                    alt={`edit-icon`}
                    className="icon"
                    //onClick={() => this.showEditUser(shift.Badge)}
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
    actions: bindActionCreators(ShiftActions, dispatch),
  };
};

export default connect(null, mapDispatch)(Shifts);

