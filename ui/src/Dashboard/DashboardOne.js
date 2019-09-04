import React from 'react';
import './dashboard.scss';
import '../sass/tooltip.scss'
import Header from '../Layout/Header';
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
import OrderTwoModal from '../Layout/OrderTwoModal';
import ManualEntryModal from '../Layout/ManualEntryModal';
import Spinner from '../Spinner';
import Comments from './Comments';
import Pagination from '../Layout/Pagination';
import openSocket from 'socket.io-client';
import {
  getRequestData,
  getIntershift,
  formatDate,
  isComponentValid,
  mapShiftReverse,
  isFieldAllowed,
  mapShift
} from '../Utils/Requests';
import { handleTableCellClick } from "./tableFunctions";
import classNames from "classnames";
import matchSorter from "match-sorter";
import * as _ from 'lodash';
import config from '../config.json';
import { SOCKET } from '../Utils/Constants';
import('moment/locale/es');


class DashboardOne extends React.Component {
  constructor(props) {
    super(props);
    var hour = (new Date().getHours());
    let shiftByHour;
    if (hour >= 7 && hour < 15) {
      shiftByHour = '1st Shift';
    } else if (hour >= 15 && hour < 23) {
      shiftByHour = '2nd Shift';
    } else {
      shiftByHour = '3rd Shift';
    }
    this.state = {
      data: [],
      columns: [],
      modalStyle: {},
      modal_values_IsOpen: false,
      modal_authorize_IsOpen: false,
      modal_comments_IsOpen: false,
      modal_dropdown_IsOpen: false,
      modal_signoff_IsOpen: false,
      modal_order_IsOpen: false,
      modal_manualentry_IsOpen: false,
      valid_barcode: false,
      barcode: 1001,
      dataCall: {},
      selectedDate: props.search.dt || moment().format('YYYY/MM/DD'),
      selectedDateParsed: '',
      selectedMachine: props.search.mc || config['machine'],
      currentLanguage: props.search.ln || config['language'],
      valueToEdit: '',
      modalType: '',
      expanded: {},
      openDropdownAfter: false,
      selectedShift: props.search.sf || shiftByHour,
    }
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this.changeDate = this.changeDate.bind(this);
    this.changeMachine = this.changeMachine.bind(this);
    this.changeLanguage = this.changeLanguage.bind(this);
    this.handleTableCellClick = handleTableCellClick.bind(this);
    this.onExpandedChange = this.onExpandedChange.bind(this);
    this.openAfter = this.openAfter.bind(this);
    this.headerData = this.headerData.bind(this);
    this.getDashboardData = this.getDashboardData.bind(this);
    this.showValidateDataModal = this.showValidateDataModal.bind(this);
  }

  showValidateDataModal(data) {
    this.setState({
      modal_order_IsOpen: false,
      modal_order_two_IsOpen: true,
      orderTwo_data: data[0].OrderData
    })
  }

