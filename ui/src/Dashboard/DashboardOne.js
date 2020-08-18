import React from 'react';
import './dashboard.scss';
import '../sass/tooltip.scss';
import { Row, Col } from 'react-bootstrap';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import moment from 'moment';
import CommentsModal from '../Layout/CommentModal';
import ValueModal from '../Layout/ValueModal';
import TimelossModal from '../Layout/TimelossModal';
import SignoffModal from '../Layout/SignoffModal';
import OrderModal from '../Layout/OrderModal';
import ManualEntryModal from '../Layout/ManualEntryModal';
import Spinner from '../Spinner';
import Comments from './Comments';
import ErrorModal from '../Layout/ErrorModal';
import AlertModalOverProd from '../Layout/ErrorModal';
import Pagination from '../Layout/Pagination';
import ScrapModal from '../Layout/ScrapModal';
import openSocket from 'socket.io-client';
import {
  formatDate,
  isComponentValid,
  mapShift,
  getCurrentTime,
  formatNumber,
  getDateAccordingToShifts,
  genericRequest,
  getResponseFromGeneric,
  getRowsFromShifts
} from '../Utils/Requests';
import _ from 'lodash';
import config from '../config.json';
import { SOCKET, API } from '../Utils/Constants';
import dashboardHelper from '../Utils/DashboardHelper';
import MessageForm from '../Layout/MessageModal';
import $ from 'jquery';
import('moment/locale/es');
import('moment/locale/it');
import('moment/locale/de');
const axios = require('axios');

const modalStyle = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    position: 'fixed'
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0, 0.6)'
  }
};


class DashboardOne extends React.Component {
  constructor(props) {
    super(props);

    let temporalState = Object.assign(this.getInitialState(props), this.getTextTranslations(props));
    this.state = Object.assign(temporalState, this.getTableColumns(temporalState));
  }

  getInitialState(props) {
    var hour = moment(getCurrentTime(props.user.timezone)).hours();
    return {
      data: [],
      columns: [],
      modalStyle: modalStyle,
      errorModal: false,
      ErrorMessage: '',
      modal_actual_IsOpen: false,
      modal_authorize_IsOpen: false,
      modal_comments_IsOpen: false,
      modal_timelost_IsOpen: false,
      modal_signoff_IsOpen: false,
      modal_order_IsOpen: false,
      modal_manualentry_IsOpen: false,
      modal_scrap_IsOpen: false,
      isMenuOpen: false,
      valid_barcode: false,
      signoff_reminder: false,
      logoffHourCheck: localStorage.getItem("signoff") === false ? localStorage.getItem("signoff") : true,
      barcode: 1001,
      dataCall: {},
      selectedDate: props.search.dt || props.user.date_of_shift || getCurrentTime(props.user.timezone),
      selectedDateParsed: '',
      selectedMachine: props.search.mc || props.machineData.asset_code,
      selectedMachineType: props.search.tp || props.machineData.automation_level,
      station: props.search.st || '00000',
      currentLanguage: props.search.ln || props.user.language,
      site: props.search.cs || props.user.site,
      valueToEdit: '',
      cumulativepcs: '',
      expanded: {},
      openDropdownAfter: false,
      selectedShift: props.search.sf || props.user.current_shift,
      selectedHour: props.search.hr,
      dateFromData: false,
      shifts: props.user.shifts,
      timezone: props.user.timezone,
      currentHour: hour,
      summary: props.summary,
      uom_asset: null,
      signOffModalType: '',
      readOnly: false,
      alertModalOverProd: false,
      alertMessageOverProd: '',
      modal_message_Is_Open: false,
      messageModalType: '',
      messageModalMessage: ''
    }
  }

  getTextTranslations(props) {
    return {
      shiftText: props.search.sf ? props.t(props.search.sf) : props.user.current_shift,
      partNumberText: props.t('Part Number'),
      idealText: props.t('Ideal'),
      targetText: props.t('Target'),
      actualText: props.t('Actual'),
      scrapText: props.t('Scrap'),
      cumulativeTargetText: props.t('Cumulative Target'),
      cumulativeActualText: props.t('Cumulative Actual'),
      timeLostText: props.t('Time Lost (Total Mins.)'),
      commentsActionText: props.t('Comments And Actions Taken'),
      operatorText: props.t('Operator'),
      supervisorText: props.t('Supervisor')
    }
  }

