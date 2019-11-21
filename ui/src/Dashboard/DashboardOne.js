import React from 'react';
import './dashboard.scss';
import '../sass/tooltip.scss';
import { Row, Col } from 'react-bootstrap';
import ReactTable from 'react-table';
import i18next from 'i18next';
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
import openSocket from 'socket.io-client';
import FontAwesome from 'react-fontawesome';
import {
  getRequest,
  formatDate,
  isComponentValid,
  mapShiftReverse,
  isFieldAllowed,
  mapShift,
  getCurrentTime,
  formatNumber,
  BuildGet
} from '../Utils/Requests';
import classNames from "classnames";
import matchSorter from "match-sorter";
import * as _ from 'lodash';
import config from '../config.json';
import { SOCKET, API } from '../Utils/Constants';
import('moment/locale/es');
const axios = require('axios');


class DashboardOne extends React.Component {
  constructor(props) {
    super(props);

    this.state = Object.assign(this.getInitialState(props));
  }

  getInitialState(props) {
    var hour = moment(getCurrentTime()).hours();
    return {
      data: [],
      columns: [],
      modalStyle: {},
      errorModal: false,
      ErrorMessage: '',
      modal_values_IsOpen: false,
      modal_authorize_IsOpen: false,
      modal_comments_IsOpen: false,
      modal_dropdown_IsOpen: false,
      modal_signoff_IsOpen: false,
      modal_order_IsOpen: false,
      modal_manualentry_IsOpen: false,
      isMenuOpen: false,
      valid_barcode: false,
      signoff_reminder: false,
      logoffHourCheck: localStorage.getItem("signoff") === false ? localStorage.getItem("signoff") : true,
      barcode: 1001,
      dataCall: {},
      selectedDate: props.search.dt || getCurrentTime(),
      selectedDateParsed: '',
      selectedMachine: props.search.mc || props.machineData.asset_code,
      selectedMachineType: props.search.tp || props.machineData.automation_level,
      station: props.search.st || '00000',
      currentLanguage: props.search.ln || config['language'],
      valueToEdit: '',
      cumulativepcs: '',
      modalType: '',
      expanded: {},
      openDropdownAfter: false,
      selectedShift: props.search.sf || props.user.current_shift,
      selectedHour: props.search.hr,
      dateFromData: false,
      shifts: {},
      timezone: props.user.timezone,
      currentHour: hour,
      summary: props.summary
    }
  }

