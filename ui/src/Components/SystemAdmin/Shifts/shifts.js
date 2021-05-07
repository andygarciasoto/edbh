import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as ShiftActions from '../../../redux/actions/shiftsActions';
import Table from 'react-bootstrap/Table';
import Filter from '../../CustomComponents/filter';
import ShiftModal from './shiftModal';
import moment from 'moment';
import FontAwesome from 'react-fontawesome';


class Shifts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ShiftData: [],
      addShift: false,
      editShift: false,
      shift_id: 0,
      statusFilter: 'Active',
      shift: {},
      action: '',
      showShiftModal: false
    };
  }

  componentDidMount() {
    this.loadData();
  }

  loadData = () => {
    const { actions } = this.props;
    const { statusFilter } = this.state;

    const params = {
      site_id: this.props.user.site,
      status: statusFilter
    }

    actions.getShiftsFilter(params).then((response) => {
      this.setState({
        ShiftData: response
      });
    });
  }

  applyFilter = (statusFilter) => {
    this.setState({ statusFilter }, () => {
      this.loadData();
    })
  }

  showShiftModal = (shift, action) => {
    this.setState({
      shift,
      action,
      showShiftModal: true
    })
  }

  closeShiftModal = () => {
    this.setState({
      shift: {},
      action: '',
      showShiftModal: false
    })
  }

  render() {
    const t = this.props.t;
    return (
      <div>
        <Filter
          className='filter-user'
          buttonName={'+ ' + t('Shift')}
          role={false}
          onClick={() => this.showShiftModal({}, 'Create')}
          onClickFilter={this.applyFilter}
          view={'Shift'}
          t={t}
        />
        <ShiftModal
          user={this.props.user}
          isOpen={this.state.showShiftModal}
          shift={this.state.shift}
          shifts={this.state.ShiftData}
          action={this.state.action}
          Refresh={this.loadData}
          handleClose={this.closeShiftModal}
          t={t}
        />
        <Table responsive='sm' bordered={true}>
          <thead>
            <tr>
              <th>{t('Name')}</th>
              <th>{t('Description')}</th>
              <th>{t('Sequence')}</th>
              <th>{t('Start Time')}</th>
              <th>{t('Start Day')}</th>
              <th>{t('End Time')}</th>
              <th>{t('End Day')}</th>
              <th>{t('Duration (minutes)')}</th>
              <th>{t('Is First Shift')}?</th>
              <th>{t('Status')}</th>
              <th>{t('Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {this.state.ShiftData.map((shift, index) => (
              <tr key={index}>
                <td>{shift.shift_name}</td>
                <td>{shift.shift_description}</td>
                <td>{shift.shift_sequence}</td>
                <td>{moment('1970-01-01 ' + shift.start_time).format('HH:mm A')}</td>
                <td>{shift.start_time_offset_days === -1 ? 'Yesterday' : shift.start_time_offset_days === 0 ? 'Today' : 'Tomorrow'}</td>
                <td>{moment('1970-01-01 ' + shift.end_time).format('HH:mm A')}</td>
                <td>{shift.end_time_offset_days === -1 ? 'Yesterday' : shift.end_time_offset_days === 0 ? 'Today' : 'Tomorrow'}</td>
                <td>{shift.duration_in_minutes}</td>
                <td>{shift.is_first_shift_of_day === true ? 'Yes' : 'No'}</td>
                <td>{shift.status}</td>
                <td>
                  <FontAwesome name='edit fa-2x' onClick={() => this.showShiftModal(shift, 'Update')} />
                  <FontAwesome name='copy fa-2x' onClick={() => this.showShiftModal(shift, 'Copy')} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  }
}


export const mapDispatch = (dispatch) => {
  return {
    actions: bindActionCreators(ShiftActions, dispatch),
  };
};

export default connect(null, mapDispatch)(Shifts);

