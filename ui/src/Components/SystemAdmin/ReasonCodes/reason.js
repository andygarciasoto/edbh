import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as ReasonActions from "../../../redux/actions/reasonActions";
import Table from "react-bootstrap/Table";
import Filter from "../../CustomComponents/filter";
import AddReason from "./addReason";
import EditIcon from "../../../resources/u668.svg";

class Reason extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ReasonData: [],
      addReason: false,
      editReason: false,
      shift_id: 0,
    };
  }

  componentDidMount() {
    const { actions } = this.props;

    return actions.getReasonsBySite(this.props.user.site).then((response) => {
      this.setState({
        ReasonData: response,
      });
    });
  }

  showAddReason = () => {
    this.setState({
      addReason: true,
    });
  };

  closeAddReason = () => {
    this.setState({
      addReason: false,
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
    const t = this.props.t;
    return (
      <div>
        <Filter
          className="filter-user"
          buttonName={"+ Reason"}
          role={false}
          newClass={false}
          level={false}
          automatedLevel={false}
          category={true}
          type={true}
          onClick={() => this.showAddReason()}
          t={t}
        ></Filter>
        {this.state.addReason === true && (
          <AddReason
            user={this.props.user}
            showForm={this.state.addReason}
            closeForm={this.closeAddReason}
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
              <th>Code</th>
              <th>Name</th>
              <th>Category</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {this.state.ReasonData.map((reason, index) => (
              <tr key={index}>
                <td>{reason.dtreason_code}</td>
                <td>{reason.dtreason_name}</td>
                <td>{reason.dtreason_category}</td>
                <td>{reason.type}</td>
                <td>{reason.status}</td>

                <td>
                  <img
                    src={EditIcon}
                    alt={`edit-icon`}
                    className="icon"
                    onClick={() => this.showEditShift(reason.dtreason_id)}
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
    actions: bindActionCreators(ReasonActions, dispatch),
  };
};

export default connect(null, mapDispatch)(Reason);