  openModal(type, val, extraParam) {
    let value = ''
    let modalType = ''
    if (type === 'order') {
      this.setState({
        modal_order_IsOpen: true,
      })
    }
    if (type === 'values') {
      if (val) {
        if (val.props) {
          if (isNaN(val.props.value)) {
            value = val.props.value === null ? undefined : val.props.value;
            modalType = 'text'
          } else {
            value = parseInt(val.props.value)
            modalType = 'number'
          }
        }
        let currentRow = {};
        if (val.props.row._subRows) {
          currentRow = val.props.row._subRows[0]._original;
        } else {
          currentRow = val.props.row._original;
        }
        if (!val.props.row._subRows || val.props.row._subRows.length === 1) {
          let allowed = false;
          if (extraParam === 'actual') {
            allowed = isFieldAllowed(this.props.user.role, val.props.row);
          }
          this.setState({
            modal_values_IsOpen: allowed,
            modal_comments_IsOpen: false,
            modal_dropdown_IsOpen: false,
            valueToEdit: value,
            modalType,
            currentRow: val ? val.props ? currentRow : undefined : undefined
          })
        }
      } else {
        let allowed;
        if (extraParam === 'actual') {
          allowed = isFieldAllowed(this.props.user.role, val.props.row);
        }
        this.setState({
          valueToEdit: value,
          modal_values_IsOpen: allowed,
          modal_comments_IsOpen: false,
          modal_dropdown_IsOpen: false,
          currentRow: val ? val : undefined
        })
      }
    }
    if (type === 'comments') {
      if (val) {
        if (val.row._subRows) {
          const comments = _.sortBy(val.row._subRows[0]._original.actions_comments, 'last_modified_on').reverse();
          this.setState({
            current_display_comments: comments,
            currentRow: val.row._subRows[0]._original
          })
        }
      }
      this.setState({
        modal_authorize_IsOpen: false,
        modal_comments_IsOpen: true,
        modal_values_IsOpen: false,
        modal_dropdown_IsOpen: false,
        modal_signoff_IsOpen: false,
        modal_order_IsOpen: false,
        modal_order_two_IsOpen: false,
      });
    }
    if (type === 'dropdown') {
      if (val) {
        const timelost = val.row._subRows[0]._original.timelost;
        this.setState({
          modal_values_IsOpen: false,
          modal_comments_IsOpen: false,
          modal_dropdown_IsOpen: true,
          current_display_timelost: timelost,
          currentRow: val.row._subRows[0]._original,

        })
      }
    }
    if (type === 'manualentry') {
      if (val) {
        if (isComponentValid(this.props.user.role, 'manualentry')) {
          this.setState({
            modal_values_IsOpen: false,
            modal_comments_IsOpen: false,
            modal_dropdown_IsOpen: false,
            modal_manualentry_IsOpen: true,
            currentRow: val.row._subRows[0]._original,
          })
        }
      }
    }
    if (type === 'signoff') {
      if (val) {
        if (val.props) {
          if (val.props.row._subRows) {
            this.setState({
              modal_signoff_IsOpen: true,
              currentRow: val.props.row._subRows[0]._original,
              signOffRole: extraParam ? extraParam : null,
            })
          }
        }
      } else {
        this.setState({
          modal_signoff_IsOpen: true,
          signOffRole: extraParam ? extraParam : null,
        })
      }
    }
  }

  closeModal() {
    this.setState({
      modal_authorize_IsOpen: false,
      modal_comments_IsOpen: false,
      modal_values_IsOpen: false,
      modal_dropdown_IsOpen: false,
      modal_signoff_IsOpen: false,
      modal_order_IsOpen: false,
      modal_order_two_IsOpen: false,
      modal_manualentry_IsOpen: false
    });
  }

  async componentDidMount() {
    let currentLanguage = this.state.currentLanguage.toLowerCase();
    currentLanguage = currentLanguage.replace('-', '_')
    i18next.changeLanguage(currentLanguage, () => console.log('Changed the language to ' + currentLanguage)); // -> returns a Promise
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
    this.setState({ modalStyle, selectedDate: this.state.selectedDate, selectedDateParsed: x })
    this.fetchData([this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift]);

    const socket = openSocket.connect(SOCKET);
    socket.on('connect', () => console.log('Connected to the Websocket Service'));
    socket.on('disconnect', () => console.log('Disconnected from the Websocket Service'));
    try {
      socket.on('message', response => {
        console.log('Message from socket service. To be tested in deployed version and removed after.');
        if (response.message === true) {
          if ((this.state.modal_authorize_IsOpen === false) &&
            (this.state.modal_comments_IsOpen === false) &&
            (this.state.modal_dropdown_IsOpen === false) &&
            (this.state.modal_order_IsOpen === false) &&
            (this.state.modal_signoff_IsOpen === false) &&
            (this.state.modal_values_IsOpen === false) &&
            (this.state.modal_order_two_IsOpen === false)
          ) {
            this.fetchData([this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift]);
          }
        }
      });
    } catch (e) { console.log(e) }
  };

