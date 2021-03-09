import React, { Component } from "react";
import Axios from "axios";
import { Modal, Button } from "react-bootstrap";
import { API } from "../../../Utils/Constants";
import Moment from "moment";

export class AddShift extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      description: "",
      sequence: 0,
      start_time: "1:00",
      start_day: -1,
      end_time: "1:00",
      end_day: -1,
      duration: 0,
      first_shift: true,
      status: "Active",
      show: false,
    };
  }

  handleChange = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value,
    });
  };

  handleClose = () => {
    this.props.closeForm();
  };

  createShift = (e) => {
    e.preventDefault();
    const {
      name,
      description,
      sequence,
      start_time,
      start_day,
      end_time,
      end_day,
      duration,
      first_shift,
      status,
    } = this.state;

    var url = `${API}/insert_shift`;
    const date=Moment().format("YYYY-MM-DD");

    Axios.put(url, {
      shift_code: `${this.props.user.site_prefix} - ${name}`,
      shift_name: name,
      shift_description: description,
      shift_sequence: parseInt(sequence, 10),
      start_time: `${date}T${start_time}`,
      start_time_offset_days: parseInt(start_day, 10),
      end_time: `${date}T${end_time}`,
      end_time_offset_days: parseInt(end_day, 10),
      duration_in_minutes: 480,
      valid_from: Moment(),
      valid_to: null,
      is_first_shift_of_day: first_shift,
      status: status,
      site_id: this.props.user.site,
    }).then(
      () => {
        this.setState({
          show: true,
        });
      },
      (error) => {
        console.log(error);
      }
    );
  };

  render() {
    console.log(Moment().format("YYYY-MM-DD"));
    return (
      <div>
        <Modal show={this.props.showForm} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Add Shift</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <label>
                Name:
                <input
                  type="text"
                  name="name"
                  className="input-name"
                  // value={this.state.username}
                  autoComplete={"false"}
                  onChange={this.handleChange}
                />
              </label>
              <label>
                Description:
                <textarea
                  className="text-description"
                  name="description"
                  onChange={this.handleChange}
                ></textarea>
              </label>
              <label>
                Sequence:
                <input
                  type="text"
                  name="sequence"
                  className="input-sequence"
                  //value={this.state.lastname}
                  autoComplete={"false"}
                  onChange={this.handleChange}
                />
              </label>
              <label>
                Start Time:
                <select
                  className="input-start"
                  name="start_time"
                  onChange={this.handleChange}
                >
                  <option value="1:00:00.000Z">1:00</option>
                  <option value="2:00:00.000Z">2:00</option>
                  <option value="3:00:00.000Z">3:00</option>
                  <option value="4:00:00.000Z">4:00</option>
                  <option value="5:00:00.000Z">5:00</option>
                  <option value="6:00:00.000Z">6:00</option>
                  <option value="7:00:00.000Z">7:00</option>
                  <option value="8:00:00.000Z">8:00</option>
                  <option value="9:00:00.000Z">9:00</option>
                  <option value="10:00:00.000Z">10:00</option>
                  <option value="11:00:00.000Z">11:00</option>
                  <option value="12:00:00.000Z">12:00</option>
                  <option value="13:00:00.000Z">13:00</option>
                  <option value="14:00:00.000Z">14:00</option>
                  <option value="15:00:00.000Z">15:00</option>
                  <option value="16:00:00.000Z">16:00</option>
                  <option value="17:00:00.000Z">17:00</option>
                  <option value="18:00:00.000Z">18:00</option>
                  <option value="19:00:00.000Z">19:00</option>
                  <option value="20:00:00.000Z">20:00</option>
                  <option value="21:00:00.000Z">21:00</option>
                  <option value="22:00:00.000Z">22:00</option>
                  <option value="23:00:00.000Z">23:00</option>
                  <option value="00:00:00.000Z">00:00</option>
                </select>
              </label>
              <label className="label-startoff">
                Start Day:
                <select
                  name="start_day"
                  className="input-startoff"
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
                 <option value="1:00:00.000Z">1:00</option>
                  <option value="2:00:00.000Z">2:00</option>
                  <option value="3:00:00.000Z">3:00</option>
                  <option value="4:00:00.000Z">4:00</option>
                  <option value="5:00:00.000Z">5:00</option>
                  <option value="6:00:00.000Z">6:00</option>
                  <option value="7:00:00.000Z">7:00</option>
                  <option value="8:00:00.000Z">8:00</option>
                  <option value="9:00:00.000Z">9:00</option>
                  <option value="10:00:00.000Z">10:00</option>
                  <option value="11:00:00.000Z">11:00</option>
                  <option value="12:00:00.000Z">12:00</option>
                  <option value="13:00:00.000Z">13:00</option>
                  <option value="14:00:00.000Z">14:00</option>
                  <option value="15:00:00.000Z">15:00</option>
                  <option value="16:00:00.000Z">16:00</option>
                  <option value="17:00:00.000Z">17:00</option>
                  <option value="18:00:00.000Z">18:00</option>
                  <option value="19:00:00.000Z">19:00</option>
                  <option value="20:00:00.000Z">20:00</option>
                  <option value="21:00:00.000Z">21:00</option>
                  <option value="22:00:00.000Z">22:00</option>
                  <option value="23:00:00.000Z">23:00</option>
                  <option value="00:00:00.000Z">00:00</option>
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
              <label>
                Duration:
                <input
                  type="text"
                  name="duration"
                  className="input-duration"
                  //value={this.state.lastname}
                  autoComplete={"false"}
                  onChange={this.handleChange}
                />
              </label>
              <label>
                Is First Shift?:
                <select
                  name="first_shift"
                  className="input-fShift"
                  onChange={this.handleChange}
                >
                  <option value={true}>Yes</option>
                  <option value={false}>No</option>
                </select>
              </label>
              <label>
                Status:
                <select
                  name="status"
                  className="input-status shift"
                  onChange={this.handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="Primary" onClick={(e) => this.createShift(e)}>
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
          <Modal.Body>Shift has been added</Modal.Body>
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

export default AddShift;
