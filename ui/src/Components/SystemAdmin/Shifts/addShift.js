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
      first_shift,
      status,
    } = this.state;

    var url = `${API}/insert_shift`;
    const date = Moment().format("YYYY-MM-DD");

    var startTime1 = new Date(`${date} ${start_time}`);
    var endTime1 = new Date(`${date} ${end_time}`);
    var difference = endTime1.getTime() - startTime1.getTime(); // This will give difference in milliseconds
    var resultInMinutes = Math.round(difference / 60000);

    Axios.put(url, {
      shift_code: `${this.props.user.site_prefix} - ${name}`,
      shift_name: name,
      shift_description: description,
      shift_sequence: parseInt(sequence, 10),
      start_time: `${date}T${start_time}:00.000Z`,
      start_time_offset_days: parseInt(start_day, 10),
      end_time: `${date}T${end_time}:00.000Z`,
      end_time_offset_days: parseInt(end_day, 10),
      duration_in_minutes: resultInMinutes,
      valid_from: Moment(),
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