  componentWillReceiveProps(nextProps) {
    var hour = (new Date().getHours());
    let shiftByHour;
    if (hour >= 7 && hour < 15) {
      shiftByHour = '1st Shift';
    } else if (hour >= 15 && hour < 23) {
      shiftByHour = '2nd Shift';
    } else {
      shiftByHour = '3rd Shift';
    };
    let _this = this;
    this.setState({
      selectedDate: nextProps.search.dt || moment().format('YYYY/MM/DD'),
      selectedMachine: nextProps.search.mc || config['machine'],
      currentLanguage: nextProps.search.ln || config['language'],
      selectedShift: nextProps.search.sf || shiftByHour
    }, async () => { await _this.fetchData([_this.state.selectedMachine, _this.state.selectedDate, _this.state.selectedShift]) });
  }

  changeLanguageBrowser = () => {
    let currentLanguage = this.state.currentLanguage.toLowerCase();
    currentLanguage = currentLanguage.replace('-', '_');
    i18next.changeLanguage(currentLanguage);
  }

  async fetchData(data) {
    const t = this.props.t;
    const columns = [
      {
        Header: "",
        width: 35,
        filterable: false,
        resizable: false,
        sortable: false,
        Aggregated: cellInfo => {
          // cellInfo.subRows.length > 1 ? 
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
        Cell: null
      },
      { pivot: true },
      {
        Header: () => <span
          className={'wordwrap'}
          data-tip={t(this.state.selectedShift)}>
          {this.state.selectedShift !== 'Select Shift' ? t(this.state.selectedShift) : t('First Shift')}</span>,
        accessor: 'hour_interval',
        minWidth: 150,
        style: {
          backgroundColor: 'rgb(247, 247, 247)',
          borderRight: 'solid 1px rgb(219, 219, 219)',
          borderLeft: 'solid 1px rgb(219, 219, 219)',
          borderTop: 'solid 1px rgb(219, 219, 219)'
        },
        Pivot: row => {
          return <span>{row.value}</span>;
        },
        disableExpander: false,
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ["hour_interval"] }),
        filterAll: true
      }, {
        Header: () => <span className={'wordwrap'}
          data-tip={t('Part Number')}>{t('Part Number')}</span>,
        minWidth: 180,
        accessor: 'product_code',
        Cell: props => (props.value === '' || props.value === null) ?
          <span
            style={{
              paddingRight: '90%',
              cursor: 'pointer'
            }}
            className={'empty-field'}></span> :
          <span className='ideal'>
            <span className="empty">{props.value}</span></span>,
        style: {
          textAlign: 'center',
          borderRight: 'solid 1px rgb(219, 219, 219)',
          borderTop: 'solid 1px rgb(219, 219, 219)'
        },
        // aggregate: (values, rows) => _.uniqWith(values, _.isEqual).join(", "),
        aggregate: (values, rows) => rows[0]._original.summary_product_code,
        Aggregated: props => (props.value === '' || props.value === null) ?
          <span style={{
            paddingRight: 180,
            cursor: 'pointer'
          }}
            className={'empty-field table-click'}
            onClick={() => this.openModal('manualentry', props)}></span> :
          <span className='ideal table-click' onClick={() => this.openModal('manualentry', props)}>
            <span className="empty">{props.value}</span></span>,
        PivotValue: <span>{''}</span>
      }, {
        Header: () => <span className={'wordwrap'} data-tip={t('Ideal')}>{t('Ideal')}</span>,
        accessor: 'ideal',
        minWidth: 90,
        Cell: props => (props.value === '' || props.value === null) ?
          <span style={{ paddingRight: '90%', cursor: 'pointer' }}
            className={'empty-field'} onClick={() => this.openModal('values')}></span> :
          <span className='ideal' onClick={() => this.openModal('values', { props })}>
            <span className="react-table-click-text table-click">{props.value}</span></span>,
        style: { textAlign: 'center', borderTop: 'solid 1px rgb(219, 219, 219)' },
        // aggregate: (values, rows) => _.uniqWith(values, _.isEqual).join(", "),
        aggregate: (values, rows) => rows[0]._original.summary_ideal,
        Aggregated: props => (props.value === '' || props.value === null) ?
          <span style={{ paddingRight: '90%', cursor: 'pointer' }} className={'empty-field'}></span> :
          <span className='ideal'>
            <span className="empty">{props.value}</span></span>
      }, {
        Header: () => <span className={'wordwrap'} data-tip={t('Target')}>{t('Target')}</span>,
        accessor: 'target_pcs',
        minWidth: 90,
        Cell: props => (props.value === '' || props.value === null) ? <span style={{ paddingRight: '90%', cursor: 'pointer' }} className={`empty-field`}></span> :
          <span>
            <span>{props.value}</span></span>,
        style: {
          backgroundColor: 'rgb(247, 247, 247)', borderRight: 'solid 1px rgb(219, 219, 219)', borderLeft: 'solid 1px rgb(219, 219, 219)', borderTop: 'solid 1px rgb(219, 219, 219)',
          textAlign: 'center'
        },
        // aggregate: (values, rows) => _.uniqWith(values, _.isEqual).join(", "),
        aggregate: (values, rows) => rows[0]._original.summary_target,
        Aggregated: props => (props.value === '' || props.value === null) ? <span style={{ paddingRight: '90%', cursor: 'pointer' }} className={'empty-field'}></span> :
          <span className='empty'>
            <span>{props.value}</span></span>
      }, {
        Header: () => <span className={'wordwrap'} data-tip={t('Actual')}>{t('Actual')}</span>,
        accessor: 'actual_pcs',
        minWidth: 90,
        Cell: props => (props.value === '' || props.value === null) ? <span style={{ paddingRight: '90%', cursor: 'pointer' }}
          onClick={() => this.openModal('values', null, 'actual')}></span> :
          <span className={`ideal`} onClick={() => this.openModal('values', { props }, 'actual')}>
            <span className="react-table-click-text table-click" style={{ color: 'white' }} >{props.value}</span></span>,
        style: { textAlign: 'center', borderTop: `solid 1px rgb(219, 219, 219)` },
        // aggregate: (values, rows) => values.length > 1 ? _.sum(values.map(Number)) : values[0],
        aggregate: (values, rows) => rows[0]._original.summary_actual,
        // aggregate: (values, rows) => console.log(rows),
        Aggregated: props => {
          return (props.value === '' || props.value === null) ?
            <span style={{ paddingRight: '90%', cursor: 'pointer' }} className={'empty-field'} onClick={() => this.openModal('values', { props }, 'actual')}></span> :
            <span className='ideal' onClick={() => this.openModal('values', { props }, 'actual')}>
              <span style={{ color: 'white' }} className="react-table-click-text table-click">{props.value}</span></span>
        }
      }, {
        Header: () => <span className={'wordwrap'} data-tip={t('Cumulative Target')}>{t('Cumulative Target')}</span>,
        accessor: 'cumulative_target_pcs',
        minWidth: 100,
        Cell: props => (props.value === '' || props.value === null) ? <span style={{ paddingRight: '90%', cursor: 'pointer' }} className={'empty-field'}></span> :
          <span className='empty'>
            <span>{props.value}</span></span>,
        style: {
          backgroundColor: 'rgb(247, 247, 247)', borderRight: 'solid 1px rgb(219, 219, 219)', borderLeft: 'solid 1px rgb(219, 219, 219)', borderTop: 'solid 1px rgb(219, 219, 219)',
          textAlign: 'center'
        },
        // aggregate: (values, rows) => _.uniqWith(values, _.isEqual).join(", "),
        aggregate: (values, rows) => rows[0]._original.cumulative_target_pcs,
        Aggregated: props => (props.value === '' || props.value === null) ? <span style={{ paddingRight: '90%', cursor: 'pointer' }} className={'empty-field'}></span> :
          <span className='empty'>
            <span>{props.value}</span></span>,
      }, {
        Header: () => <span className={'wordwrap'} data-tip={t('Cumulative Actual')}>{t('Cumulative Actual')}</span>,
        accessor: 'cumulative_pcs',
        minWidth: 100,
        Cell: props => (props.value === '' || props.value === null) ? <span style={{ paddingRight: '90%' }} className={'empty-field'}></span> :
          <span className='empty'>
            <span>{''}</span></span>,
        style: { borderRight: 'solid 1px rgb(219, 219, 219)', borderTop: 'solid 1px rgb(219, 219, 219)', textAlign: 'center', color: 'white' },
        // aggregate: (values, rows) => _.uniqWith(values, _.isEqual).join(", "),
        aggregate: (values, rows) => rows[0]._original.cumulative_pcs,
        Aggregated: props => (props.value === '' || props.value === null) ? <span style={{ paddingRight: '90%' }} className={'empty-field'}></span> :
          <span className='empty'>
            <span>{props.value}</span></span>
      }, {
        Header: () => <span className={'wordwrap'} data-tip={t('Time Lost (minutes)')}>{t('Time Lost (Total Mins.)')}</span>,
        accessor: 'timelost_summary',
        minWidth: 110,
        Cell: props => (props.value === '' || props.value === null) ? <span style={{ paddingRight: '90%', cursor: 'pointer' }} className={'empty-field'}></span> :
          <span className='ideal'>
            <span className="react-table-click-text table-click">{''}</span></span>,
        style: { textAlign: 'center', borderRight: 'solid 1px rgb(219, 219, 219)', borderTop: 'solid 1px rgb(219, 219, 219)' },
        // aggregate: (values, rows) => _.uniqWith(values, _.isEqual).join(", "),
        aggregate: (values, rows) => values[0],
        Aggregated: props => (props.value === '' || props.value === null) ? <span style={{ paddingRight: '90%', cursor: 'pointer' }} className={'empty-field'}
          onClick={() => this.openModal('dropdown', props)}></span> :
          <span className='ideal' onClick={() => this.openModal('dropdown', props)}>
            <span className="react-table-click-text table-click">{props.value}</span></span>,
        // Aggregated: props => console.log(props)
      }, {
        Header: () => <span className={'wordwrap'} data-tip={t('Comments And Actions Taken')}>{t('Comments And Actions Taken')}</span>,
        accessor: 'latest_comment',
        Cell: props => props.value === '' ? <span style={{ paddingRight: '90%', cursor: 'pointer' }} className={'empty-field'}></span> :
          <span className='ideal-click'>
            <span className="react-table-click-text table-click comments">{''}</span></span>,
        style: { textAlign: 'center', borderRight: 'solid 1px rgb(219, 219, 219)', borderTop: 'solid 1px rgb(219, 219, 219)' },
        // aggregate: (values, rows) => console.log(rows),
        aggregate: (values, rows) => values[0] ? rows[0]._original.actions_comments.length > 1 ? values[0] + ` (${(rows[0]._original.actions_comments.length - 1)}+ more)` : values[0] : '',
        Aggregated: props => !props.value ? <span style={{ paddingRight: '90%', cursor: 'pointer' }} className={'empty-field'} onClick={() => this.openModal('comments', props)}></span> :
          <span className='ideal' onClick={() => this.openModal('comments', props)}>
            <span className="react-table-click-text table-click comments">{props.value}</span></span>,
        // Aggregated: props => console.log(props.value)
      }, {
        Header: () => <span className={'wordwrap'} data-tip={t('Operator')}>{t('Operator')}</span>,
        accessor: 'oper_id',
        minWidth: 90,
        Cell: props => (props.value === '' || props.value === null) ? <span style={{ paddingRight: '90%', cursor: 'pointer' }} className={'empty-field'}></span> :
          <span className='ideal'>
            <span className="react-table-click-text table-click">{props.value}</span></span>,
        style: { textAlign: 'center', borderRight: 'solid 1px rgb(219, 219, 219)', borderTop: 'solid 1px rgb(219, 219, 219)' },
        // aggregate: (values, rows) => _.uniqWith(values, _.isEqual).join(", "),
        aggregate: (values, rows) => values[0],
        Aggregated: props => (props.value === '' || props.value === null) ? <span style={{ paddingRight: '90%', cursor: 'pointer' }} className={'empty-field'} onClick={() =>
          isComponentValid(this.props.user.role, 'operator_signoff') ? this.openModal('signoff', { props }, 'operator') : void (0)}></span> :
          <span className='ideal' onClick={() => isComponentValid(this.props.user.role, 'operator_signoff') ? this.openModal('signoff', { props }, 'operator') : void (0)}>
            <span className="react-table-click-text table-click">{props.value}</span></span>,
      }, {
        Header: () => <span className={'wordwrap'} data-tip={t('Supervisor')}>{t('Supervisor')}</span>,
        accessor: 'superv_id',
        minWidth: 90,
        Cell: props => (props.value === '' || props.value === null) ? <span style={{ paddingRight: '90%', cursor: 'pointer' }}></span> :
          <span className='ideal'>
            <span className="react-table-click-text table-click">{props.value}</span></span>,
        style: { textAlign: 'center', borderRight: 'solid 1px rgb(219, 219, 219)', borderTop: 'solid 1px rgb(219, 219, 219)' },
        // aggregate: (values, rows) => _.uniqWith(values, _.isEqual).join(", "),
        aggregate: (values, rows) => values[0],
        Aggregated: props => (props.value === '' || props.value === null) ? <span style={{ paddingRight: '90%', cursor: 'pointer' }} className={'empty-field'} onClick={() =>
          isComponentValid(this.props.user.role, 'supervisor_signoff') ? this.openModal('signoff', { props }, 'supervisor') : void (0)}></span> :
          <span className='ideal' onClick={() => isComponentValid(this.props.user.role, 'supervisor_signoff') ? this.openModal('signoff', { props }, 'supervisor') : void (0)}>
            <span className="react-table-click-text table-click">{props.value}</span></span>
      }
    ];
    // fetch data call
    this.getDashboardData(data, columns);
  }

  async getDashboardData(data, columns) {
    let response = {};
    let comments = {};
    if (data) {
      response = await getRequestData(data);
    }
    if (response instanceof Object) {
      this.setState({ data: response, columns, selectedShift: mapShiftReverse(data[2]), selectedDate: data[1] })
    } else {
      console.log('Data could not be retrieved from the endpoint /data');
    }
    if (data) {
      comments = await getIntershift(data);
    }
    if (comments instanceof Object) {
      this.setState({ comments: comments })
    } else {
      console.log('Data could not be retrieved from the endpoint /intershift_communication');
    }
  }

  getTdProps(state, rowInfo, instance) {
    if (rowInfo && instance.id === 'actual_pcs') {
      return {
        style: {
          backgroundColor: Number(rowInfo.row.actual_pcs) < Number(rowInfo.row.target_pcs) ? 'red' : 'green',
        }
      }
    }
    return {}
  }

  changeDate(e) {
    let _this = this;
    const date = e;
    const parsedDate = moment(date).locale(this.state.currentLanguage).format('YYYY/MM/DD');
    this.setState({ selectedDate: date, selectedDateParsed: parsedDate }, () => { _this.fetchData([_this.state.selectedMachine, _this.state.selectedDate, _this.state.selectedShift]); });
  }

  changeMachine(e) {
    let _this = this;
    this.setState({ selectedMachine: e }, () => { _this.fetchData([_this.state.selectedMachine, _this.state.selectedDate, _this.state.selectedShift]); });
  }

  changeLanguage(e) {
    e = e.split('_')[0]
    const date = this.state.selectedDate ? this.state.selectedDate : new Date();
    let parsedDate = moment(date).locale(e).format('YYYY-MM-DD');
    this.setState({ selectedDateParsed: parsedDate })
    this.fetchData();
  }

  onExpandedChange(newExpanded) {
    this.setState({
      expanded: newExpanded
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
    return (
      <React.Fragment>
        <Header className="app-header"
          t={t}
          selectedMachine={this.state.selectedMachine}
          selectedDate={this.state.selectedDate}
          selectedShift={this.state.selectedShift}
          selectedLanguage={this.state.currentLanguage}
          user={this.props.user}
          openModal={this.openModal}
          changeLanguageBrowser={this.changeLanguageBrowser}
          history={this.props.history}
          search={this.props.search}
        />
        {isComponentValid(this.props.user.role, 'pagination') ? <Pagination
          selectedShift={this.state.selectedShift}
          selectedDate={this.state.selectedDate}
          selectedMachine={this.state.selectedMachine}
          t={t}
          history={this.props.history}
          search={this.props.search}
        /> : null}
        <div className="wrapper-main">
          <Row>
            <Col md={12} lg={12} id="dashboardOne-table">
              <Row style={{ paddingLeft: '5%' }}>
                <Col md={3}><h5>{t('Day by Hour Tracking')}</h5></Col>
                <Col md={3}><h5>{t('Machine/Cell')}: {machine}</h5></Col>
                <Col md={3}><h5 style={{ textTransform: 'Capitalize' }}>{this.props.user.first_name ?
                  `${this.props.user.first_name} ${this.props.user.last_name.charAt(0)}, ` : void (0)}{`(${this.props.user.role})`}</h5></Col>
                <Col md={3}><h5>{'Showing Data for: '}{moment(this.state.selectedDate).locale(this.state.currentLanguage).format('LL')}</h5></Col>
              </Row>
              {!_.isEmpty(data) ? <ReactTable
                sortable={false}
                getTdProps={this.handleTableCellClick}
                data={data}
                columns={columns}
                showPaginationBottom={false}
                defaultPageSize={8}
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
              // getTdProps={this.getTdProps}
              /> : <Spinner />}
            </Col>
          </Row>
          <Comments
            t={t}
            user={this.props.user}
            selectedDate={this.state.selectedDate}
            comments={this.state.comments}
            dxh_parent={dxh_parent ? dxh_parent : null}
            Refresh={this.getDashboardData}
            parentData={[this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift]}
          />
        </div>
        <ValueModal
          isOpen={this.state.modal_values_IsOpen}
          //  onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={this.state.modalStyle}
          contentLabel="Example Modal"
          currentVal={isNaN(this.state.valueToEdit) ? undefined : this.state.valueToEdit}
          formType={this.state.modalType}
          t={t}
          user={this.props.user}
          currentRow={this.state.currentRow}
          Refresh={this.getDashboardData}
          parentData={[this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift]}
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
          Refresh={this.getDashboardData}
          parentData={[this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift]}
          selectedDate={this.state.selected}
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
          parentData={[this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift]}
        />

        <SignoffModal
          isOpen={this.state.modal_signoff_IsOpen}
          //  onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          contentLabel="Example Modal"
          t={this.props.t}
          currentRow={this.state.currentRow}
          user={this.props.user}
          Refresh={this.getDashboardData}
          parentData={[this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift]}
          signOffRole={this.state.signOffRole}
        />
        <OrderModal
          isOpen={this.state.modal_order_IsOpen}
          open={this.openModal}
          onRequestClose={this.closeModal}
          style={this.state.modalStyle}
          contentLabel="Example Modal"
          currentVal={isNaN(this.state.valueToEdit) ? undefined : this.state.valueToEdit}
          formType={this.state.modalType}
          t={t}
          label={'Enter Order Number'}
          user={this.props.user}
          Refresh={this.getDashboardData}
          parentData={[this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift]}
          showValidateDataModal={this.showValidateDataModal}
        />
        <OrderTwoModal
          isOpen={this.state.modal_order_two_IsOpen}
          open={this.openModal}
          onRequestClose={this.closeModal}
          contentLabel="Example Modal"
          data={this.state.orderTwo_data}
          t={t}
          user={this.props.user}
          Refresh={this.getDashboardData}
          parentData={[this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift]}
        />
        <ManualEntryModal
          isOpen={this.state.modal_manualentry_IsOpen}
          //  onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={this.state.modalStyle}
          contentLabel="Example Modal"
          t={t}
          timelost={this.state.current_display_timelost}
          machine={this.state.selectedMachine}
          currentRow={this.state.currentRow}
          user={this.props.user}
          Refresh={this.fetchData}
          parentData={[this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift]}
        />
      </React.Fragment >
    );
  }
};

export default DashboardOne;