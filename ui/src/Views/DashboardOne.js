import React from 'react';
import Pagination from '../Components/DashboardOne/Pagination';
import OperatorComponent from '../Components/DashboardOne/OperatorComponent';
import DashboardTable from '../Components/DashboardOne/DashboardTable';
import Intershift from '../Components/DashboardOne/Intershift';
import {
  getCurrentTime,
  getResponseFromGeneric,
  formatDate,
  validPermission
} from '../Utils/Requests';
import { Row, Col } from 'react-bootstrap';
import { SOCKET, API } from '../Utils/Constants';
import moment from 'moment';
import _ from 'lodash';
import openSocket from 'socket.io-client';
import '../sass/Dashboard.scss';
import('moment/locale/es');
import('moment/locale/it');
import('moment/locale/de');
import('moment/locale/ko');

class DashboardOne extends React.Component {

  constructor(props) {
    super(props);
    this.state = Object.assign(this.getInitialState(props));
  }

  getInitialState(props) {
    let selectedAssetOption = {};
    _.forEach(props.user.machines, (machine) => {
      if (machine.asset_code === props.search.mc || machine.asset_code === props.machineData.asset_code) {
        selectedAssetOption = machine;
      }
    });
    return {
      selectedMachine: props.search.mc || props.machineData.asset_code,
      selectedMachineType: props.search.tp || props.machineData.automation_level,
      selectedDate: props.search.dt || props.user.date_of_shift || getCurrentTime(props.user.timezone),
      selectedShift: props.search.sf || props.user.current_shift,
      currentLanguage: props.search.ln || props.user.language,
      shifts: props.user.shifts,
      selectedAssetOption,
      activeOperators: []
    };
  }

  async componentDidMount() {
    this.fetchData(this.props);
    const socket = openSocket.connect(SOCKET);
    socket.on('connect', () => console.log('Connected to the Websocket Service'));
    socket.on('disconnect', () => console.log('Disconnected from the Websocket Service'));
    try {
      socket.on('message', response => {
        if (response.message === true) {
          this.fetchData(this.props);
        }
      });
    } catch (e) { console.log(e) }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!_.isEqual(nextProps.activeOperators, prevState.activeOperators)) {
      return {
        activeOperators: nextProps.activeOperators
      }
    } else if (prevState.selectedDate !== nextProps.search.dt || prevState.selectedMachine !== nextProps.search.mc || prevState.selectedShift !== nextProps.search.sf ||
      prevState.site !== nextProps.user.site) {
      let selectedDate;
      let selectedMachine;
      let selectedShift;
      if (nextProps.user.site === prevState.site) {
        selectedDate = nextProps.search.dt || nextProps.user.date_of_shift || getCurrentTime(nextProps.user.timezone);
        selectedMachine = nextProps.search.mc || prevState.selectedMachine;
        selectedShift = nextProps.search.sf || prevState.selectedShift;
      } else {
        selectedDate = nextProps.search.dt || nextProps.user.date_of_shift || getCurrentTime(nextProps.user.timezone);
        selectedMachine = nextProps.search.mc || nextProps.machineData.asset_code;
        selectedShift = nextProps.search.sf || nextProps.user.current_shift;
      }

      let selectedAssetOption = {};
      _.forEach(nextProps.user.machines, (machine) => {
        if (machine.asset_code === selectedMachine) {
          selectedAssetOption = machine;
        }
      });

      return {
        selectedDate,
        selectedMachine,
        currentLanguage: nextProps.search.ln || prevState.currentLanguage,
        selectedShift,
        selectedMachineType: nextProps.search.tp || prevState.selectedMachineType,
        site: nextProps.user.site === prevState.site ? prevState.site : nextProps.user.site,
        shifts: nextProps.user.shifts,
        selectedAssetOption
      };
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    if (!_.isEqual(this.state.selectedAssetOption, prevState.selectedAssetOption) && this.state.selectedAssetOption.is_multiple) {
      this.fetchData(this.props);
    }
  }

  fetchData = (props) => {
    props = props ? props : this.props;
    if (this.state.selectedAssetOption.is_multiple) {
      const currentShift = _.find(props.user.shifts, { shift_id: props.user.shift_id });
      const parameters = {
        asset_id: this.state.selectedAssetOption.asset_id,
        start_time: formatDate(currentShift.start_date_time_today),
        end_time: formatDate(currentShift.end_date_time_today)
      };

      getResponseFromGeneric('get', API, '/get_scan', null, parameters, null, null).then(response => {
        let user_list = response || [];
        const activeOperators = _.filter(user_list, { status: 'Active', is_current_scan: true });
        props.changeActiveOperators(activeOperators);
        this.setState({
          activeOperators
        });
      });
    } else {
      this.setState({
        activeOperators: []
      });
    }
  }

  render() {
    const props = this.props;
    const t = props.t;
    return (
      <React.Fragment>
        {validPermission(props.user, 'pagination', 'read') && !_.isEmpty(this.state.shifts) && !this.props.summary ?
          <Pagination
            history={props.history}
            user={props.user}
            machineData={props.machineData}
            t={props.t}
          /> : null}
        <div className="wrapper-main">
          {validPermission(props.user, 'operatorInformation', 'read') && this.state.selectedAssetOption.is_multiple ?
            <OperatorComponent
              asset_code={this.state.selectedMachine}
              selectedAssetOption={this.state.selectedAssetOption}
              user={props.user}
              t={props.t}
              activeOperators={this.state.activeOperators}
              Refresh={this.fetchData}
              isEditable={validPermission(props.user, 'operatorInformation', 'write')}
            /> : null}
          <Row>
            <Col md={12} lg={12} id="dashboardOne-table">
              <Row style={{ paddingLeft: '5%' }}>
                <Col md={3}><h5>{t('Day by Hour Tracking')}</h5></Col>
                <Col md={3}><h5>{t('Machine/Cell')}: {t(this.state.selectedAssetOption.asset_name || 'No Data')}</h5></Col>
                <Col md={3}><h5 style={{ textTransform: 'Capitalize' }}>{
                  this.state.selectedAssetOption.is_multiple && props.user.role === 'Operator' ?
                    null :
                    (props.user.first_name ?
                      `${props.user.first_name} ${props.user.last_name.charAt(0)}, (${t(props.user.role)})` : null)}</h5></Col>
                <Col md={3}><h5 style={{ fontSize: '1.0em' }}>{t('Showing Data for') + ': '}
                  {moment(this.state.selectedDate).locale(this.state.currentLanguage).format('LL')}</h5></Col>
              </Row>
              <DashboardTable
                user={props.user}
                search={props.search}
                t={t}
                summary={this.props.summary}
                modal_order_IsOpen={this.props.modal_order_IsOpen}
                closeOrderModal={this.props.closeOrderModal}
                selectedMachine={this.state.selectedMachine}
                selectedMachineType={this.state.selectedMachineType}
                selectedDate={this.state.selectedDate}
                selectedShift={this.state.selectedShift}
                selectedAssetOption={this.state.selectedAssetOption}
                activeOperators={this.state.activeOperators}
              />
            </Col>
          </Row>
          <Intershift
            user={props.user}
            search={props.search}
            t={t}
            summary={this.props.summary}
            selectedAssetOption={this.state.selectedAssetOption}
            activeOperators={this.state.activeOperators}
            selectedMachine={this.state.selectedMachine}
            selectedDate={this.state.selectedDate}
            selectedShift={this.state.selectedShift}
            isEditable={validPermission(props.user, 'intershift', 'write')}
          />
        </div>
      </React.Fragment >
    );
  }
};

export default DashboardOne;