/* eslint-disable array-callback-return */
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as ShiftActions from "../../../redux/actions/shiftsActions";
import Axios from "axios";
import { Modal, Button, Form, Col, Row } from "react-bootstrap";
import { API } from "../../../Utils/Constants";
import { validateShiftsForm } from '../../../Utils/FormValidations';
import moment from "moment";
import _ from 'lodash';

export class AddShift extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shift_name: "",
      shift_description: "",
      shift_sequence: 1,
      start_time: "1:00",
      start_day: -1,
      end_time: "1:00",
      end_day: -1,
      duration: 0,
      is_first_shift_of_day: true,
      status: "Active",
      show: false,
      showForm: true,
      modalError: false,
      isRepeated: false,
      shiftsArray: [],
      shiftsOject: {},
      firstRepeated: false,
      validation: {}
    };
  }

  componentDidMount() {
    const { actions } = this.props;
    return actions.getShifts(this.props.user.site).then((response) => {
      this.setState({
        shiftsArray: response,
        shiftsOject: response
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

  handleClose = () => {
    this.setState({ showForm: false });
  };

  closeModalError = () => {
    this.setState({ modalError: false });
  };

  closeSuccessModal = () => {
    this.setState({ show: false });
  };

  createShift = (e) => {
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

    let url = `${API}/insert_shift`;
    const date = moment().tz(this.props.user.timezone).format("YYYY-MM-DD") + ' 00:00';

    let startTime1 = moment(moment(date).add(start_day, 'days').format('YYYY-MM-DD') + ' ' + start_time);
    let endTime1 = moment(moment(date).add(end_day, 'days').format('YYYY-MM-DD') + ' ' + end_time);
    let difference = endTime1.diff(startTime1, 'minutes');

    const validation = validateShiftsForm(this.state);
    if (
      _.isEmpty(validation)
    ) {
      Axios.put(url, {
        shift_code: `${this.props.user.site_prefix}-${shift_name}`.replace(/\s+/g, ''),
        shift_name: shift_name,
        shift_description: shift_description,
        shift_sequence: parseInt(shift_sequence, 10),
        start_time: start_time,
        start_time_offset_days: parseInt(start_day, 10),
        end_time: end_time,
        end_time_offset_days: parseInt(end_day, 10),
        duration_in_minutes: difference,
        valid_from: moment().tz(this.props.user.timezone),
        is_first_shift_of_day: is_first_shift_of_day,
        status: status,
        site_id: this.props.user.site,
      }).then(
        () => {
          this.props.Refresh();
          this.setState({
            show: true,
            validation: {}
          });
          this.handleClose();
        },
        (error) => {
          this.setState({
            modalError: true,
          });
        }
      );
    } else {
      this.setState({ validation });
    }
  };

  handleChangeActive = (e) => {
    this.setState({
      is_first_shift_of_day: e.target.value === 'true' ? true : false,
    });
  }

  handleHour = (e) => {
    this.setState({
      [e.target.name]: moment('1970-01-01 ' + e.target.value).format('HH:') + '00'
    })
  }

  render() {
    const validation = this.state.validation;
    const t = this.props.t;
    return (
      <div>
        <Modal show={this.state.showForm} onHide={this.handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>{t('Add Shift')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group as={Row}>
                <Form.Label column sm={2}>{t('Name')}:</Form.Label>
                <Col sm={10}>
                  <Form.Control
                    type="text"
                    name="shift_name"
                    value={this.state.shift_name}
                    autoComplete={"false"}
                    onChange={this.handleChange}
                  />
                  <Form.Text className='validation'>{validation.shift_name}</Form.Text>
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={2}>{t('Description')}:</Form.Label>
                <Col sm={10}>
                  <Form.Control
                    as="textarea"
                    name="shift_description"
                    value={this.state.shift_description}
                    onChange={this.handleChange}
                    rows={3} />
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={2}>{t('Sequence')}:</Form.Label>
                <Col sm={10}>
                  <Form.Control
                    type="number"
                    name="shift_sequence"
                    value={this.state.shift_sequence}
                    autoComplete={"false"}
                    onChange={this.handleChange}
                    min={1}
                  />
                  <Form.Text className='validation'>{validation.shift_sequence}</Form.Text>
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={2}>{t('Start Time')}:</Form.Label>
                <Col sm={4}>
                  <Form.Control
                    type='time'
                    name="start_time"
                    onChange={this.handleHour}
                    value={this.state.start_time}
                  />
                  <Form.Text className='validation'>{validation.start_time}</Form.Text>
                </Col>
                <Form.Label column sm={2}>{t('Start Day')}:</Form.Label>
                <Col sm={4}>
                  <Form.Control
                    as='select'
                    name='start_day'
                    onChange={this.handleChange}
                    value={this.state.start_day}
                  >
                    <option value={-1}>Yesterday</option>
                    <option value={0}>Today</option>
                    <option value={1}>Tomorrow</option>
                  </Form.Control>
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={2}>{t('End Time')}:</Form.Label>
                <Col sm={4}>
                  <Form.Control
                    type='time'
                    name="end_time"
                    onChange={this.handleHour}
                    value={this.state.end_time}
                  />
                  <Form.Text className='validation'>{validation.end_time}</Form.Text>
                </Col>
                <Form.Label column sm={2}>{t('End Day')}:</Form.Label>
                <Col sm={4}>
                  <Form.Control
                    as='select'
                    name='end_day'
                    onChange={this.handleChange}
                    value={this.state.end_day}
                  >
                    <option value={-1}>Yesterday</option>
                    <option value={0}>Today</option>
                    <option value={1}>Tomorrow</option>
                  </Form.Control>
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={2}>{t('Is First Shift')}?:</Form.Label>
                <Col sm={4}>
                  <Form.Control
                    as="select"
                    name="is_first_shift_of_day"
                    onChange={this.handleChangeActive}
                    value={this.state.is_first_shift_of_day}
                  >
                    <option value={true}>Yes</option>
                    <option value={false}>No</option>
                  </Form.Control>
                  <Form.Text className='validation'>{validation.is_first_shift_of_day}</Form.Text>
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={2}>{t('Status')}:</Form.Label>
                <Col sm={4}>
                  <Form.Control
                    as="select"
                    name="status"
                    onChange={this.handleChange}
                    value={this.state.status}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </Form.Control>
                </Col>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="Primary" onClick={(e) => this.createShift(e)}>
              {t('Confirm')}
            </Button>
            <Button variant="secondary" onClick={this.handleClose}>
              {t('Close')}
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal show={this.state.show} onHide={this.closeSuccessModal}>
          <Modal.Header closeButton>
            <Modal.Title>Sucess</Modal.Title>
          </Modal.Header>
          <Modal.Body>Shift has been added</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.closeSuccessModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal show={this.state.modalError} onHide={this.closeModalError}>
          <Modal.Header closeButton>
            <Modal.Title>Error</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Shift has not been added
          </Modal.Body>
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

export default connect(null, mapDispatch)(AddShift);
