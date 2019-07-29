import React from 'react';
import './dashboard.scss';
import '../sass/tooltip.scss'
import Header from '../Layout/Header';
import { Row, Col } from 'react-bootstrap';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import moment from 'moment';
import FontAwesome from 'react-fontawesome';
import CommentsModal from  '../Layout/CommentModal';
import ValueModal from  '../Layout/ValueModal';
import DropdownModal from  '../Layout/DropdownModal';
import Spinner from '../Spinner';
import Comments from './Comments';
import { getRequestData, getIntershift } from '../Utils/Requests';
// import ReactTooltip from 'react-tooltip';
import LoadingModal from '../Layout/LoadingModal';
import { handleTableCellClick } from "./tableFunctions";
import classNames from "classnames";
import matchSorter from "match-sorter";
import * as _ from 'lodash';
import('moment/locale/es');

class DashboardOne extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            data: [],
            columns : [],
            modalStyle: {},
            modal_values_IsOpen: false,
            modal_authorize_IsOpen: false,
            modal_comments_IsOpen: false,
            modal_dropdown_IsOpen: false,
            valid_barcode: false,
            barcode: 1001,
            dataCall: {},
            selectedDate: undefined,
            selectedDateParsed: '',
            selectedMachine: 12532,
            currentLanguage: 'en',
            valueToEdit: '',
            modalType: '',
            expanded: {},
            openDropdownAfter: false,
            selectedShift: 'Select Shift'
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
    }

    openModal(type, val, previous) {
      let value = ''
      let modalType = ''
      if (type === 'values') {
        if (val) {
          if (val.props) {
            if (isNaN(val.props.value)) {
              value = val.props.value;
              modalType = 'text'
            } else {
              value = parseInt(val.props.value)
              modalType = 'number'
            }
          }
        }
        this.setState({
          modal_values_IsOpen: true,
          modal_comments_IsOpen: false,
          modal_dropdown_IsOpen: false,
          valueToEdit: value,
          modalType,
          openDropdownAfter: previous ? true : false,
        })
      }
      if (type === 'comments') {
        if (val) {
          if (isNaN(val.props.value)) {
            value = val.props.value;
            modalType = 'text'
          } else {
            value = parseInt(val.props.value)
            modalType = 'number'
          }
        }
        this.setState({
          modal_values_IsOpen: false,
          modal_comments_IsOpen: true,
          modal_dropdown_IsOpen: false,
        })
      }
      if (type === 'dropdown') {
        this.setState({
          modal_values_IsOpen: false,
          modal_comments_IsOpen: false,
          modal_dropdown_IsOpen: true,
        })
      }
    }
  
    closeModal() {
      this.setState({modal_authorize_IsOpen: false, modal_comments_IsOpen: false, modal_values_IsOpen: false, modal_dropdown_IsOpen: false});
    }

    async componentDidMount() {
        const modalStyle = {
          content : {
            top                   : '50%',
            left                  : '50%',
            right                 : 'auto',
            bottom                : 'auto',
            marginRight           : '-50%',
            transform             : 'translate(-50%, -50%)',
          },
          overlay : {
            backgroundColor: 'rgba(0,0,0, 0.6)'
          }
        };
        
        this.setState({modalStyle})
        const date = new Date();
        const x = moment(date).locale(this.state.currentLanguage).format('LLLL');
        this.setState({selectedDate: date, selectedDateParsed: x})
        this.fetchData([this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift]);
    }

    componentWillReceiveProps(nextProps) {
      this.fetchData([this.state.selectedMachine, this.state.selectedDate, this.state.selectedShift]);
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
          Header: () => <span className={'wordwrap'} data-tip={t(this.state.selectedShift)}>{this.state.selectedShift !== 'Select Shift' ? t(this.state.selectedShift) : t('First Shift')}</span>,
          accessor: 'shift',
          width: 180,
          style: {backgroundColor: 'rgb(247, 247, 247)', borderRight: 'solid 1px rgb(219, 219, 219)', borderLeft: 'solid 1px rgb(219, 219, 219)', borderTop: 'solid 1px rgb(219, 219, 219)'},
          Pivot: row => {
            return <span>{row.value}</span>;
          },
          disableExpander: false,
          filterMethod: (filter, rows) =>
            matchSorter(rows, filter.value, { keys: ["shift"] }),
            filterAll: true
        }, {
          Header: () => <span className={'wordwrap'} data-tip={t('Part Number')}>{t('Part Number')}</span>,
          width: 200,
          accessor: 'part_number',
          Cell: props => props.value === '' ? <span style={{paddingRight: '90%', cursor: 'pointer'}}  className={'empty-field'} onClick={() => this.openModal('values')}></span> : 
          <span className='ideal-click' onClick={() => this.openModal('values', {props})}>
          <span className="react-table-click-text table-click">{props.value}</span></span>,
          style: {textAlign: 'center', borderRight: 'solid 1px rgb(219, 219, 219)', borderTop: 'solid 1px rgb(219, 219, 219)'},
          // aggregate: (values, rows) => _.uniqWith(values, _.isEqual).join(", "),
          aggregate: (values, rows) => rows.length > 1 ? '' : values[0],
          Aggregated:  props => props.value === '' ? <span style={{paddingRight: 185, cursor: 'pointer'}}  className={'empty-field'}></span> : 
          <span className='ideal-click' onClick={() => this.openModal('values', {props})}>
          <span className="react-table-click-text table-click">{props.value}</span></span>,
          PivotValue:<span>{'jajajaj'}</span>
        }, {
          Header: () => <span className={'wordwrap'} data-tip={t('Ideal')}>{t('Ideal')}</span>,
          accessor: 'ideal',
          width: 150,
          Cell: props => props.value === '' ? <span style={{paddingRight: '90%', cursor: 'pointer'}} className={'empty-field'} onClick={() => this.openModal('values')}></span> : 
          <span className='ideal-click' onClick={() => this.openModal('values', {props})}>
          <span className="react-table-click-text table-click">{props.value}</span></span>,
          style: {textAlign: 'center', borderTop: 'solid 1px rgb(219, 219, 219)'},
          // aggregate: (values, rows) => _.uniqWith(values, _.isEqual).join(", "),
          aggregate: (values, rows) => rows.length > 1 ? '' : values[0],
          Aggregated: props => props.value === '' ? <span style={{paddingRight: '90%', cursor: 'pointer'}} className={'empty-field'} onClick={() => this.openModal('values')}></span> : 
          <span className='ideal-click' onClick={() => this.openModal('values', {props})}>
          <span className="react-table-click-text table-click">{props.value}</span></span>
        }, {
          Header: () => <span className={'wordwrap'} data-tip={t('Target')}>{t('Target')}</span>,
          accessor: 'target_pcs',
          width: 150,
          Cell: props => props.value === '' ? <span style={{paddingRight: '90%', cursor: 'pointer'}} className={`empty-field`}></span> : 
          <span>
          <span>{props.value}</span></span>,
          style: {backgroundColor: 'rgb(247, 247, 247)', borderRight: 'solid 1px rgb(219, 219, 219)', borderLeft: 'solid 1px rgb(219, 219, 219)', borderTop: 'solid 1px rgb(219, 219, 219)', 
          textAlign: 'center'},
          // aggregate: (values, rows) => _.uniqWith(values, _.isEqual).join(", "),
          aggregate: (values, rows) => rows.length > 1 ? '' : values[0],
          Aggregated: props => props.value === '' ? <span style={{paddingRight: '90%', cursor: 'pointer'}} className={'empty-field'}></span> : 
          <span className='empty'>
          <span>{props.value}</span></span>
        }, {
          Header: () => <span className={'wordwrap'} data-tip={t('Actual')}>{t('Actual')}</span>,
          accessor: 'actual_pcs',
          width: 150,
          Cell: props => props.value === '' ? <span style={{paddingRight: '90%', cursor: 'pointer'}}
          onClick={() => this.openModal('values')}></span> : 
          <span className={`ideal-click`} onClick={() => this.openModal('values', {props})}>
          <span className="react-table-click-text table-click" style={{color: 'white'}} >{props.value}</span></span>,
          style: {textAlign: 'center', borderTop: `solid 1px rgb(219, 219, 219)`},
          aggregate: (values, rows) => rows.length > 1 ? '' : values[0],
          Aggregated: props => {
            return props.value === '' ? <span style={{paddingRight: '90%', cursor: 'pointer'}} className={'empty-field'} onClick={() => this.openModal('values')}></span> : 
            <span className='ideal-click'onClick={() => this.openModal('values', {props})}>
            <span style={{color: 'white'}} className="react-table-click-text table-click">{props.value}</span></span>
          }
        }, {
          Header: () => <span className={'wordwrap'} data-tip={t('Cumulative Target')}>{t('Cumulative Target')}</span>,
          accessor: 'cumulative_target_pcs',
          width: 150,
          Cell: props => props.value === '' ? <span style={{paddingRight: '90%', cursor: 'pointer'}} className={'empty-field'}></span> : 
          <span className='empty'>
          <span>{props.value}</span></span>,
          style: {backgroundColor: 'rgb(247, 247, 247)', borderRight: 'solid 1px rgb(219, 219, 219)', borderLeft: 'solid 1px rgb(219, 219, 219)', borderTop: 'solid 1px rgb(219, 219, 219)', 
          textAlign: 'center'},
          // aggregate: (values, rows) => _.uniqWith(values, _.isEqual).join(", "),
          aggregate: (values, rows) => values.length > 1 ? _.sum(values.map(Number)) : values[0],
          Aggregated:props => props.value === '' ? <span style={{paddingRight: '90%', cursor: 'pointer'}} className={'empty-field'}></span> : 
          <span className='empty'>
          <span>{props.value}</span></span>,
        },  {
          Header: () => <span className={'wordwrap'} data-tip={t('Cumulative Actual')}>{t('Cumulative Actual')}</span>,
          accessor: 'cumulative_pcs',
          width: 150,
          Cell: props => props.value === '' ? <span style={{paddingRight: '90%', cursor: 'pointer'}} className={'empty-field'}></span> : 
          <span className='empty'>
          <span>{props.value}</span></span>,
          style: {borderRight: 'solid 1px rgb(219, 219, 219)', borderTop: 'solid 1px rgb(219, 219, 219)', textAlign: 'center', color: 'white'},
          // aggregate: (values, rows) => _.uniqWith(values, _.isEqual).join(", "),
          aggregate: (values, rows) => values.length > 1 ? _.sum(values.map(Number)) : values[0],
          Aggregated: props => props.value === '' ? <span style={{paddingRight: '90%', cursor: 'pointer'}} className={'empty-field'}></span> : 
          <span className='empty'>
          <span>{props.value}</span></span>
        }, {
          Header: () => <span className={'wordwrap'} data-tip={t('Time Lost (minutes)')}>{t('Time Lost (minutes)')}</span>,
          accessor: 'timelost',
          width: 110,
          Cell: props => props.value === '' ? <span style={{paddingRight: '90%', cursor: 'pointer'}} className={'empty-field'} onClick={props => this.openModal('values', props, true)}></span> : 
          <span className='ideal-click' onClick={() => this.openModal('values', {props}, true)}>
          <span className="react-table-click-text table-click">{props.value}</span></span>,
          style: {textAlign: 'center', borderRight: 'solid 1px rgb(219, 219, 219)', borderTop: 'solid 1px rgb(219, 219, 219)'},
          // aggregate: (values, rows) => _.uniqWith(values, _.isEqual).join(", "),
          aggregate: (values, rows) => values[0],
          Aggregated: props => props.value === '' ? <span style={{paddingRight: '90%', cursor: 'pointer'}} className={'empty-field'} onClick={props => this.openModal('values', props, true)}></span> : 
          <span className='ideal-click' onClick={() => this.openModal('values', {props}, true)}>
          <span className="react-table-click-text table-click">{props.value}</span></span>,
          // Aggregated: props => console.log(props)
        },{
          Header: () => <span className={'wordwrap'} data-tip={t('Time Lost Reason Code')}>{t('Time Lost Reason Code')}</span>,
          accessor: 'timelost_reason_code',
          width: 150,
          Cell: props => props.value === '' ? <span style={{paddingRight: '90%', cursor: 'pointer'}} className={'empty-field'} onClick={() => this.openModal('dropdown')}></span> : 
          <span className='ideal-click' onClick={() => this.openModal('dropdown', {props})}>
          <span className="react-table-click-text table-click">{props.value}</span></span>,
          style: {textAlign: 'center', borderRight: 'solid 1px rgb(219, 219, 219)', borderTop: 'solid 1px rgb(219, 219, 219)'},
          // aggregate: (values, rows) => _.uniqWith(values, _.isEqual).join(", "),
          aggregate: (values, rows) => values[0],
          Aggregated: props => props.value === '' ? <span style={{paddingRight: '90%', cursor: 'pointer'}} className={'empty-field'} onClick={() => this.openModal('dropdown')}></span> : 
          <span className='ideal-click' onClick={() => this.openModal('dropdown', {props})}>
          <span className="react-table-click-text table-click">{props.value}</span></span>,
        },{
          Header: () => <span className={'wordwrap'} data-tip={t('Comments And Actions Taken')}>{t('Comments And Actions Taken')}</span>,
          accessor: 'actions_comments',
          Cell: props => props.value === '' ? <span style={{paddingRight: '90%', cursor: 'pointer'}} className={'empty-field'} onClick={() => this.openModal('comments')}></span> : 
            <span className='ideal-click' onClick={() => this.openModal('comments')}>
            <span className="react-table-click-text table-click comments">{props.value}</span></span>,
          style: {textAlign: 'center', borderRight: 'solid 1px rgb(219, 219, 219)', borderTop: 'solid 1px rgb(219, 219, 219)'},
          // aggregate: (values, rows) => _.uniqWith(values, _.isEqual).join(", "),
          aggregate: (values, rows) => values[0],
          Aggregated: props => props.value === '' ? <span style={{paddingRight: '90%', cursor: 'pointer'}} className={'empty-field'} onClick={() => this.openModal('comments')}></span> : 
          <span className='ideal-click' onClick={() => this.openModal('comments')}>
          <span className="react-table-click-text table-click comments">{props.value}</span></span>,
        },{ 
          Header: () => <span className={'wordwrap'} data-tip={t('Operator')}>{t('Operator')}</span>,
          accessor: 'oper_id',
          width: 90,
          Cell: props => props.value === '' ? <span style={{paddingRight: '90%', cursor: 'pointer'}} className={'empty-field'} onClick={() => this.openModal('values')}></span> : 
          <span className='ideal-click' onClick={() => this.openModal('values', {props})}>
          <span className="react-table-click-text table-click">{props.value}</span></span>,
          style: {textAlign: 'center', borderRight: 'solid 1px rgb(219, 219, 219)', borderTop: 'solid 1px rgb(219, 219, 219)'},
          // aggregate: (values, rows) => _.uniqWith(values, _.isEqual).join(", "),
          aggregate: (values, rows) => values[0],
          Aggregated:props => props.value === '' ? <span style={{paddingRight: '90%', cursor: 'pointer'}} className={'empty-field'} onClick={() => this.openModal('values')}></span> : 
          <span className='ideal-click' onClick={() => this.openModal('values', {props})}>
          <span className="react-table-click-text table-click">{props.value}</span></span>,
        },{
          Header: () => <span className={'wordwrap'} data-tip={t('Supervisor')}>{t('Supervisor')}</span>,
          accessor: 'superv_id',
          width: 90,
          Cell: props => props.value === '' ? <span style={{paddingRight: '90%', cursor: 'pointer'}} className={'empty-field'} onClick={() => this.openModal('values')}></span> : 
          <span className='ideal-click' onClick={() => this.openModal('values', {props})}>
          <span className="react-table-click-text table-click">{props.value}</span></span>,
          style: {textAlign: 'center', borderRight: 'solid 1px rgb(219, 219, 219)', borderTop: 'solid 1px rgb(219, 219, 219)'},
          // aggregate: (values, rows) => _.uniqWith(values, _.isEqual).join(", "),
          aggregate: (values, rows) => values[0],
          Aggregated:  props => props.value === '' ? <span style={{paddingRight: '90%', cursor: 'pointer'}} className={'empty-field'} onClick={() => this.openModal('values')}></span> : 
          <span className='ideal-click' onClick={() => this.openModal('values', {props})}>
          <span className="react-table-click-text table-click">{props.value}</span></span>
        }
      ];
      let response = {};
      let comments = {};
      if (data) {
        response = await getRequestData(data);
      }
      if (response instanceof Object) {
       this.setState({data: response, columns})
      } else {
        console.log('Data could not be retrieved from the endpoint /data');
      }
      if (data) {
        comments = await getIntershift(data);
      }
      if (comments instanceof Object) {
       this.setState({comments: comments})
      } else {
        console.log('Data could not be retrieved from the endpoint /intershift_communication');
      }

      } 

    getTdProps(state, rowInfo, instance) {
      if (rowInfo && instance.id === 'actual_pcs') {
        console.log(instance.id)
        return {
          style: {
            backgroundColor: Number(rowInfo.row.actual_pcs) < Number(rowInfo.row.target_pcs) ? 'red' : 'green',
          }
        }
      }
      return {}
    }

    changeDate(e) {
      const date = e;
      this.setState({selectedDate: date})
      const parsedDate = moment(date).locale(this.state.currentLanguage).format('LLLL');
      this.setState({selectedDateParsed: parsedDate})
    }

    changeMachine(e) {
      console.log(e);
      this.setState({selectedMachine: e})
    }

    changeLanguage(e) {
      e = e.split('_')[0]
      const date = this.state.selectedDate ? this.state.selectedDate : new Date();
      const parsedDate = moment(date).locale(e).format('LLLL');
      this.setState({selectedDateParsed: parsedDate})
      this.fetchData();
    }

    onExpandedChange(newExpanded) {
      this.setState({
        expanded: newExpanded
      });
    }

    openAfter(e) {
      console.log(e.target);
      this.setState({
        modal_values_IsOpen: false,
        modal_comments_IsOpen: false,
        modal_dropdown_IsOpen: true,
      })
    }

    headerData(e) {
      this.setState({selectedShift: e});
    }

    render() {
        const columns = this.state.columns;
        const machine = this.state.selectedMachine;
        const date = this.state.selectedDateParsed;
        const data = this.state.data;
        // @DEV: *****************************
        // Always assign data to variable then 
        // ternary between data and spinner
        // ***********************************
        const t=this.props.t;
        const back = t('Back');
        const next = t('Next');
        const page = t('Page');
        const off = t('Of');
        const rows = t('Rows');
        return (
            <React.Fragment>
                <Header className="app-header" 
                  toParent={this.fetchData} 
                  t={t}
                  changeMachine={this.changeMachine}
                  changeDate={this.changeDate}
                  changeDateLanguage={this.changeLanguage}
                  sendToMain={this.headerData}
                  selectedShift={this.state.selectedShift}
                />
                <div id="semi-button-deck">
                  <span className="semi-button-shift-change-left">
                    <FontAwesome name="angle-double-left" className="icon-arrow"/> 
                    <FontAwesome name="caret-left fa-2" className="icon-arrow"/>
                      <span id="previous-shift">Previous Shift</span>
                  </span>
                  <span className="semi-button-shift-change-right">
                    <span id="current-shift">Back to Current Shift</span>
                    <FontAwesome name="caret-right fa-2" className="icon-arrow"/>
                  </span>
                </div>
                <div className="wrapper-main">
                    <Row>
                        <Col md={12} lg={12} id="dashboardOne-table">
                            <Row style={{paddingLeft: '5%'}}>
                                <Col md={4}><h5>{t('Machine/Cell')}: {machine}</h5></Col>
                                <Col md={4}><h5>{t('Day by Hour Tracking')}</h5></Col>
                                <Col md={4}><h5>{date}</h5></Col>
                            </Row>
                            {!_.isEmpty(data) ? <ReactTable
                                getTdProps={this.handleTableCellClick}
                                data={data}
                                columns={columns}
                                showPaginationBottom={false}
                                defaultPageSize={8}
                                headerStyle={{fontSize: '0.5em'}}
                                previousText={back}
                                nextText={next} 
                                pageText={page}
                                ofText={off}
                                headerClassName={"wordwrap"}
                                rowsText={rows} 
                                pageSizeOptions={[8, 16, 24]}
                                pivotBy={["shift"]}
                                onExpandedChange={newExpanded => this.onExpandedChange(newExpanded)}
                                expanded={this.state.expanded}
                                // getTdProps={this.getTdProps}
                            /> : <Spinner/>}
                        </Col>
                    </Row>
                    <Comments t={this.props.t} comments={this.state.comments}/>
                </div>
                <ValueModal
                 isOpen={this.state.modal_values_IsOpen}
                 //  onAfterOpen={this.afterOpenModal}
                 onRequestClose={this.closeModal}
                 style={this.state.modalStyle}
                 contentLabel="Example Modal"
                 currentVal={this.state.valueToEdit}
                 formType={this.state.modalType}
                 t={this.props.t}
                 openDropdownAfter={this.state.openDropdownAfter}
                 openAfter={this.openAfter}
                />

                <CommentsModal
                  isOpen={this.state.modal_comments_IsOpen}
                  //  onAfterOpen={this.afterOpenModal}
                  onRequestClose={this.closeModal}
                  style={this.state.modalStyle}
                  contentLabel="Example Modal"
                  t={this.props.t}
                />

                <DropdownModal
                  isOpen={this.state.modal_dropdown_IsOpen}
                  //  onAfterOpen={this.afterOpenModal}
                  onRequestClose={this.closeModal}
                  style={this.state.modalStyle}
                  contentLabel="Example Modal"
                  t={this.props.t}
                  label={t('Enter Reason Code')}
                />    
            </React.Fragment>
        );
    }
};

export default DashboardOne;