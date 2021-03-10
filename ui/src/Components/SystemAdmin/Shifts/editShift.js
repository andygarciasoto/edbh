import Axios from "axios";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as ShiftActions from "../../../redux/actions/shiftsActions";
import { API } from "../../../Utils/Constants";
import { Modal, Button } from "react-bootstrap";
import "../../../sass/SystemAdmin.scss";

class EditShift extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shift_name: "",
      shift_description: "",
      shift_sequence: 0,
      start_time: "",
      start_day: 0,
      end_time: "",
      end_day: 0,
      is_first_shift_of_day:true,
      status: "",
    };
  }

  componentDidMount() {
    const { actions } = this.props;

    return actions
      .getShiftInfo(this.props.user.site, this.props.shift_id)
      .then((response) => {
        this.setState({
          shift_name: response[0].shift_name,
          shift_description: response[0].shift_description,
          shift_sequence: response[0].shift_sequence,
          start_time: response[0].start_time,
          start_day: response[0].start_time_offset_days,
          end_time: response[0].end_time,
          end_day: response[0].end_time_offset_days,
          is_first_shift_of_day: response[0].is_first_shift_of_day,
          status: response[0].status
        });
      });
  }

  //   renderRoles(roles, index) {
  //     return (
  //       <option value={roles.role_id} key={index}>
  //         {roles.name}
  //       </option>
  //     );
  //   }

  //   renderEscalation(escalation, index) {
  //     return (
  //       <option value={escalation.escalation_id} key={index}>
  //         {escalation.escalation_name}
  //       </option>
  //     );
  //   }

  //   handleChange = (event) => {
  //     const target = event.target;
  //     const value = target.value;
  //     const name = target.name;

  //     this.setState({
  //       [name]: value,
  //     });
  //   };

  //   handleChangeRole = (event) => {
  //     this.setState({ role_id: event.target.value });
  //   };

  //   handleChangeStatus = (event) => {
  //     this.setState({ status: event.target.value });
  //   };

  //   handleChangeEscalation = (event) => {
  //     this.setState({ escalation_id: event.target.value });
  //   };

  //   createUser = (e) => {
  //     e.preventDefault();
  //     const {
  //       username,
  //       firstname,
  //       lastname,
  //       role_id,
  //       status,
  //       escalation_id,
  //     } = this.state;

  //     var url = `${API}/insert_user`;

  //     Axios.put(url, {
  //       badge: this.props.badge,
  //       username: username,
  //       first_name: firstname,
  //       last_name: lastname,
  //       role_id: role_id,
  //       site_id: this.props.user.site,
  //       escalation_id: parseInt(escalation_id, 10),
  //       status: status,
  //     }).then(
  //       () => {
  //         this.setState({
  //           show: true,
  //         });
  //       },
  //       (error) => {
  //         console.log(error);
  //       }
  //     );
  //   };

  handleClose = () => {
    this.props.closeForm();
  };

  render() {
    console.log(this.state);
    const { ShiftData } = this.state;

    return (
      <div>
        <Modal show={this.props.showForm} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Shift</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>Hao</div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="Primary" onClick={(e) => this.createUser(e)}>
              Confirm
            </Button>
            <Button variant="secondary" onClick={this.handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Sucess</Modal.Title>
          </Modal.Header>
          <Modal.Body>User has been updated</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export const mapDispatch = (dispatch) => {
  return {
    actions: bindActionCreators(ShiftActions, dispatch),
  };
};

export default connect(null, mapDispatch)(EditShift);
