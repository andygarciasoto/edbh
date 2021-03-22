//import Axios from "axios";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as UserActions from "../../../redux/actions/userActions";
//import { API } from "../../../Utils/Constants";
import { Modal, Button, Form, Col } from "react-bootstrap";
import "../../../sass/SystemAdmin.scss";

class AddBreak extends Component {
  constructor(props) {
    super(props);
    this.state = {
      badge: "",
      username: "",
      firstname: "",
      lastname: "",
      role: 1,
      status: "Active",
      escalation_id: 1,
      site: "",
      roles: [],
      show: false,
      showForm: true,
      escalation: [],
      sites: [],
      modalError: false,
    };
  }

  //   componentDidMount() {
  //     const { actions } = this.props;

  //     return Promise.all([
  //       actions.getRoles(),
  //       actions.getEscalation(),
  //       actions.getSites(),
  //     ]).then((response) => {
  //       this.setState({
  //         roles: response[0],
  //         escalation: response[1],
  //         sites: response[2],
  //       });
  //     });
  //   }

  handleChange = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value,
    });
  };

  //   createUser = (e) => {
  //     e.preventDefault();
  //     const {
  //       badge,
  //       username,
  //       firstname,
  //       lastname,
  //       role,
  //       status,
  //       escalation_id,
  //       site,
  //     } = this.state;

  //     var url = `${API}/insert_user`;
  //     if (
  //       badge !== "" &&
  //       username !== "" &&
  //       firstname !== "" &&
  //       lastname !== ""
  //     ) {
  //       Axios.put(url, {
  //         badge: badge,
  //         username: username,
  //         first_name: firstname,
  //         last_name: lastname,
  //         role_id: role,
  //         site_id: this.props.user.site,
  //         escalation_id: parseInt(escalation_id, 10),
  //         site: site,
  //         status: status,
  //       }).then(
  //         () => {
  //           this.setState({
  //             show: true,
  //           });
  //         },
  //         (error) => {
  //           console.log(error);
  //         }
  //       );
  //     } else {
  //       this.setState({
  //         modalError: true,
  //       });
  //     }
  //   };

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

  //   renderSites(sites, index) {
  //     return (
  //       <option value={sites.asset_id} key={index}>
  //         {sites.asset_name}
  //       </option>
  //     );
  //   }

  handleClose = () => {
    this.props.closeForm();
  };

  closeModalError = () => {
    this.setState({ modalError: false });
  };

  render() {
    return (
      <div>
        <Modal
          show={this.props.showForm}
          onHide={this.handleClose}
          contentClassName="modal-reason"
        >
          <Modal.Header closeButton>
            <Modal.Title>Add Break</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <label>
                Name:
                <input
                  type="text"
                  name="name"
                  className="input-name fix-name"
                  // value={this.state.username}
                  autoComplete={"false"}
                  onChange={this.handleChange}
                />
              </label>
              <label>
                Description:
                <textarea
                  className="text-description fix-description"
                  name="description"
                  onChange={this.handleChange}
                ></textarea>
              </label>
              <label>
                Start Time:
                <select
                  className="input-start"
                  name="start_time"
                  onChange={this.handleChange}
                >
                  <option value="1:00">1:00</option>
                  <option value="2:00">2:00</option>
                  <option value="3:00">3:00</option>
                  <option value="4:00">4:00</option>
                  <option value="5:00">5:00</option>
                  <option value="6:00">6:00</option>
                  <option value="7:00">7:00</option>
                  <option value="8:00">8:00</option>
                  <option value="9:00">9:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="12:00">12:00</option>
                  <option value="13:00">13:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                  <option value="17:00">17:00</option>
                  <option value="18:00">18:00</option>
                  <option value="19:00">19:00</option>
                  <option value="20:00">20:00</option>
                  <option value="21:00">21:00</option>
                  <option value="22:00">22:00</option>
                  <option value="23:00">23:00</option>
                  <option value="00:00">00:00</option>
                </select>
              </label>
              <label className="label-startoff">
                Start Day:
                <select
                  name="start_day"
                  className="input-startoff fix-start"
                  onChange={this.handleChange}
                >
                  <option value={-1}>Yesterday</option>
                  <option value={0}>Today</option>
                  <option value={1}>Tomorrow</option>
                </select>
              </label>
              <label>
                End Time:
                <select
                  className="input-end"
                  name="end_time"
                  onChange={this.handleChange}
                >
                  <option value="1:00">1:00</option>
                  <option value="2:00">2:00</option>
                  <option value="3:00">3:00</option>
                  <option value="4:00">4:00</option>
                  <option value="5:00">5:00</option>
                  <option value="6:00">6:00</option>
                  <option value="7:00">7:00</option>
                  <option value="8:00">8:00</option>
                  <option value="9:00">9:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="12:00">12:00</option>
                  <option value="13:00">13:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                  <option value="17:00">17:00</option>
                  <option value="18:00">18:00</option>
                  <option value="19:00">19:00</option>
                  <option value="20:00">20:00</option>
                  <option value="21:00">21:00</option>
                  <option value="22:00">22:00</option>
                  <option value="23:00">23:00</option>
                  <option value="00:00">00:00</option>
                </select>
              </label>
              <label className="label-endoff">
                End Day:
                <select
                  name="end_day"
                  className="input-endoff"
                  onChange={this.handleChange}
                >
                  <option value={-1}>Yesterday</option>
                  <option value={0}>Today</option>
                  <option value={1}>Tomorrow</option>
                </select>
              </label>
            </form>
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
          <Modal.Body>Tag has been added</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal show={this.state.modalError} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Warning</Modal.Title>
          </Modal.Header>
          <Modal.Body>All inputs must be filled</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.closeModalError}>
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
    actions: bindActionCreators(UserActions, dispatch),
  };
};

export default connect(null, mapDispatch)(AddBreak);
