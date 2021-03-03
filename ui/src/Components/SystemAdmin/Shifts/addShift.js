import React, { Component } from "react";
import { Modal, Button } from "react-bootstrap";

export class AddShift extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
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
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
              <label>
                End Time:
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