  closeModal = () => {
    this.setState({
      modal_authorize_IsOpen: false,
      modal_comments_IsOpen: false,
      modal_actual_IsOpen: false,
      modal_timelost_IsOpen: false,
      modal_signoff_IsOpen: false,
      modal_order_IsOpen: false,
      modal_manualentry_IsOpen: false,
      modal_scrap_IsOpen: false,
      errorModal: false,
      readOnly: false,
      alertModalOverProd: false,
      modal_message_Is_Open: false
    });
    if (!this.state.summary) {
      this.props.closeOrderModal(false);
    }
  }

  menuToggle(flag) {
    this.setState({
      isMenuOpen: flag
    })
  }

  async componentDidMount() {
    this.fetchData([this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift], this.props);
    const socket = openSocket.connect(SOCKET);
    socket.on('connect', () => console.log('Connected to the Websocket Service'));
    socket.on('disconnect', () => console.log('Disconnected from the Websocket Service'));
    try {
      socket.on('message', response => {
        if (response.message === true) {
          if (!this.state.isMenuOpen && !this.state.modal_signoff_IsOpen && !this.state.modal_actual_IsOpen && !this.state.modal_scrap_IsOpen) {
            this.fetchData([this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift], this.props);
          }
        }
      });
    } catch (e) { console.log(e) }
  };

  componentWillReceiveProps(nextProps) {
    if (!nextProps.showNewOrderModal) {
      if (!_.isEqual(nextProps.search, this.props.search)) {
        let _this = this;
        if (nextProps.search.ln && this.state.currentLanguage !== nextProps.search.ln) {
          let temporalState = Object.assign(_this.getTextTranslations(nextProps));
          this.setState(Object.assign(temporalState, this.getTableColumns(temporalState)));
        }
        if (nextProps.search.sf && this.state.selectedShift !== nextProps.search.sf) {
          let temporalState = Object.assign(_this.getTextTranslations(nextProps));
          this.setState(Object.assign(temporalState, this.getTableColumns(temporalState)));
        }

        let selectedDate;
        let selectedMachine;
        let selectedShift;
        if (nextProps.user.site === this.state.site) {
          selectedDate = nextProps.search.dt || nextProps.user.date_of_shift || getCurrentTime(nextProps.user.timezone);
          selectedMachine = nextProps.search.mc || this.state.selectedMachine;
          selectedShift = nextProps.search.sf || this.state.selectedShift;
        } else {
          selectedDate = nextProps.search.dt || nextProps.user.date_of_shift || getCurrentTime(nextProps.user.timezone);
          selectedMachine = nextProps.search.mc || nextProps.machineData.asset_code;
          selectedShift = nextProps.search.sf || nextProps.user.current_shift;
        }

        this.fetchData([selectedMachine, selectedDate, selectedShift], nextProps);
        this.setState({
          selectedDate: selectedDate,
          selectedMachine: selectedMachine,
          currentLanguage: nextProps.search.ln || this.state.currentLanguage,
          selectedShift: selectedShift,
          selectedMachineType: nextProps.search.tp || this.state.selectedMachineType,
          selectedHour: nextProps.search.hr,
          site: nextProps.user.site === this.state.site ? this.state.site : nextProps.user.site,
          shifts: nextProps.user.shifts,
          expanded: {}
        });

      }
    } else {
      this.setState({ modal_order_IsOpen: nextProps.showNewOrderModal });
    }
  }

  fetchData = (data, props) => {
    props = props ? props : this.props;
    if (this.state.summary) {
      this.loadDataAllShift(data, props);
    } else {
      this.loadDataCurrentShift(data, props);
    }
  }

