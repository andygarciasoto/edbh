import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as ShiftActions from "../../../redux/actions/shiftsActions";
import Table from "react-bootstrap/Table";
import Filter from "../../CustomComponents/filter";



class Device extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ShiftData: [],
      addShift: false,
      editShift: false,
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

//   showAddShift = () => {
//     this.setState({
//       addShift: true,
//     });
//   };

//   closeAddShift = () => {
//     this.setState({
//         addShift: false,
//     });
//   };

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
          buttonName={"+ Shift"}
          buttonFilter={"Search"}
          role={false}
          onClick={() => this.showAddShift()}
        ></Filter>
        {/* {this.state.addShift === true && (
          <AddShift
            user={this.props.user}
            showForm={this.state.addShift}
            closeForm={this.closeAddShift}
          />
        )}
        {this.state.editShift === true && (
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
              <th>Code</th>
              <th>Name</th>
              <th>Description</th>
              <th>Tag Group</th>
              <th>Data Type</th>
              <th>Tag Type</th>
              <th>UOM code</th>
              <th>Rollover Point</th>
              <th>Aggregation</th>
              <th>Max Change</th>
              <th>Asset</th>
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

export default connect(null, mapDispatch)(Device);

