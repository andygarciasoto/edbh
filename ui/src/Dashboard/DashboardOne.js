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
import Pagination from '../Layout/Pagination';
import ScrapModal from '../Layout/ScrapModal';
import openSocket from 'socket.io-client';
import {
  formatDate,
  isComponentValid,
  mapShift,
  getCurrentTime,
  formatNumber,
  BuildGet,
  getDateAccordingToShifts
} from '../Utils/Requests';
import _ from 'lodash';
import config from '../config.json';
import { SOCKET, API } from '../Utils/Constants';
import dashboardHelper from '../Utils/DashboardHelper';
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
      selectedDate: props.search.dt || getCurrentTime(props.user.timezone),
      selectedDateParsed: '',
      selectedMachine: props.search.mc || props.machineData.asset_code,
      selectedMachineType: props.search.tp || props.machineData.automation_level,
      station: props.search.st || '00000',
      currentLanguage: props.search.ln || props.user.language,
      site: props.search.cs || props.user.site,
      valueToEdit: '',
      cumulativepcs: '',
      modalType: '',
      expanded: {},
      openDropdownAfter: false,
      selectedShift: props.search.sf || props.user.current_shift,
      selectedHour: props.search.hr,
      dateFromData: false,
      shifts: props.user.shifts,
      timezone: props.user.timezone,
      currentHour: hour,
      summary: props.summary,
      uom_asset: null
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

  showValidateDataModal(data) {
    if (data) {
      this.setState({
        modal_order_IsOpen: false,
        modal_order_two_IsOpen: true,
        orderTwo_data: data[0].OrderData
      })
    } else {
      this.setState({
        modal_error_IsOpen: true,
      })
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
      modal_order_two_IsOpen: false,
      modal_manualentry_IsOpen: false,
      modal_scrap_IsOpen: false,
      errorModal: false,
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
          selectedDate = nextProps.search.dt || getCurrentTime(this.props.user.timezone);
          selectedMachine = nextProps.search.mc || this.state.selectedMachine;
          selectedShift = nextProps.search.sf || this.state.selectedShift;
        } else {
          selectedDate = nextProps.search.dt || getCurrentTime(nextProps.user.timezone);
          selectedMachine = nextProps.machineData.asset_code;
          selectedShift = nextProps.user.current_shift;
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
      this.openModal('order');
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

        let requestArray = [];

        _.forEach(props.user.shifts, shift => {
          let param = {
            params: {
              mc: filter[0],
              dt: moment(filter[1]).format('YYYY/MM/DD') + ' ' + (shift.hour > 10 ? shift.hour + ':00' : '0' + shift.hour + ':00'),
              sf: shift.shift_id,
              hr: hr,
              st: props.user.site
            }
          }
          requestArray.push(BuildGet(`${API}/data`, param));
        });


        const parameters = {
          params: {
            mc: filter[0],
            dt: formatDate(filter[1]).split("-").join(""),
            sf: mapShift(filter[2]),
            hr: hr
          }
        };
        requestArray.push(BuildGet(`${API}/intershift_communication`, parameters));
        requestArray.push(BuildGet(`${API}/uom_asset`, parameters));

        let _this = this;

        axios.all(requestArray).then(
          axios.spread((...responses) => {

            let data = [];
            _.forEach(responses, (response, index) => {
              if (index < (responses.length - 2)) {
                let shift = {
                  'hour_interval': props.user.shifts[index].shift_name, 'summary_product_code': this.state.partNumberText, 'summary_ideal': this.state.idealText,
                  'summary_target': this.state.targetText, 'summary_actual': this.state.actualText, 'summary_scrap': this.state.scrapText, 'cumulative_target': this.state.cumulativeTargetText,
                  'cumulative_actual': this.state.cumulativeActualText, 'timelost_summary': this.state.timeLostText, 'latest_comment': this.state.commentsActionText,
                  'operator_signoff': this.state.operatorText, 'supervisor_signoff': this.state.supervisorText
                };
                if (data === []) {
                  data = _.concat([shift], response.data);
                } else {
                  data = _.concat(data, [shift], response.data);
                }
              }
            });

            let comments = responses[responses.length - 2].data;
            let uom_asset = responses[responses.length - 1].data;

            _this.setState({ signoff_reminder, errorModal, errorMessage, data, comments, uom_asset });

          })
        ).catch(function (error) {
          console.log(error);
        });
      }
    } else {
      console.log('change date');
      let queryItem = Object.assign({}, props.search);
      // eslint-disable-next-line no-self-assign
      queryItem["dt"] = newDate;
      let parameters = $.param(queryItem);
      props.history.push(`${props.history.location.pathname}?${parameters}`);
    }

  }

  loadDataCurrentShift(filter, props) {
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
        params: {
          mc: filter[0],
          dt: formatDate(filter[1]).split("-").join(""),
          sf: sf.shift_id || props.user.shift_id,
          hr: moment().tz(props.user.timezone).hours(),
          st: props.user.site
        }
      }
      let requestData = [
        BuildGet(`${API}/data`, parameters),
        BuildGet(`${API}/uom_asset`, parameters)
      ];

      let requestIntershift = [
        BuildGet(`${API}/intershift_communication`, parameters)];

      let _this = this;

      axios.all(requestData).then(
        axios.spread((responseData, responseAssetUOM) => {

          let data = responseData.data;
          let uom_asset = responseAssetUOM.data;

          _this.setState({ signoff_reminder, errorModal, errorMessage, data, uom_asset });

        })
      ).catch(function (error) {
        console.log(error);
      });

      axios.all(requestIntershift).then(
        axios.spread((responseIntershift) => {

          let comments = responseIntershift.data;

          _this.setState({ comments });

        })
      ).catch(function (error) {
        console.log(error);
      });
    }
  }

  render() {
    const columns = this.state.columns;
    let machineName = 'No Data';
    _.forEach(this.props.user.machines, (machine) => {
      if (machine.Asset.asset_code === this.state.selectedMachine) {
        machineName = machine.Asset.asset_name;
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
                  sortable={false}
                  data={data}
                  columns={columns}
                  showPaginationBottom={false}
                  pageSize={this.state.summary ? (this.state.shifts.length * (this.state.shifts[0].duration_in_minutes / 60)) + this.state.shifts.length : (this.state.shifts[0].duration_in_minutes / 60)}
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
          />
        </div>
        <ManualEntryModal
          isOpen={this.state.modal_manualentry_IsOpen}
          onRequestClose={this.closeModal}
          style={this.state.modalStyle}
          //contentLabel="Example Modal"
          t={this.props.t}
          //timelost={this.state.current_display_timelost}
          //machine={this.state.selectedMachine}
          user={this.props.user}
          currentRow={this.state.currentRow}
          Refresh={this.fetchData}
          parentData={[this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift, this.state.selectedHour]}
          //timezone={this.state.timezone}
        />
        <ValueModal
          isOpen={this.state.modal_actual_IsOpen}
          //  onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={this.state.modalStyle}
          //contentLabel="Example Modal"
          //currentVal={isNaN(this.state.valueToEdit) ? undefined : this.state.valueToEdit}
          //cumulativepcs={this.state.cumulative_pcs}
          //formType={this.state.modalType}
          t={t}
          user={this.props.user}
          currentRow={this.state.currentRow}
          Refresh={this.fetchData}
          parentData={[this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift, this.state.selectedHour]}
          //timezone={this.state.timezone}
          readOnly={this.state.summary}
        />
        <CommentsModal
          isOpen={this.state.modal_comments_IsOpen}
          //  onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={this.state.modalStyle}
          //contentLabel="Example Modal"
          t={t}
          //comments={this.state.current_display_comments}
          currentRow={this.state.currentRow}
          user={this.props.user}
          Refresh={this.fetchData}
          parentData={[this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift, this.state.selectedHour]}
          selectedDate={this.state.selected}
          IsEditable={this.state.comments_IsEditable && !this.state.summary}
          //timezone={this.state.timezone}
        />
        <TimelossModal
          isOpen={this.state.modal_timelost_IsOpen}
          //  onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={this.state.modalStyle}
          //contentLabel="Example Modal"
          t={t}
          //label={t('Search/Select Reason Code')}
          //timelost={this.state.current_display_timelost}
          //machine={this.state.selectedMachine}
          currentRow={this.state.currentRow}
          user={this.props.user}
          Refresh={this.fetchData}
          parentData={[this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift, this.state.selectedHour]}
          isEditable={this.state.timelost_IsEditable && !this.state.summary}
          //timezone={this.state.timezone}
        />
        <SignoffModal
          isOpen={this.state.modal_signoff_IsOpen}
          //  onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          //contentLabel="Example Modal"
          t={this.props.t}
          currentRow={this.state.currentRow}
          user={this.props.user}
          Refresh={this.fetchData}
          parentData={[this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift, this.state.selectedHour]}
          //signOffRole={this.state.signOffRole}
          //timezone={this.state.timezone}
          uom_asset={this.state.uom_asset}
        />
        <OrderModal
          isOpen={this.state.modal_order_IsOpen}
          isOpenTwo={this.state.modal_order_two_IsOpen}
          open={this.openModal}
          onRequestClose={this.closeModal}
          style={this.state.modalStyle}
          //contentLabel="Example Modal"
          //currentVal={isNaN(this.state.valueToEdit) ? undefined : this.state.valueToEdit}
          //formType={this.state.modalType}
          t={t}
          currentRow={this.state.currentRow}
          //label={'Scan Order Number'}
          user={this.props.user}
          Refresh={this.fetchData}
          parentData={[this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift, this.state.selectedHour]}
          showValidateDataModal={this.showValidateDataModal}
          //timezone={this.state.timezone}
        />
        <ScrapModal
          isOpen={this.state.modal_scrap_IsOpen}
          onRequestClose={this.closeModal}
          //contentLabel="Example Modal"
          //formType={this.state.modalType}
          style={this.state.modalStyle}
          t={t}
          currentRow={this.state.currentRow}
          user={this.props.user}
          Refresh={this.fetchData}
          parentData={[this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift, this.state.selectedHour]}
          IsEditable={this.state.summary}
          //timezone={this.state.timezone}
        />
        <ErrorModal
          isOpen={this.state.errorModal}
          //onAfterOpen={this.afterOpenModal}
          onRequestClose={a => {
            obj.setState({ logoffHourCheck: false })
            this.closeModal();
          }}
          contentLabel="Example Modal"
          t={t}
          message={this.state.errorMessage}
        />
      </React.Fragment >
    );
  }
};

Object.assign(DashboardOne.prototype, dashboardHelper);

export default DashboardOne;