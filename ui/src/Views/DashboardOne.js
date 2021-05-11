import React from 'react';
import Pagination from '../Components/DashboardOne/Pagination';
import OperatorComponent from '../Components/DashboardOne/OperatorComponent';
import DashboardTable from '../Components/DashboardOne/DashboardTable';
import Intershift from '../Components/DashboardOne/Intershift';
import {
  getCurrentTime,
  validPermission
} from '../Utils/Requests';
import { Row, Col } from 'react-bootstrap';
import moment from 'moment';
import _ from 'lodash';
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
    const mc = props.search.mc || props.machineData.asset_code;
    const selectedAssetOption = _.find(props.user.machines, { asset_code: mc }) || props.machineData;
    return {
      selectedAssetOption,
      selectedDate: props.search.dt || props.user.date_of_shift || getCurrentTime(props.user.timezone),
      selectedShift: props.search.sf || props.user.current_shift,
      currentLanguage: props.search.ln || props.user.language,
      activeOperators: []
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const mc = nextProps.search.mc || nextProps.machineData.asset_code;
    const selectedAssetOption = _.find(nextProps.user.machines, { asset_code: mc }) || nextProps.machineData;
    const selectedDate = nextProps.search.dt || nextProps.user.date_of_shift || getCurrentTime(nextProps.user.timezone);
    const selectedShift = nextProps.search.sf || nextProps.user.current_shift;
    const currentLanguage = nextProps.search.ln || nextProps.user.language;
    if (!_.isEqual(selectedAssetOption, prevState.selectedAssetOption) || !_.isEqual(selectedDate, prevState.selectedDate)
      || !_.isEqual(selectedShift, prevState.selectedShift) || !_.isEqual(currentLanguage, prevState.currentLanguage)) {
      return {
        selectedAssetOption,
        selectedDate,
        selectedShift,
        currentLanguage,
        activeOperators: []
      };
    }
    return null;
  }

  updateActiveOperators = (activeOperators) => {
    this.setState({ activeOperators });
  }

  render() {
    const props = this.props;
    const t = props.t;
    return (
      <React.Fragment>
        {validPermission(props.user, 'pagination', 'read') && !_.isEmpty(this.props.user.shifts) && !this.props.summary ?
          <Pagination
            history={props.history}
            user={props.user}
            selectedDate={this.state.selectedDate}
            selectedShift={this.state.selectedShift}
            t={props.t}
            socket={props.socket}
          /> : null}
        <div className="wrapper-main">
          {validPermission(props.user, 'operatorInformation', 'read') && (this.state.selectedAssetOption.is_multiple || this.state.selectedAssetOption.is_dynamic) ?
            <OperatorComponent
              selectedAssetOption={this.state.selectedAssetOption}
              user={props.user}
              t={props.t}
              updateActiveOperators={this.updateActiveOperators}
              socket={props.socket}
              isEditable={validPermission(props.user, 'operatorInformation', 'write')}
              updateCurrentUser={props.updateCurrentUser}
              showModalLogOff={props.showModalLogOff}
              displayModalLogOff={props.displayModalLogOff}
            /> : null}
          <Row>
            <Col md={12} lg={12} id="dashboardOne-table">
              <Row style={{ paddingLeft: '5%' }}>
                <Col md={3}><h5>{t('Day by Hour Tracking')}</h5></Col>
                <Col md={3}><h5>{t('Machine/Cell')}: {t(this.state.selectedAssetOption.asset_name)}</h5></Col>
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
                t={t}
                summary={props.summary}
                modal_order_IsOpen={props.modal_order_IsOpen}
                displayOrderModal={props.displayOrderModal}
                selectedAssetOption={this.state.selectedAssetOption}
                selectedDate={this.state.selectedDate}
                selectedShift={this.state.selectedShift}
                currentLanguage={this.state.currentLanguage}
                activeOperators={this.state.activeOperators}
                socket={props.socket}
              />
            </Col>
          </Row>
          <Intershift
            user={props.user}
            search={props.search}
            t={t}
            summary={this.props.summary}
            selectedAssetOption={this.state.selectedAssetOption}
            selectedShift={this.state.selectedShift}
            selectedDate={this.state.selectedDate}
            activeOperators={this.state.activeOperators}
            isEditable={validPermission(props.user, 'intershift', 'write')}
            socket={props.socket}
          />
        </div>
      </React.Fragment >
    );
  }
};

export default DashboardOne;