  loadDataAllShift(filter, props) {

    let newDate = getDateAccordingToShifts(filter[1], props.user);

    if (newDate === filter[1]) {
      const logoffHour = formatNumber(moment(getCurrentTime(props.user.timezone)).format('HH:mm').toString().slice(3, 5));
      var minutes = moment().minutes();

      let signoff_reminder = config['first_signoff_reminder'].includes(logoffHour);
      let errorModal = false;
      let errorMessage = '';

      if (logoffHour === config['second_signoff_reminder']) {
        if (this.state.logoffHourCheck === true && props.user.role === 'Operator') {
          errorModal = true;
          errorMessage = 'Please sign off for the previous hour';
        }
      }
      var est = moment().tz(props.user.timezone).hours();
      if (minutes > 6 && localStorage.getItem("currentHour")) {
        if (localStorage.getItem("currentHour") !== est) {
          localStorage.removeItem("signoff");
          localStorage.removeItem("currentHour");
        }
      }

      if (filter && filter[0]) {

        let hr = moment().tz(props.user.timezone).hours();

        let responseArray = [];

        _.forEach(props.user.shifts, shift => {
          let param = {
            mc: filter[0],
            dt: moment(filter[1]).format('YYYY/MM/DD') + ' ' + (shift.hour >= 10 ? shift.hour + ':00' : '0' + shift.hour + ':00'),
            sf: shift.shift_id,
            hr: hr,
            st: props.user.site
          }
          responseArray.push(getResponseFromGeneric('get', API, '/data', {}, param, {}));
        });

        const parameters = {
          mc: filter[0],
          dt: formatDate(filter[1]).split("-").join(""),
          sf: mapShift(filter[2]),
          hr: hr
        };
        responseArray.push(getResponseFromGeneric('get', API, '/intershift_communication', {}, parameters, {}));
        responseArray.push(getResponseFromGeneric('get', API, '/uom_asset', {}, parameters, {}));

        Promise.all(responseArray).then(responses => {
          let data = [];
          _.forEach(responses, (res, index) => {
            if (index < (responses.length - 2)) {
              let shift = {
                'hour_interval': props.user.shifts[index].shift_name, 'summary_product_code': this.state.partNumberText, 'summary_ideal': this.state.idealText,
                'summary_target': this.state.targetText, 'summary_adjusted_actual': this.state.actualText, 'summary_scrap': this.state.scrapText, 'cumulative_target': this.state.cumulativeTargetText,
                'cumulative_adjusted_actual': this.state.cumulativeActualText, 'timelost_summary': this.state.timeLostText, 'latest_comment': this.state.commentsActionText,
                'operator_signoff': this.state.operatorText, 'supervisor_signoff': this.state.supervisorText
              };
              if (data === []) {
                data = _.concat([shift], res);
              } else {
                data = _.concat(data, [shift], res);
              }
            }
          });

          let comments = responses[responses.length - 2] || [];
          let uom_asset = responses[responses.length - 1] || [];

          this.setState({ signoff_reminder, errorModal, errorMessage, data, comments, uom_asset });
        });
      }
    } else {
      let queryItem = Object.assign({}, props.search);
      queryItem["dt"] = newDate;
      let parameters = $.param(queryItem);
      props.history.push(`${props.history.location.pathname}?${parameters}`);
    }

  }

  async loadDataCurrentShift(filter, props) {
    const logoffHour = formatNumber(moment(getCurrentTime(props.user.timezone)).format('HH:mm').toString().slice(3, 5));
    var minutes = moment().minutes();

    let signoff_reminder = config['first_signoff_reminder'].includes(logoffHour);
    let errorModal = false;
    let errorMessage = '';

    if (logoffHour === config['second_signoff_reminder']) {
      if (this.state.logoffHourCheck === true && props.user.role === 'Operator') {
        errorModal = true;
        errorMessage = 'Please sign off for the previous hour';
      }
    }
    var tz = this.state.commonParams ? this.state.commonParams.value : props.user.timezone;
    var est = moment().tz(tz).hours();
    if (minutes > 6 && localStorage.getItem("currentHour")) {
      if (localStorage.getItem("currentHour") !== est) {
        localStorage.removeItem("signoff");
        localStorage.removeItem("currentHour");
      }
    }

    if (filter && filter[0]) {

      let sf = {};

      _.forEach(props.user.shifts, shift => {
        if (shift.shift_name === filter[2]) {
          sf = shift;
        }
      });

      const parameters = {
        mc: filter[0],
        dt: formatDate(filter[1]).split("-").join(""),
        sf: sf.shift_id || props.user.shift_id,
        hr: moment().tz(props.user.timezone).hours(),
        st: props.user.site
      }

      let requestArray = [
        genericRequest('get', API, '/data', {}, parameters, {}),
        genericRequest('get', API, '/uom_asset', {}, parameters, {}),
      ];

      axios.all(requestArray).then(
        axios.spread((...responses) => {
          let data = responses[0].data;
          let uom_asset = responses[1].data;
          if (data[0] && data[0].order_quantity < data[0].summary_actual_quantity && moment().tz(tz).minutes() === 0 &&
            (props.user.role === 'Supervisor' || props.user.role === 'Operator')) {
            alertModalOverProd = true;
            alertMessageOverProd = `Day by Hour has calculated the Order for Part ${data[0].product_code_order} is complete.  Please start a new Order when available. `;
          }
          this.setState({ data, uom_asset });
        })
      );

      let comments = await getResponseFromGeneric('get', API, '/intershift_communication', {}, parameters, {}) || [];

      let alertModalOverProd = false;
      let alertMessageOverProd = '';


      this.setState({ signoff_reminder, errorModal, errorMessage, alertModalOverProd, alertMessageOverProd, comments });
    }
  }

