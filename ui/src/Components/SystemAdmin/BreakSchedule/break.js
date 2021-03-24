import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as ShiftActions from "../../../redux/actions/shiftsActions";
import Table from "react-bootstrap/Table";
import Filter from "../../CustomComponents/filter";
import AddBreak from "./addBreak";

class Break extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ShiftData: [],
      addBreak: false,
      editBreak: false,
      shift_id: 0,
    };
  }

  //   componentDidMount() {
  //     const { actions } = this.props;

  //     return actions.getShifts(this.props.user.site).then((response) => {
  //       this.setState({
  //         ShiftData: response,
  //       });
  //     });
  //   }

    showAddBreak = () => {
      this.setState({
        addBreak: true,
      });
    };

    closeAddBreak = () => {
      this.setState({
          addBreak: false,
      });
    };

  //   showEditShift = (shift_id) => {
  //     this.setState({
  //       editShift: true,
  //       shift_id: shift_id
  //     });
  //   };

  //   closeEditShift = () => {
  //     this.setState({
  //         editShift: false,
  //     });
  //   };

  render() {
    return (
      <div>
        <Filter
         className="filter-user"
         buttonName={"+ Break"}
         buttonFilter={"Search"}
         role={false}
         newClass={false}
         level={false}
         automatedLevel={false}
         category={false}
         type={false}
         shifts={true}
         onClick={() => this.showAddBreak()}
        ></Filter>
        {this.state.addBreak === true && (
          <AddBreak
            user={this.props.user}
            showForm={this.state.addBreak}
            closeForm={this.closeAddBreak}
          />
        )}
        {/* {this.state.editShift === true && (
          <EditShift
            user={this.props.user}
            showForm={this.state.editShift}
            closeForm={this.closeEditShift}
            shift_id={this.state.shift_id}
          />
        )} */}
        <Table responsive="sm" bordered={true}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Start Time</th>
              <th>Start Day</th>
              <th>End Time</th>
              <th>End Day</th>
              <th>Duration (minutes)</th>
              <th>Asset Count</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* {this.state.ShiftData.map((shift, index) => (
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
                    onClick={() => this.showEditShift(shift.shift_id)}
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

export const mapDispatch = (dispatch) => {
  return {
    actions: bindActionCreators(ShiftActions, dispatch),
  };
};

export default connect(null, mapDispatch)(Break);
