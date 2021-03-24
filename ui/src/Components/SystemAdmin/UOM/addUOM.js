//import Axios from "axios";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as UserActions from "../../../redux/actions/userActions";
//import { API } from "../../../Utils/Constants";
import { Modal, Button } from "react-bootstrap";
import "../../../sass/SystemAdmin.scss";

class AddUOM extends Component {
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
        <Modal show={this.props.showForm} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Add UOM</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <label>
                Code:
                <input
                  className="input-uom-code"
                  type="text"
                  name="code"
                  value={this.state.badge}
                  autoComplete={"false"}
                  onChange={this.handleChange}
                />
              </label>
              <label>
                Name:
                <input
                  type="text"
                  name="name"
                  className="input-uom-name"
                  value={this.state.username}
                  autoComplete={"false"}
                  onChange={this.handleChange}
                />
              </label>
              <label>
                Description:
                <textarea
                  className="text-uom-description"
                  name="description"
                  onChange={this.handleChange}
                ></textarea>
              </label>
              <label>
                Decimals:
                <select
                  className="select-uom-decimals"
                  name="decimals"
                  onChange={this.handleChange}
                >
                  <option value="1:00">No</option>
                  <option value="2:00">Yes</option>
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
          <Modal.Body>UOM has been added</Modal.Body>
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

export default connect(null, mapDispatch)(AddUOM);