  getTextTranslations(props) {
    return {
      shiftText: props.summary ? props.t('All Shifts') : (props.search.sf ? props.t(props.search.sf) : props.user.current_shift),
      partNumberText: props.t('Part Number'),
      idealText: props.t('Ideal'),
      targetText: props.t('Target'),
      actualText: props.t('Actual'),
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

  openModal(type, val, extraParam) {
    let value = '';
    let modalType = '';
    if (type === 'order') {
      this.setState({
        modal_order_IsOpen: true,
      })
    }
    if (type === 'values') {
      if (val) {
        if (isNaN(val[extraParam])) {
          value = val[extraParam] === null ? undefined : val[extraParam];
          modalType = 'text'
        } else {
          value = parseInt(val[extraParam])
          modalType = 'number'
        }
        if (!arguments[3]) {
          let allowed = false;
          if (extraParam === 'actual_pcs' || extraParam === 'summary_actual') {
            allowed = isFieldAllowed(this.props.user.role, val);
          }
          this.setState({
            modal_values_IsOpen: allowed,
            modal_comments_IsOpen: false,
            modal_dropdown_IsOpen: false,
            valueToEdit: value,
            cumulative_pcs: val.cumulative_pcs,
            modalType,
            currentRow: val ? val : undefined
          })
        }
      } else {
        let allowed;
        if (extraParam === 'actual_pcs' || extraParam === 'summary_actual') {
          allowed = isFieldAllowed(this.props.user.role, val);
        }
        this.setState({
          valueToEdit: value,
          cumulative_pcs: val.cumulative_pcs,
          modal_values_IsOpen: allowed,
          modal_comments_IsOpen: false,
          modal_dropdown_IsOpen: false,
          currentRow: val ? val : undefined
        })
      }
    }
    if (type === 'comments') {
      let current_display_comments = val && val.actions_comments ? _.sortBy(val.actions_comments, 'last_modified_on').reverse() : null;
      let currentRow = val;
      const allowed = isFieldAllowed(this.props.user.role, val);
      this.setState({
        modal_authorize_IsOpen: false,
        modal_comments_IsOpen: true,
        modal_values_IsOpen: false,
        modal_dropdown_IsOpen: false,
        modal_signoff_IsOpen: false,
        modal_order_IsOpen: false,
        modal_order_two_IsOpen: false,
        comments_IsEditable: allowed,
        current_display_comments,
        currentRow
      });
    }
    if (type === 'dropdown') {
      if (val) {
        const timelost = val.timelost;
        const allowed = isFieldAllowed(this.props.user.role, val);
        this.setState({
          modal_values_IsOpen: false,
          modal_comments_IsOpen: false,
          modal_dropdown_IsOpen: true,
          timelost_IsEditable: allowed,
          current_display_timelost: timelost,
          currentRow: val,

        })
      }
    }
    if (type === 'manualentry') {
      if (val) {
        const allowed = isFieldAllowed(this.props.user.role, val);
        if (this.state.selectedMachineType === 'Manual') {
          if (isComponentValid(this.props.user.role, 'manualentry')) {
            this.setState({
              modal_values_IsOpen: false,
              modal_comments_IsOpen: false,
              modal_dropdown_IsOpen: false,
              modal_manualentry_IsOpen: allowed,
              currentRow: val,
            })
          }
        }
      }
    }
    if (type === 'signoff') {
      if (val) {
        if (((val.oper_id === null) && (extraParam === 'operator')) ||
          ((val.superv_id === null) && (extraParam === 'supervisor'))) {
          const allowed = isFieldAllowed(this.props.user.role, val);
          this.setState({
            modal_signoff_IsOpen: allowed,
            currentRow: val,
            signOffRole: extraParam ? extraParam : null,
          })
        } else if (((val.oper_id !== null) && (extraParam === 'operator')) ||
          ((val.superv_id !== null) && (extraParam === 'supervisor'))) {
          if (moment(getCurrentTime()).isSame(val.hour_interval_start, 'hours')) {
            const allowed = isFieldAllowed(this.props.user.role, val);
            this.setState({
              modal_signoff_IsOpen: allowed,
              currentRow: val,
              signOffRole: extraParam ? extraParam : null,
            })
          }
        }
      } else {
        const allowed = isFieldAllowed(this.props.user.role, val);
        this.setState({
          modal_signoff_IsOpen: allowed,
          signOffRole: extraParam ? extraParam : null,
        })
      }
    }
  }

  closeModal = () => {
    this.setState({
      modal_authorize_IsOpen: false,
      modal_comments_IsOpen: false,
      modal_values_IsOpen: false,
      modal_dropdown_IsOpen: false,
      modal_signoff_IsOpen: false,
      modal_order_IsOpen: false,
      modal_order_two_IsOpen: false,
      modal_manualentry_IsOpen: false,
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
    const st = {
      params: {
        site: this.props.user.site
      }
    }
    const shifts = getRequest('/shifts', st);
    shifts.then(shiftObj => { this.setState({ shifts: shiftObj }) });

    let currentLanguage = this.state.currentLanguage.toLowerCase();
    currentLanguage = currentLanguage.replace('-', '_');
    let _this = this;
    i18next.changeLanguage(currentLanguage, () => {
      _this.setState(Object.assign(_this.getTextTranslations(_this.props)), () => _this.getTableColumns());
    }); // -> returns a Promise
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
    const x = moment(this.state.selectedDate).locale(this.state.currentLanguage).format('LL');
    this.setState({ modalStyle, selectedDateParsed: x })
    this.fetchData([this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift]);
    const socket = openSocket.connect(SOCKET);
    socket.on('connect', () => console.log('Connected to the Websocket Service'));
    socket.on('disconnect', () => console.log('Disconnected from the Websocket Service'));
    try {
      socket.on('message', response => {
        if (response.message === true) {
          if (!this.state.isMenuOpen && !this.state.modal_signoff_IsOpen && !this.state.modal_values_IsOpen && this.props.search.mc) {
            this.fetchData([this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift]);
          } else {
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
          let currentLanguage = nextProps.search.ln.toLowerCase();
          currentLanguage = currentLanguage.replace('-', '_');
          i18next.changeLanguage(currentLanguage, () => {
            _this.setState(Object.assign(_this.getTextTranslations(nextProps)), () => _this.getTableColumns());
          }); // -> returns a Promise
        }
        if (nextProps.search.sf && this.state.selectedShift !== nextProps.search.sf) {
          _this.setState(Object.assign(_this.getTextTranslations(nextProps)), () => _this.getTableColumns())
        }

        this.setState({
          selectedDate: nextProps.search.dt || getCurrentTime(),
          selectedMachine: nextProps.search.mc || this.state.selectedMachine,
          currentLanguage: nextProps.search.ln || this.state.currentLanguage,
          selectedShift: nextProps.search.sf || this.state.selectedShift,
          selectedMachineType: nextProps.search.tp || this.state.selectedMachineType,
          selectedHour: nextProps.search.hr,
          expanded: {},
        }, async () => { await _this.fetchData([_this.state.selectedMachine, _this.state.selectedDate, _this.state.selectedShift]) });
      }
    } else {
      this.openModal('order');
    }
  }

  fetchData = (data) => {
    if (this.state.summary) {
      this.loadDataAllShift(data);
    } else {
      this.loadDataCurrentShift(data);
    }
  }

  loadDataAllShift(filter) {

    const logoffHour = formatNumber(moment(getCurrentTime()).format('HH:mm').toString().slice(3, 5));
    var minutes = moment().minutes();

    let signoff_reminder = config['first_signoff_reminder'].includes(logoffHour);
    let errorModal = false;
    let errorMessage = '';
    let selectedShift = '';
    let selectedDate = '';

    if (logoffHour === config['second_signoff_reminder']) {
      if (this.state.logoffHourCheck === true && this.props.user.role === 'Operator') {
        errorModal = true;
        errorMessage = 'Please sign off for the previous hour';
      }
    }
    var tz = this.state.commonParams ? this.state.commonParams.value : this.props.user.current_shift;
    var est = moment().tz(tz).hours();
    if (minutes > 6 && localStorage.getItem("currentHour")) {
      if (localStorage.getItem("currentHour") !== est) {
        localStorage.removeItem("signoff");
        localStorage.removeItem("currentHour");
      }
    }

    if (filter && filter[0]) {

      let hr = moment().tz(this.props.user.timezone).hours();

      const parameters1 = {
        params: {
          mc: filter[0],
          dt: moment(filter[1]).format('YYYY/MM/DD') + ' 06:00',
          hr: hr
        }
      }
      const parameters2 = {
        params: {
          mc: filter[0],
          dt: moment(filter[1]).format('YYYY/MM/DD') + ' 08:00',
          hr: hr
        }
      }
      const parameters3 = {
        params: {
          mc: filter[0],
          dt: moment(filter[1]).format('YYYY/MM/DD') + ' 16:00',
          hr: hr
        }
      }


      const parameters = {
        params: {
          mc: filter[0],
          dt: formatDate(filter[1]).split("-").join(""),
          sf: mapShift(filter[2]),
          hr: hr
        }
      }



      let requestData = [
        BuildGet(`${API}/data`, parameters1),
        BuildGet(`${API}/data`, parameters2),
        BuildGet(`${API}/data`, parameters3),
        BuildGet(`${API}/intershift_communication`, parameters)
      ];

      let _this = this;

      axios.all(requestData).then(
        axios.spread((responseData1, responseData2, responseData3, responseIntershift) => {

          let shift3 = {
            'hour_interval': this.props.t('3rd Shift'), 'summary_product_code': this.state.partNumberText, 'summary_ideal': this.state.idealText,
            'summary_target': this.state.targetText, 'summary_actual': this.state.actualText, 'cumulative_target_pcs': this.state.cumulativeTargetText,
            'cumulative_pcs': this.state.cumulativeActualText, 'timelost_summary': this.state.timeLostText, 'latest_comment': this.state.commentsActionText,
            'oper_id': this.state.operatorText, 'superv_id': this.state.supervisorText
          };

          let shift1 = {
            'hour_interval': this.props.t('1st Shift'), 'summary_product_code': this.state.partNumberText, 'summary_ideal': this.state.idealText,
            'summary_target': this.state.targetText, 'summary_actual': this.state.actualText, 'cumulative_target_pcs': this.state.cumulativeTargetText,
            'cumulative_pcs': this.state.cumulativeActualText, 'timelost_summary': this.state.timeLostText, 'latest_comment': this.state.commentsActionText,
            'oper_id': this.state.operatorText, 'superv_id': this.state.supervisorText
          };

          let shift2 = {
            'hour_interval': this.props.t('2nd Shift'), 'summary_product_code': this.state.partNumberText, 'summary_ideal': this.state.idealText,
            'summary_target': this.state.targetText, 'summary_actual': this.state.actualText, 'cumulative_target_pcs': this.state.cumulativeTargetText,
            'cumulative_pcs': this.state.cumulativeActualText, 'timelost_summary': this.state.timeLostText, 'latest_comment': this.state.commentsActionText,
            'oper_id': this.state.operatorText, 'superv_id': this.state.supervisorText
          };

          let data = _.concat(
            [shift3],
            _.orderBy(responseData1.data, ['hour_interval_start', 'start_time']),
            [shift1],
            _.orderBy(responseData2.data, ['hour_interval_start', 'start_time']),
            [shift2],
            _.orderBy(responseData3.data, ['hour_interval_start', 'start_time']));
          let comments = responseIntershift.data;

          if (data instanceof Object) {
            selectedShift = mapShiftReverse(filter[2]);
            selectedDate = filter[1];
          }

          _this.setState({ signoff_reminder, errorModal, errorMessage, data, selectedShift, selectedDate, comments });

        })
      ).catch(function (error) {
        console.log(error);
      });
    }

  }

  loadDataCurrentShift(filter) {
    const logoffHour = formatNumber(moment(getCurrentTime()).format('HH:mm').toString().slice(3, 5));
    var minutes = moment().minutes();

    let signoff_reminder = config['first_signoff_reminder'].includes(logoffHour);
    let errorModal = false;
    let errorMessage = '';
    let selectedShift = '';
    let selectedDate = '';

    if (logoffHour === config['second_signoff_reminder']) {
      if (this.state.logoffHourCheck === true && this.props.user.role === 'Operator') {
        errorModal = true;
        errorMessage = 'Please sign off for the previous hour';
      }
    }
    var tz = this.state.commonParams ? this.state.commonParams.value : this.props.user.timezone;
    var est = moment().tz(tz).hours();
    if (minutes > 6 && localStorage.getItem("currentHour")) {
      if (localStorage.getItem("currentHour") !== est) {
        localStorage.removeItem("signoff");
        localStorage.removeItem("currentHour");
      }
    }

    if (filter && filter[0]) {


      const parameters = {
        params: {
          mc: filter[0],
          dt: formatDate(filter[1]).split("-").join(""),
          sf: mapShift(filter[2]),
          hr: moment().tz(this.props.user.timezone).hours()
        }
      }
      let requestData = [
        BuildGet(`${API}/data`, parameters),
        BuildGet(`${API}/intershift_communication`, parameters)
      ];

      let _this = this;

      axios.all(requestData).then(
        axios.spread((responseData, responseIntershift) => {

          let data = responseData.data;
          let comments = responseIntershift.data;

          if (data instanceof Object) {
            data = _.orderBy(data, ['hour_interval_start', 'start_time']);
            selectedShift = mapShiftReverse(filter[2]);
            selectedDate = filter[1];
          }

          _this.setState({ signoff_reminder, errorModal, errorMessage, data, selectedShift, selectedDate, comments });

        })
      ).catch(function (error) {
        console.log(error);
      });
    }
  }

  changeDate(e) {
    let _this = this;
    const date = e;
    const parsedDate = moment(date).locale(this.state.currentLanguage).format('YYYY/MM/DD HH:ss');
    this.setState({ selectedDate: date, selectedDateParsed: parsedDate }, () => { _this.fetchData([_this.state.selectedMachine, _this.state.selectedDate, _this.state.selectedShift]); });
  }

  changeMachine(e) {
    let _this = this;
    this.setState({ selectedMachine: e }, () => { _this.fetchData([_this.state.selectedMachine, _this.state.selectedDate, _this.state.selectedShift]); });
  }

  changeLanguage(e) {
    e = e.split('_')[0]
    const date = this.state.selectedDate ? this.state.selectedDate : new Date();
    let parsedDate = moment(date).locale(e).format('YYYY/MM/DD HH:ss');
    this.setState({ selectedDateParsed: parsedDate })
    this.fetchData();
  }

  onExpandedChange(newExpanded) {
    this.setState({
      expanded: newExpanded
    });
  }

  clearExpanded = () => {
    this.setState({
      expanded: {}
    });
  }

  openAfter(e) {
    this.setState({
      modal_values_IsOpen: false,
      modal_comments_IsOpen: false,
      modal_dropdown_IsOpen: true,
    })
  }

  headerData(e) {
    let _this = this;
    this.setState({ selectedShift: e }, () => { _this.fetchData([_this.state.selectedMachine, _this.state.selectedDate, _this.state.selectedShift]); });
  }

  getHeader(text) {
    return <span className={'wordwrap'} data-tip={text}>{text}</span>
  }

  getStyle(applyGrey, align, rowInfo, column) {
    let style = {};
    let rowValid = rowInfo ? (rowInfo.subRows ? rowInfo.subRows[0] : rowInfo.row) : null;

    if (applyGrey) {
      style = {
        backgroundColor: 'rgb(247, 247, 247)',
        borderRight: 'solid 1px rgb(219, 219, 219)',
        borderLeft: 'solid 1px rgb(219, 219, 219)',
        borderTop: 'solid 1px rgb(219, 219, 219)',
        textAlign: align
      }
    } else {
      style = {
        textAlign: align,
        borderRight: 'solid 1px rgb(219, 219, 219)',
        borderTop: 'solid 1px rgb(219, 219, 219)'
      }
    }

    if (rowValid && (rowValid.hour_interval === this.props.t('3rd Shift') || rowValid.hour_interval === this.props.t('1st Shift') || rowValid.hour_interval === this.props.t('2nd Shift'))) {
      style.textAlign = 'center';
      style.borderRight = 'solid 1px rgb(219, 219, 219)';
      style.borderTop = 'solid 1px rgb(219, 219, 219)';
      style.backgroundColor = 'white';
    } else if (rowValid && column.id === 'actual_pcs' && !moment(rowValid._original.hour_interval_start).isAfter(getCurrentTime())) {
      style.backgroundColor = (Number(rowValid.actual_pcs) === 0 && Number(rowValid.target_pcs) === 0) || (Number(rowValid.actual_pcs) < Number(rowValid.target_pcs)) ? '#b80600' : 'green';
      style.backgroundImage = (Number(rowValid.actual_pcs) === 0 && Number(rowValid.target_pcs) === 0) || (Number(rowValid.actual_pcs) < Number(rowValid.target_pcs)) ? 'url("../dark-circles.png")' :
        'url("../arabesque.png")';
      style.color = 'white';

    } else if (rowValid && column.id === 'cumulative_pcs' && rowInfo.subRows && !moment(rowInfo.subRows[0]._original.hour_interval_start).isAfter(getCurrentTime())) {
      style.backgroundColor = (Number(rowValid.cumulative_pcs) === 0) || (Number(rowValid.cumulative_pcs) < Number(rowValid.cumulative_target_pcs)) ? '#b80600' : 'green';
      style.backgroundImage = (Number(rowValid.cumulative_pcs) === 0) || (Number(rowValid.cumulative_pcs) < Number(rowValid.cumulative_target_pcs)) ? 'url("../dark-circles.png")' :
        'url("../arabesque.png")';
      style.color = 'white';

    } else if (rowValid && column.id === 'timelost_summary' && rowInfo.subRows && this.getTimeLostToSet(rowInfo) && Math.round(rowInfo.row._subRows[0]._original.allocated_time) !== 0) {

      style.backgroundColor = '#b80600';
      style.backgroundImage = 'url("../dark-circles.png")';
      style.color = 'white';

    } else {
      style.whiteSpace = 'normal!important';
    }
    return rowInfo ? { style } : style;
  }

  renderCell(cellInfo, prop, defaultValue, displayClick, displayEmptyClick) {
    if (cellInfo.original !== undefined) {
      return <span className="react-table-click-text table-click" onClick={() => displayClick ? this.openModal(arguments[5], cellInfo.original, prop, cellInfo.subRows !== undefined) : {}}>{cellInfo.original[prop] || defaultValue}</span>;
    } else {
      return <span style={{ paddingRight: '90%', cursor: 'pointer' }} className={'empty-field'} onClick={() => displayClick && displayEmptyClick ? this.openModal(arguments[5], cellInfo, prop, cellInfo.subRows !== undefined) : {}}></span>;
    }
  }

  renderAggregated(cellInfo, prop, defaultValue, orderChild, displayClick) {
    let newCellInfo = Object.assign({}, cellInfo);
    if (orderChild && newCellInfo.subRows.length > 1) {
      let newSubrows = _.orderBy(cellInfo.subRows, cellInfo.subRows.map((item) => item._original.start_time));
      newCellInfo.subRows = newSubrows;
    }
    let rowValid = newCellInfo ? (newCellInfo.subRows ? newCellInfo.subRows[0] : newCellInfo.row) : null;
    if (rowValid && (rowValid.hour_interval === this.props.t('3rd Shift') || rowValid.hour_interval === this.props.t('1st Shift') || rowValid.hour_interval === this.props.t('2nd Shift'))) {
      prop = arguments[5] === 'dropdown' ? 'timelost_summary' : arguments[5] === 'comments' ? 'latest_comment' : prop;
      return <span className={'wordwrap'} data-tip={newCellInfo.subRows[0]._original[prop]}>{newCellInfo.subRows[0]._original[prop]}</span>
    }
    if (newCellInfo.subRows[0] !== undefined && newCellInfo.subRows[0]._original[prop] !== '') {
      if (prop !== '' || defaultValue !== '') {
        return <span className="react-table-click-text table-click" onClick={() => displayClick ? this.openModal(arguments[5], cellInfo.subRows[0]._original, prop, cellInfo.subRows.length > 1) : {}}>{newCellInfo.subRows[0]._original[prop] || defaultValue}</span>;
      } else {
        return <span style={{ paddingRight: '90%', cursor: 'pointer' }} className={'empty-field'} onClick={() => displayClick ? this.openModal(arguments[5], cellInfo.subRows[0]._original, prop, cellInfo.subRows.length > 1) : {}}></span>;
      }
    } else {
      return <span style={{ paddingRight: '90%', cursor: 'pointer' }} className={'empty-field'} onClick={() => displayClick ? this.openModal(arguments[5], cellInfo.subRows[0]._original, prop, cellInfo.subRows.length > 1) : {}}></span>;
    }
  }

  getTimeLostToSet(cellInfo) {
    return moment(getCurrentTime()).isSame(moment(cellInfo.subRows[0]._original.hour_interval_start), 'hours') ||
      !moment(getCurrentTime()).isBefore(moment(cellInfo.subRows[0]._original.hour_interval_start), 'hours') ? formatNumber(cellInfo.subRows[0]._original.unallocated_time) : null;
  }

  getCommentsToSet(cellInfo) {
    return cellInfo.subRows[0]._original.actions_comments ? cellInfo.subRows[0]._original.actions_comments.length > 1 ? cellInfo.subRows[0]._original.actions_comments[0].comment
      + ` (${(cellInfo.subRows[0]._original.actions_comments.length - 1)}+ more)` : cellInfo.subRows[0]._original.actions_comments[0].comment : '';
  }

  renderAggregatedSignOff(cellInfo, prop, role) {
    if (cellInfo.subRows[0]._original[prop] !== null && cellInfo.subRows[0]._original[prop] !== '') {
      return <span className="react-table-click-text table-click" onClick={() => isComponentValid(this.props.user.role, role) && !this.state.summary ? this.openModal(arguments[3], cellInfo.subRows[0]._original, arguments[4], cellInfo.subRows.length > 1) : void (0)}>
        {cellInfo.subRows[0]._original[prop]}
      </span>
    } else {
      return <span style={
        (!moment(cellInfo.subRows[0]._original.hour_interval_start).isSame(getCurrentTime(), 'hours') && this.state.signoff_reminder) ?
          { paddingRight: '90%', cursor: 'pointer' } :
          { paddingRight: '80%', cursor: 'pointer' }}
        className={'empty-field'} onClick={() =>
          isComponentValid(this.props.user.role, role) && !this.state.summary ? this.openModal(arguments[3], cellInfo.subRows[0]._original, arguments[4], cellInfo.subRows.length > 1) : void (0)}>
        {!moment(cellInfo.subRows[0]._original.hour_interval_start).isSame(moment(getCurrentTime()).add(-1, 'hours'), 'hours') ? '' :
          this.state.signoff_reminder === true ? <span style={{ textAlign: 'center' }}><FontAwesome name="warning" className={'signoff-reminder-icon'} /></span> : null}
      </span>;
    }
  }

  getExpandClick(state, rowInfo, column) {
    // this deletes the first repeated row in children section
    // rowInfo.subRows && rowInfo.subRows.length > 1 ? delete rowInfo.subRows[0]: void(0);
    // end of fix
    const needsExpander = rowInfo && rowInfo.subRows && rowInfo.subRows.length > 1;
    const expanderEnabled = !column.disableExpander;
    const expandedRows = Object.keys(this.state.expanded).filter(expandedIndex => {
      return this.state.expanded[expandedIndex] !== false;
    }).map(Number);
    const rowIsExpanded = rowInfo && expandedRows.includes(rowInfo.nestingPath[0]) && needsExpander;
    const newExpanded = !needsExpander
      ? this.state.expanded
      : rowIsExpanded && expanderEnabled
        ? {
          ...this.state.expanded,
          [rowInfo.nestingPath[0]]: false
        }
        : {
          ...this.state.expanded,
          [rowInfo.nestingPath[0]]: {}
        };
    return {
      style:
        needsExpander && expanderEnabled
          ? { cursor: "pointer" }
          : { cursor: "auto" },
      onClick: (e, handleOriginal) => {
        this.setState({
          expanded: newExpanded
        });
      }
    };
  }

  getTableColumns() {
    let columns = [
      {
        Header: "",
        width: 35,
        filterable: false,
        resizable: false,
        sortable: false,
        Aggregated: cellInfo => {
          const needsExpander =
            cellInfo.subRows && cellInfo.subRows.length > 1 ? true : false;
          const expanderEnabled = !cellInfo.column.disableExpander;
          return needsExpander && expanderEnabled ? (
            <div
              className={classNames("rt-expander", cellInfo.isExpanded && "-open")}
            >
              &bull;
            </div>
          ) : null;
        },
        getProps: (state, rowInfo, column) => this.getExpandClick(state, rowInfo, column)
      },
      { pivot: true },
      {
        Header: this.getHeader(this.state.shiftText),
        accessor: 'hour_interval',
        minWidth: 130,
        //style: this.getStyle(true, 'left'),
        Pivot: (row) => {
          let rowValid = row ? (row.subRows ? row.subRows[0] : row.row) : null;
          if (rowValid && (rowValid.hour_interval === this.props.t('3rd Shift') || rowValid.hour_interval === this.props.t('1st Shift') || rowValid.hour_interval === this.props.t('2nd Shift'))) {
            return <span className={'wordwrap'} data-tip={row.value}>{row.value}</span>
          } else {
            return <span>{moment(row.subRows[0]._original.hour_interval_start).isSame(getCurrentTime(), 'hours') ? row.value + '*' : row.value}</span>
          }
        },
        disableExpander: false,
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ["hour_interval"] }),
        filterAll: true,
        getProps: (state, rowInfo, column) => {
          let style = this.getStyle(true, 'left', rowInfo, column);
          let style1 = this.getExpandClick(state, rowInfo, column);
          if (style.style && style1.style) {
            style.style.cursor = style1.style.cursor;
          }
          style1.style = style.style;
          return style1;
        }
        //getProps: (state, rowInfo, column) => this.getExpandClick(state, rowInfo, column)
      }, {
        Header: this.getHeader(this.state.partNumberText),
        minWidth: 180,
        accessor: 'product_code',
        Cell: c => this.renderCell(c, 'product_code', '', true, false, 'manualentry'),
        Aggregated: a => this.renderAggregated(a, 'summary_product_code', '', true, true, 'manualentry'),
        //style: this.getStyle(false, 'center'),
        PivotValue: <span>{''}</span>,
        //getProps: (state, rowInfo, column) => this.getStyleHeaderRow(state, rowInfo, column)
        getProps: (state, rowInfo, column) => this.getStyle(false, 'center', rowInfo, column)
      }, {
        Header: this.getHeader(this.state.idealText),
        accessor: 'ideal',
        minWidth: 90,
        Cell: c => this.renderCell(c, 'ideal', '0', true, true, 'values', c.original),
        Aggregated: a => this.renderAggregated(a, 'summary_ideal', '', false, false),
        //style: this.getStyle(false, 'center')
        getProps: (state, rowInfo, column) => this.getStyle(false, 'center', rowInfo, column)
      }, {
        Header: this.getHeader(this.state.targetText),
        accessor: 'target_pcs',
        minWidth: 90,
        Cell: c => this.renderCell(c, 'target_pcs', !moment(c.original.hour_interval_start).isAfter(getCurrentTime()) ? 0 : null, false, false),
        Aggregated: a => this.renderAggregated(a, 'summary_target', !moment(a.subRows[0]._original.hour_interval_start).isAfter(getCurrentTime()) ? 0 : null, false, false),
        //style: this.getStyle(true, 'center'),
        //getProps: (state, rowInfo, column) => this.getStyleHeaderRow(state, rowInfo, column)
        getProps: (state, rowInfo, column) => this.getStyle(true, 'center', rowInfo, column)
      }, {
        Header: this.getHeader(this.state.actualText),
        accessor: 'actual_pcs',
        minWidth: 90,
        Cell: c => this.renderCell(c, 'actual_pcs', !moment(c.original.hour_interval_start).isAfter(getCurrentTime()) ? 0 : null, true, true, 'values'),
        Aggregated: a => this.renderAggregated(a, 'summary_actual', !moment(a.subRows[0]._original.hour_interval_start).isAfter(getCurrentTime()) ? 0 : null, false, true, 'values'),
        getProps: (state, rowInfo, column) => this.getStyle(false, 'center', rowInfo, column)
      }, {
        Header: this.getHeader('Scrap'),
        accessor: 'scrap',
        minWidth: 90,
        Aggregated: a => this.renderAggregated(a, 'scrap', 25, false, false),
        getProps: (state, rowInfo, column) => this.getStyle(false, 'center', rowInfo, column)
      }, {
        Header: this.getHeader(this.state.cumulativeTargetText),
        accessor: 'cumulative_target_pcs',
        minWidth: 90,
        Cell: c => this.renderCell(c, 'cumulative_target_pcs', !moment(c.original.hour_interval_start).isAfter(getCurrentTime()) ? 0 : null, false, false),
        Aggregated: a => this.renderAggregated(a, 'cumulative_target_pcs', !moment(a.subRows[0]._original.hour_interval_start).isAfter(getCurrentTime()) ? 0 : null, false, false),
        //style: this.getStyle(true, 'center'),
        getProps: (state, rowInfo, column) => this.getStyle(true, 'center', rowInfo, column)
      }, {
        Header: this.getHeader(this.state.cumulativeActualText),
        accessor: 'cumulative_pcs',
        minWidth: 90,
        Cell: c => this.renderCell(c, '', '', false, false),
        Aggregated: a => this.renderAggregated(a, 'cumulative_pcs', !moment(a.subRows[0]._original.hour_interval_start).isAfter(getCurrentTime()) ? 0 : null, false, false),
        getProps: (state, rowInfo, column) => this.getStyle(false, 'center', rowInfo, column)
      }, {
        Header: this.getHeader(this.state.timeLostText),
        accessor: 'timelost_summary',
        minWidth: 100,
        Cell: c => this.renderCell(c, '', '', false, false),
        Aggregated: a => this.renderAggregated(a, '', this.getTimeLostToSet(a), false, true, 'dropdown'),
        getProps: (state, rowInfo, column) => this.getStyle(false, 'center', rowInfo, column)
      }, {
        Header: this.getHeader(this.state.commentsActionText),
        accessor: 'latest_comment',
        Cell: c => this.renderCell(c, '', '', false, false),
        Aggregated: a => this.renderAggregated(a, '', this.getCommentsToSet(a), false, true, 'comments'),
        //style: this.getStyle(false, 'center')
        getProps: (state, rowInfo, column) => this.getStyle(false, 'center', rowInfo, column)
      }
    ];

    if (!this.state.summary) {
      columns.push({
        Header: this.getHeader(this.state.operatorText),
        accessor: 'oper_id',
        minWidth: 90,
        Cell: c => this.renderCell(c, '', '', false, false),
        Aggregated: a => this.renderAggregatedSignOff(a, 'oper_id', 'operator_signoff', 'signoff', 'operator'),
        //style: this.getStyle(false, 'center')
        getProps: (state, rowInfo, column) => this.getStyle(false, 'center', rowInfo, column)
      });
      columns.push({
        Header: this.getHeader(this.state.supervisorText),
        accessor: 'superv_id',
        minWidth: 90,
        Cell: c => this.renderCell(c, '', '', false, false),
        Aggregated: a => this.renderAggregatedSignOff(a, 'superv_id', 'supervisor_signoff', 'signoff', 'supervisor'),
        //style: this.getStyle(false, 'center')
        getProps: (state, rowInfo, column) => this.getStyle(false, 'center', rowInfo, column)
      });
    }

    this.setState({ columns });
  }

  render() {
    const columns = this.state.columns;
    const machine = this.state.selectedMachine;
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
            selectedShift={this.state.selectedShift}
            selectedDate={this.state.selectedDate}
            selectedMachine={this.state.selectedMachine}
            timezone={this.state.timezone}
            t={t}
            history={this.props.history}
            search={this.props.search}
            clearExpanded={this.clearExpanded}
            currentHour={this.state.currentHour}
            shifts={this.state.shifts}
          /> : null}
        <div className="wrapper-main">
          <Row>
            <Col md={12} lg={12} id="dashboardOne-table">
              <Row style={{ paddingLeft: '5%' }}>
                <Col md={3}><h5>{t('Day by Hour Tracking')}</h5></Col>
                <Col md={3}><h5>{t('Machine/Cell')}: {machine}</h5></Col>
                <Col md={3}><h5 style={{ textTransform: 'Capitalize' }}>{this.props.user.first_name ?
                  `${this.props.user.first_name} ${this.props.user.last_name.charAt(0)}, ` : void (0)}{`(${this.props.user.role})`}</h5></Col>
                <Col md={3}><h5 style={{ fontSize: '1.0em' }}>{'Showing Data for: '}
                  {!_.isEmpty(this.state.data) ? this.state.selectedShift === '3rd Shift' ?
                    moment(this.state.selectedDate).add(1, 'days').locale(this.state.currentLanguage).format('LL') :
                    moment(this.state.selectedDate).locale(this.state.currentLanguage).format('LL') : null}</h5></Col>
                {/* {moment(this.state.selectedDate).locale(this.state.currentLanguage).format('LL')}</h5></Col> */}
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
                  defaultPageSize={this.state.summary ? 27 : 8}
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
        <ValueModal
          isOpen={this.state.modal_values_IsOpen}
          //  onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={this.state.modalStyle}
          contentLabel="Example Modal"
          currentVal={isNaN(this.state.valueToEdit) ? undefined : this.state.valueToEdit}
          cumulativepcs={this.state.cumulative_pcs}
          formType={this.state.modalType}
          t={t}
          user={this.props.user}
          currentRow={this.state.currentRow}
          Refresh={this.fetchData}
          parentData={[this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift, this.state.selectedHour]}
          timezone={this.state.timezone}
          readOnly={this.state.summary}
        />
        <CommentsModal
          isOpen={this.state.modal_comments_IsOpen}
          //  onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={this.state.modalStyle}
          contentLabel="Example Modal"
          t={t}
          comments={this.state.current_display_comments}
          currentRow={this.state.currentRow}
          user={this.props.user}
          Refresh={this.fetchData}
          parentData={[this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift, this.state.selectedHour]}
          selectedDate={this.state.selected}
          IsEditable={this.state.comments_IsEditable && !this.state.summary}
          timezone={this.state.timezone}
        />
        <TimelossModal
          isOpen={this.state.modal_dropdown_IsOpen}
          //  onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={this.state.modalStyle}
          contentLabel="Example Modal"
          t={t}
          label={t('Search/Select Reason Code')}
          timelost={this.state.current_display_timelost}
          machine={this.state.selectedMachine}
          currentRow={this.state.currentRow}
          user={this.props.user}
          Refresh={this.fetchData}
          parentData={[this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift, this.state.selectedHour]}
          isEditable={this.state.timelost_IsEditable && !this.state.summary}
          timezone={this.state.timezone}
        />
        <SignoffModal
          isOpen={this.state.modal_signoff_IsOpen}
          //  onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          contentLabel="Example Modal"
          t={this.props.t}
          currentRow={this.state.currentRow}
          user={this.props.user}
          Refresh={this.fetchData}
          parentData={[this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift, this.state.selectedHour]}
          signOffRole={this.state.signOffRole}
          timezone={this.state.timezone}
        />
        <OrderModal
          isOpen={this.state.modal_order_IsOpen}
          isOpenTwo={this.state.modal_order_two_IsOpen}
          open={this.openModal}
          onRequestClose={this.closeModal}
          style={this.state.modalStyle}
          contentLabel="Example Modal"
          currentVal={isNaN(this.state.valueToEdit) ? undefined : this.state.valueToEdit}
          formType={this.state.modalType}
          t={t}
          label={'Scan Order Number'}
          user={this.props.user}
          Refresh={this.fetchData}
          parentData={[this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift, this.state.selectedHour]}
          showValidateDataModal={this.showValidateDataModal}
          timezone={this.state.timezone}
        />
        <ManualEntryModal
          isOpen={this.state.modal_manualentry_IsOpen}
          //onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={this.state.modalStyle}
          contentLabel="Example Modal"
          t={t}
          timelost={this.state.current_display_timelost}
          machine={this.state.selectedMachine}
          currentRow={this.state.currentRow}
          user={this.props.user}
          Refresh={this.fetchData}
          parentData={[this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift, this.state.selectedHour]}
          timezone={this.state.timezone}
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

export default DashboardOne;