import React, { Component } from "react";
import { Modal, Button } from "react-bootstrap";

export class AddShift extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleClose = () => {
    this.props.closeForm();
  };

  render() {
    return (
      <div>
        <Modal show={this.props.showForm} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Add Shift</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <label>
                Code:
                <input
                  className="input-badge"
                  type="text"
                  name="badge"
                  // value={this.state.badge}
                  autoComplete={"false"}
                  onChange={this.handleChange}
                />
              </label>
              <label>
                Name:
                <input
                  type="text"
                  name="username"
                  className="input-username"
                  // value={this.state.username}
                  autoComplete={"false"}
                  onChange={this.handleChange}
                />
              </label>
              <label>
                Description:
                <textarea></textarea>
                {/* <input
                  type="text"
                  name="firstname"
                  className="input-firstname"
                  //value={this.state.firstname}
                  autoComplete={"false"}
                  onChange={this.handleChange}
                /> */}
              </label>
              <label>
                Sequence:
                <input
                  type="text"
                  name="lastname"
                  className="input-lastname"
                  //value={this.state.lastname}
                  autoComplete={"false"}
                  onChange={this.handleChange}
                />
              </label>
              <label>
                Start Time:
                <select
                  className="input-status"
                  onChange={this.handleChangeStatus}
                >
                  <option value="Active">1:00</option>
                  <option value="Active">2:00</option>
                  <option value="Active">3:00</option>
                  <option value="Active">4:00</option>
                  <option value="Active">5:00</option>
                  <option value="Active">6:00</option>
                  <option value="Active">7:00</option>
                  <option value="Active">8:00</option>
                  <option value="Active">9:00</option>
                  <option value="Active">10:00</option>
                  <option value="Active">11:00</option>
                  <option value="Active">12:00</option>
                  <option value="Active">13:00</option>
                  <option value="Active">14:00</option>
                  <option value="Active">15:00</option>
                  <option value="Active">16:00</option>
                  <option value="Active">17:00</option>
                  <option value="Active">18:00</option>
                  <option value="Active">19:00</option>
                  <option value="Active">20:00</option>
                  <option value="Active">21:00</option>
                  <option value="Active">22:00</option>
                  <option value="Active">23:00</option>
                  <option value="Active">24:00</option>
                </select>
              </label>
              <label>
                Start Time Offset:
                <select
                  className="input-status"
                  onChange={this.handleChangeStatus}
                >
                  <option value="-1">Yesterday</option>
                  <option value="0">Today</option>
                  <option value="1">Tomorrow</option>
                </select>
              </label>
              <label>
                End Time:
                <select
                  className="input-status"
                  onChange={this.handleChangeStatus}
                >
                  <option value="Active">1:00</option>
                  <option value="Active">2:00</option>
                  <option value="Active">3:00</option>
                  <option value="Active">4:00</option>
                  <option value="Active">5:00</option>
                  <option value="Active">6:00</option>
                  <option value="Active">7:00</option>
                  <option value="Active">8:00</option>
                  <option value="Active">9:00</option>
                  <option value="Active">10:00</option>
                  <option value="Active">11:00</option>
                  <option value="Active">12:00</option>
                  <option value="Active">13:00</option>
                  <option value="Active">14:00</option>
                  <option value="Active">15:00</option>
                  <option value="Active">16:00</option>
                  <option value="Active">17:00</option>
                  <option value="Active">18:00</option>
                  <option value="Active">19:00</option>
                  <option value="Active">20:00</option>
                  <option value="Active">21:00</option>
                  <option value="Active">22:00</option>
                  <option value="Active">23:00</option>
                  <option value="Active">24:00</option>
                </select>
              </label>
              <label>
                End Time Offset:
                <select
                  className="input-status"
                  onChange={this.handleChangeStatus}
                >
                  <option value="-1">Yesterday</option>
                  <option value="0">Today</option>
                  <option value="1">Tomorrow</option>
                </select>
              </label>
              <label>
                Duration:
                <input
                  type="text"
                  name="lastname"
                  className="input-lastname"
                  //value={this.state.lastname}
                  autoComplete={"false"}
                  onChange={this.handleChange}
                />
              </label>
              <label>
                Valid From:
                <input
                  type="text"
                  name="lastname"
                  className="input-lastname"
                  //value={this.state.lastname}
                  autoComplete={"false"}
                  onChange={this.handleChange}
                />
              </label>
              <label>
                Valid To:
                <input
                  type="text"
                  name="lastname"
                  className="input-lastname"
                  //value={this.state.lastname}
                  autoComplete={"false"}
                  onChange={this.handleChange}
                />
              </label>
              <label>
                Team Code:
                <input
                  type="text"
                  name="lastname"
                  className="input-lastname"
                  //value={this.state.lastname}
                  autoComplete={"false"}
                  onChange={this.handleChange}
                />
              </label>
              <label>
                First Shift:
                <input
                  type="text"
                  name="lastname"
                  className="input-lastname"
                  //value={this.state.lastname}
                  autoComplete={"false"}
                  onChange={this.handleChange}
                />
              </label>

              {/* <label>
                Escalation:
                <select
                  className="input-escalation"
                  onChange={this.handleChangeEscalation}
                >
                  {this.state.escalation.map(this.renderEscalation)}
                </select>
              </label>
              <label>
                Role:
                <select className="input-role" onChange={this.handleChangeRole}>
                  {this.state.roles.map(this.renderRoles)}
                </select>
              </label>
              <label>
                Status:
                <select
                  className="input-status"
                  onChange={this.handleChangeStatus}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label> */}
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
        {/* <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Sucess</Modal.Title>
          </Modal.Header>
          <Modal.Body>User has been added</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal> */}
      </div>
    );
  }
}

export default AddShift;
