import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as ShiftActions from "../../../redux/actions/shiftsActions";
import Table from "react-bootstrap/Table";
import Filter from "../../CustomComponents/filter";
import AddShift from "./addShift";
import moment from 'moment';

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
              <th>Name</th>
              <th>Description</th>
              <th>Sequence</th>
              <th>Start Time</th>
              <th>Start Day</th>
              <th>End Time</th>
              <th>End Day</th>
              <th>Duration (minutes)</th>
              <th>Is First Shift ?</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
          {this.state.ShiftData.map((shift, index) => (
              <tr key={index}>
                <td>{shift.shift_name}</td>
                <td>{shift.shift_description}</td>
                <td>{shift.shift_sequence}</td>
                <td>{moment(shift.start_time).format("HH:mm A")}</td>
                <td>{shift.start_time_offset_days === -1 ? "Yesterday" : shift.start_time_offset_days === 0 ? "Today" : "Tomorrow"}</td>
                <td>{moment(shift.end_time).format("HH:mm A")}</td>
                <td>{shift.end_time_offset_days === -1 ? "Yesterday" : shift.end_time_offset_days === 0 ? "Today" : "Tomorrow"}</td>
                <td>{shift.duration_in_minutes}</td>
                <td>{shift.is_first_shift_of_day === true ? "Yes" : "No"}</td>
                <td>{shift.status}</td>
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