  openMessageModal = (type, message) => {
    this.setState({
      modal_message_Is_Open: true,
      messageModalType: type,
      messageModalMessage: message
    });
  }

  render() {
    const columns = this.state.columns;
    let machineName = 'No Data';
    _.forEach(this.props.user.machines, (machine) => {
      if (machine.asset_code === this.state.selectedMachine) {
        machineName = machine.asset_name;
      }
    });

    const data = this.state.data;
    // @DEV: *****************************
    // Always assign data to variable then 
    // ternary between data and spinner
    // ***********************************
    const t = this.props.t;
    const back = t('Back');
    const next = t('Next');
    const page = t('Page');
    const off = t('Of');
    const rows = t('Rows');
    const dxh_parent = !_.isEmpty(data) ? data[0] : undefined;
    const obj = this;
    const num_rows = getRowsFromShifts(this.props,this.state.summary);
    return (
      <React.Fragment>
        {isComponentValid(this.props.user.role, 'pagination') && !_.isEmpty(this.state.shifts) && !this.state.summary ?
          <Pagination
            history={this.props.history}
            user={this.props.user}
            machineData={this.props.machineData}
            t={t}
          /> : null}
        <div className="wrapper-main">
          <Row>
            <Col md={12} lg={12} id="dashboardOne-table">
              <Row style={{ paddingLeft: '5%' }}>
                <Col md={3}><h5>{t('Day by Hour Tracking')}</h5></Col>
                <Col md={3}><h5>{t('Machine/Cell')}: {t(machineName)}</h5></Col>
                <Col md={3}><h5 style={{ textTransform: 'Capitalize' }}>{this.props.user.first_name ?
                  `${this.props.user.first_name} ${this.props.user.last_name.charAt(0)}, ` : void (0)}{`(${t(this.props.user.role)})`}</h5></Col>
                <Col md={3}><h5 style={{ fontSize: '1.0em' }}>{t('Showing Data for') + ': '}
                  {!_.isEmpty(this.state.data) ? moment(this.state.selectedDate).locale(this.state.currentLanguage).format('LL') : null}</h5></Col>
              </Row>
              {!_.isEmpty(data) ?
                <ReactTable
                  getTheadThProps={(state, rowInfo, column) => {
                    return this.state.summary ?
                      {
                        style: { display: 'none' } // override style for 'myHeaderTitle'.
                      }
                      : {}
                  }}
                  getTdProps={(state, rowInfo, column) => {
                    return {
                      onClick: () => {
                        this.clickWholeCell(rowInfo, column)
                      },
                      style: {
                        cursor: rowInfo && rowInfo.level === 0 && rowInfo.subRows[0]._original.hour_interval.includes('Shift') ? '' : 'pointer'
                      }
                    }
                  }}
                  sortable={false}
                  data={data}
                  columns={columns}
                  showPaginationBottom={false}
                  pageSize={num_rows}
                  headerStyle={{ fontSize: '0.5em' }}
                  previousText={back}
                  nextText={next}
                  pageText={page}
                  ofText={off}
                  headerClassName={"wordwrap"}
                  rowsText={rows}
                  pageSizeOptions={[8, 16, 24]}
                  pivotBy={["hour_interval"]}
                  onExpandedChange={newExpanded => this.onExpandedChange(newExpanded)}
                  expanded={this.state.expanded}
                  resizable={false}
                /> : <Spinner />}
            </Col>
          </Row>
          <Comments
            t={t}
            user={this.props.user}
            selectedDate={this.state.selectedDate}
            comments={this.state.comments}
            dxh_parent={dxh_parent ? dxh_parent : null}
            Refresh={this.fetchData}
            parentData={[this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift]}
            timezone={this.state.timezone}
            readOnly={this.state.summary}
            openMessageModal={this.openMessageModal}
          />
        </div>
        <ManualEntryModal
          isOpen={this.state.modal_manualentry_IsOpen}
          onRequestClose={this.closeModal}
          style={this.state.modalStyle}
          t={this.props.t}
          user={this.props.user}
          currentRow={this.state.currentRow}
          Refresh={this.fetchData}
          parentData={[this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift, this.state.selectedHour]}
        />
        <ValueModal
          isOpen={this.state.modal_actual_IsOpen}
          onRequestClose={this.closeModal}
          style={this.state.modalStyle}
          t={t}
          user={this.props.user}
          currentRow={this.state.currentRow}
          Refresh={this.fetchData}
          parentData={[this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift, this.state.selectedHour]}
          readOnly={this.state.readOnly || this.state.summary}
        />
        <CommentsModal
          isOpen={this.state.modal_comments_IsOpen}
          onRequestClose={this.closeModal}
          style={this.state.modalStyle}
          t={t}
          currentRow={this.state.currentRow}
          user={this.props.user}
          Refresh={this.fetchData}
          parentData={[this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift, this.state.selectedHour]}
          selectedDate={this.state.selected}
          readOnly={this.state.readOnly || this.state.summary}
        />
        <TimelossModal
          isOpen={this.state.modal_timelost_IsOpen}
          onRequestClose={this.closeModal}
          style={this.state.modalStyle}
          t={t}
          currentRow={this.state.currentRow}
          user={this.props.user}
          Refresh={this.fetchData}
          parentData={[this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift, this.state.selectedHour]}
          readOnly={this.state.readOnly || this.state.summary}
        />
        <SignoffModal
          isOpen={this.state.modal_signoff_IsOpen}
          onRequestClose={this.closeModal}
          style={this.state.modalStyle}
          t={this.props.t}
          currentRow={this.state.currentRow}
          user={this.props.user}
          Refresh={this.fetchData}
          parentData={[this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift, this.state.selectedHour]}
          signOffModalType={this.state.signOffModalType}
          readOnly={this.state.readOnly || this.state.summary}
          uom_asset={this.state.uom_asset}
        />
        <OrderModal
          isOpen={this.state.modal_order_IsOpen}
          open={this.openModal}
          onRequestClose={this.closeModal}
          style={this.state.modalStyle}
          t={t}
          user={this.props.user}
          Refresh={this.fetchData}
          parentData={[this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift, this.state.selectedHour]}
        />
        <ScrapModal
          isOpen={this.state.modal_scrap_IsOpen}
          onRequestClose={this.closeModal}
          style={this.state.modalStyle}
          t={t}
          currentRow={this.state.currentRow}
          user={this.props.user}
          Refresh={this.fetchData}
          parentData={[this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift, this.state.selectedHour]}
          readOnly={this.state.readOnly || this.state.summary}
          openMessageModal={this.openMessageModal}
        />
        <ErrorModal
          isOpen={this.state.errorModal}
          onRequestClose={a => {
            obj.setState({ logoffHourCheck: false })
            this.closeModal();
          }}
          contentLabel="Example Modal"
          t={t}
          message={this.state.errorMessage}
        />
        <AlertModalOverProd
          isOpen={this.state.alertModalOverProd}
          onRequestClose={this.closeModal}
          contentLabel="Example Modal"
          t={t}
          message={this.state.alertMessageOverProd}
        />
        <MessageForm
          isOpen={this.state.modal_message_Is_Open}
          onRequestClose={this.closeModal}
          type={this.state.messageModalType}
          message={this.state.messageModalMessage}
          t={t}
        />
      </React.Fragment >
    );
  }
};

Object.assign(DashboardOne.prototype, dashboardHelper);

export default DashboardOne;