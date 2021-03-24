import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as ShiftActions from "../../../redux/actions/shiftsActions";
import Table from "react-bootstrap/Table";
import Filter from "../../CustomComponents/filter";
import AddAsset from "./addAsset";

class Assets extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ShiftData: [],
      addAsset: false,
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

  

    showAddAsset = () => {
      this.setState({
        addAsset: true,
      });
    };

    closeAddAsset = () => {
      this.setState({
        addAsset: false,
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
          buttonName={"+ Asset"}
          buttonFilter={"Search"}
          role={false}
          newClass={true}
          level={true}
          automatedLevel={true}
          onClick={() => this.showAddAsset()}
        ></Filter>
        {this.state.addAsset === true && (
          <AddAsset
            user={this.props.user}
            showForm={this.state.addAsset}
            closeForm={this.closeAddAsset}
          />
        )}
        <Table responsive="sm" bordered={true}>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Description</th>
              <th>Level</th>
              <th>Parent Code</th>
              <th>Automation Level</th>
              <th>Target Percent of Ideal</th>
              <th>Include in Escalation</th>
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

export default connect(null, mapDispatch)(Assets);
