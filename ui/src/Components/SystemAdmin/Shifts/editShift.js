import Axios from "axios";
import React, { Component } from "react";
import { connect } from "react-redux";
import Moment from "moment";
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
      is_first_shift_of_day: true,
      status: "",
      show: false,
      modalError: false,
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
          status: response[0].status,
        });
      });
  }

  handleChange = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value,
    });
  };

  updateShift = (e) => {
    e.preventDefault();
    const {
      shift_name,
      shift_description,
      shift_sequence,
      start_time,
      start_day,
      end_time,
      end_day,
      is_first_shift_of_day,
      status,
    } = this.state;

    var url = `${API}/insert_shift`;
    const date = Moment().format("YYYY-MM-DD");

    var startTime1 = new Date(`${date} ${Moment(start_time).format("H:mm")}`);
    var endTime1 = new Date(`${date} ${Moment(end_time).format("H:mm")}`);
    var difference = endTime1.getTime() - startTime1.getTime(); // This will give difference in milliseconds
    var resultInMinutes = Math.round(difference / 60000);

    if (
      shift_name !== "" &&
      shift_description !== "" &&
      shift_sequence === 0 
    ) {
      Axios.put(url, {
        shift_id: this.props.shift_id,
        shift_code: `${this.props.user.site_prefix} - ${shift_name}`,
        shift_name: shift_name,
        shift_description: shift_description,
        shift_sequence: parseInt(shift_sequence, 10),
        start_time: `${date}T${start_time}:00.000Z`,
        start_time_offset_days: parseInt(start_day, 10),
        end_time: `${date}T${end_time}:00.000Z`,
        end_time_offset_days: parseInt(end_day, 10),
        duration_in_minutes: resultInMinutes,
        valid_from: Moment(),
        is_first_shift_of_day: is_first_shift_of_day,
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
    } else {
      this.setState({
        modalError: true,
      });
    }
  };

  closeModalError = () => {
    this.setState({ modalError: false });
  };

  handleClose = () => {
    this.props.closeForm();
  };

  render() {
    const {
      shift_name,
      shift_description,
      shift_sequence,
      start_time,
      start_day,
      end_time,
      end_day,
      is_first_shift_of_day,
      status,
    } = this.state;

    return (
      <div>
        <Modal show={this.props.showForm} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Shift</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <label>
                Name:
                <input
                  type="text"
                  name="shift_name"
                  className="input-name"
                  value={shift_name}
                  autoComplete={"false"}
                  onChange={this.handleChange}
                />
              </label>
              <label>
                Description:
                <textarea
                  className="text-description"
                  name="shift_description"
                  onChange={this.handleChange}
                  value={shift_description}
                ></textarea>
              </label>
              <label>
                Sequence:
                <input
                  type="text"
                  name="shift_sequence"
                  className="input-sequence"
                  value={shift_sequence}
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
                  value={Moment(start_time).format("H:mm")}
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
                  value={start_day}
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
                  value={Moment(end_time).format("H:mm")}
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
                  value={end_day}
                >
                  <option value={-1}>Yesterday</option>
                  <option value={0}>Today</option>
                  <option value={1}>Tomorrow</option>
                </select>
              </label>
              <label>
                Is First Shift?:
                <select
                  name="is_first_shift_of_day"
                  className="input-fShift"
                  onChange={this.handleChange}
                  value={is_first_shift_of_day}
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
                  value={status}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="Primary" onClick={(e) => this.updateShift(e)}>
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
          <Modal.Body>Shift has been updated</Modal.Body>
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
    actions: bindActionCreators(ShiftActions, dispatch),
  };
};

export default connect(null, mapDispatch)(EditShift);
