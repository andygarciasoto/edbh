import Axios from "axios";
import React, { Component } from "react";
import { connect } from "react-redux";
import moment from "moment";
import { bindActionCreators } from "redux";
import * as ShiftActions from "../../../redux/actions/shiftsActions";
import { API } from "../../../Utils/Constants";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { validateShiftsForm } from '../../../Utils/FormValidations';
import "../../../sass/SystemAdmin.scss";
import _ from "lodash";

class ShiftModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shift: props.shift,
      shift_id: 0,
      shift_name: '',
      shift_description: '',
      shift_sequence: 0,
      start_time: '',
      start_day: 0,
      end_time: '',
      end_day: 0,
      is_first_shift_of_day: false,
      status: '',
      show: false,
      modalError: false,
      shiftsArray: [],
      validation: {}
    };
  }

  componentDidMount() {
    const { actions } = this.props;

    actions.getShifts(this.props.user.site).then((response) => {
      this.setState({
        shiftsArray: response
      });
    });
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!_.isEqual(nextProps.shift, prevState.shift)) {
      const name = nextProps.action === 'Edit' ? nextProps.shift.shift_name : '';
      const shift_id = nextProps.action === 'Edit' ? nextProps.shift.shift_id : 0;
      return {
        shift: nextProps.shift,
        shift_id: shift_id,
        shift_name: name,
        shift_description: nextProps.shift.shift_description || '',
        shift_sequence: nextProps.shift.shift_sequence || 0,
        start_time: nextProps.shift.start_time ? moment('1970-01-01 ' + nextProps.shift.start_time).format('HH:mm') : '',
        start_day: nextProps.shift.start_time_offset_days || 0,
        end_time: nextProps.shift.end_time ? moment('1970-01-01 ' + nextProps.shift.end_time).format('HH:mm') : '',
        end_day: nextProps.shift.end_time_offset_days || 0,
        is_first_shift_of_day: nextProps.shift.is_first_shift_of_day || false,
        status: nextProps.shift.status || '',
        validation: {}
      };
    }
    return null;
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
      shift_id,
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
        shift_id: shift_id,
        shift_code: `${this.props.user.site_prefix} - ${shift_name}`,
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
          this.props.handleClose();
          this.setState({
            show: true,
            validation: {}
          });
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

  closeModalMessage = () => {
    this.setState({
      show: false,
      modalError: false
    });
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
      validation
    } = this.state;
    const t = this.props.t;
    return (
      <div>
        <Modal className='general3-modal' show={this.props.isOpen} onHide={this.props.handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>{t(this.props.action + ' Shift')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group as={Row}>
                <Form.Label column sm={2}>{t('Name')}:</Form.Label>
                <Col sm={10}>
                  <Form.Control
                    type="text"
                    name="shift_name"
                    value={shift_name}
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
                    onChange={this.handleChange}
                    value={shift_description}
                    rows={3} />
                </Col>
              </Form.Group>
              <Form.Group as={Row}>
                <Form.Label column sm={2}>{t('Sequence')}:</Form.Label>
                <Col sm={10}>
                  <Form.Control
                    type="number"
                    name="shift_sequence"
                    value={shift_sequence}
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
                    value={start_time}
                  />
                  <Form.Text className='validation'>{validation.start_time}</Form.Text>
                </Col>
                <Form.Label column sm={2}>{t('Start Day')}:</Form.Label>
                <Col sm={4}>
                  <Form.Control
                    as='select'
                    name='start_day'
                    onChange={this.handleChange}
                    value={start_day}
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
                    value={end_time}
                  />
                  <Form.Text className='validation'>{validation.end_time}</Form.Text>
                </Col>
                <Form.Label column sm={2}>{t('End Day')}:</Form.Label>
                <Col sm={4}>
                  <Form.Control
                    as='select'
                    name='end_day'
                    onChange={this.handleChange}
                    value={end_day}
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
                    value={is_first_shift_of_day}
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
                    value={status}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </Form.Control>
                </Col>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="Primary" onClick={(e) => this.updateShift(e)}>
              {t('Confirm')}
            </Button>
            <Button variant="secondary" onClick={this.props.handleClose}>
              {t('Close')}
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal show={this.state.show} onHide={this.closeModalMessage}>
          <Modal.Header closeButton>
            <Modal.Title>Sucess</Modal.Title>
          </Modal.Header>
          <Modal.Body>Shift has been copied</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.closeModalMessage}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal show={this.state.modalError} onHide={this.closeModalMessage}>
          <Modal.Header closeButton>
            <Modal.Title>Error</Modal.Title>
          </Modal.Header>
          <Modal.Body>Shift has not been copied</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.closeModalMessage}>
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

export default connect(null, mapDispatch)(ShiftModal);
