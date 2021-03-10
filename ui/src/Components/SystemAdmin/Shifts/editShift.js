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
      badge: "",
      username: "",
      firstname: "",
      lastname: "",
      role: "",
      role_id: 0,
      status: "",
      show: false,
      showForm: true,
      rolesArray: [],
      escalation_id: 0,
      escalationArray: [],
    };
  }

  componentDidMount() {
    const { actions } = this.props;

    return actions
      .getShiftInfo(this.props.user.site, this.props.shift_id)
      .then((response) => {
          console.log(response);
        this.setState({
          ShiftData: response,
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
    const {
      badge,
      username,
      firstname,
      lastname,
      role,
      status,
      escalation_id,
    } = this.state;

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
