import React from 'react';
import './dashboard.scss';
import '../sass/tooltip.scss'
import Header from '../Layout/Header';
import { Row, Col, Button } from 'react-bootstrap';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import moment from 'moment';
import FontAwesome from 'react-fontawesome';
import CommentsModal from  '../Layout/CommentModal';
import ValueModal from  '../Layout/ValueModal';
import Spinner from '../Spinner';
import Comments from './Comments';
import { getRequestData } from '../Utils/Requests';
import ReactTooltip from 'react-tooltip';
import LoadingModal from '../Layout/LoadingModal';
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
            valid_barcode: false,
            barcode: 1001,
            dataCall: {},
            selectedDate: undefined,
            selectedDateParsed: '',
            selectedMachine: 12532,
            currentLanguage: 'en'
        } 
        this.openModal = this.openModal.bind(this);
        // this.afterOpenModal = this.afterOpenModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.changeDate = this.changeDate.bind(this);
        this.changeMachine = this.changeMachine.bind(this);
        this.changeLanguage = this.changeLanguage.bind(this);
    }

    openModal(type) {
      if (type === 'values') {
        this.setState({
          modal_values_IsOpen: true,
          modal_comments_IsOpen: false
        })
      }
      if (type === 'comments') {
        this.setState({
          modal_values_IsOpen: false,
          modal_comments_IsOpen: true
        })
      }
    }
  
    // afterOpenModal() {
    //   // references are now sync'd and can be accessed.
    //   this.subtitle.style.color = '#f00';
    // }
  
    closeModal() {
      this.setState({modal_authorize_IsOpen: false, modal_comments_IsOpen: false, modal_values_IsOpen: false});
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
        this.fetchData();
    }

    async fetchData(data) {
      const t = this.props.t;
      
        const columns = [{
          Header: () => <span data-tip={t('Shift Number')}>{t('Shift Number')}<ReactTooltip/></span>,
          accessor: 'shift',
          width: 180
        }, {
          Header: () => <span data-tip={t('Part Number')}>{t('Part Number')}<ReactTooltip/></span>,
          accessor: 'part_number'
        }, {
          Header: () => <span data-tip={t('Ideal')}>{t('Ideal')}<ReactTooltip/></span>,
          accessor: 'ideal',
          Cell: props => <span className='ideal-click' onClick={() => this.openModal('values')}><span className="react-table-click-text table-click">{props.value}</span><FontAwesome name="pencil"/></span>
        }, {
          Header: () => <span data-tip={t('Target')}>{t('Target')}<ReactTooltip/></span>,
          accessor: 'target_pcs'
        }, {
          Header: () => <span data-tip={t('Actual')}>{t('Actual')}<ReactTooltip/></span>,
          accessor: 'actual_pcs'
        }, {
          Header: () => <span data-tip={t('Cumulative Target')}>{t('Cumulative Target')}<ReactTooltip/></span>,
          accessor: 'cumulative_target_pcs'
        },  {
          Header: () => <span data-tip={t('Cumulative Actual')}>{t('Cumulative Actual Pcs.')}<ReactTooltip/></span>,
          accessor: 'cumulative_pcs'
        }, {
          Header: () => <span data-tip={t('Downtime (minutes)')}>{t('Downtime (minutes)')}<ReactTooltip/></span>,
          accessor: 'downtime'
        }, {
          Header: () => <span data-tip={t('Downtime Reason Code')}>{t('Downtime Reason Code')}<ReactTooltip/></span>,
          accessor: 'downtime_reason_code'
        },{
          Header: () => <span data-tip={t('Comments And Actions Taken')}>{t('Comments And Actions Taken')}<ReactTooltip/></span>,
          accessor: 'actions_comments',
          width: 200,
          Cell: props => <span className='ideal-click' onClick={() => this.openModal('comments')}><span className="react-table-click-text table-click comments">{props.value}</span><FontAwesome name="search-plus"/></span>
        }, {
          Header: () => <span data-tip={t('Operator')}>{t('Operator')}<ReactTooltip/></span>,
          accessor: 'oper_id'
        }, {
          Header: () => <span data-tip={t('Supervisor')}>{t('Supervisor')}<ReactTooltip/></span>,
          accessor: 'superv_id'
        }
      ];
      let response = {};
      if (data) {
        response = await getRequestData(`/data`, data);
      }
       this.setState({data: response, columns})
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
     
    render() {
        // const data = this.state.data;
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
                />
                <div id="semi-button-deck">
                  <span className="semi-button-shift-change-left">
                    <FontAwesome name="angle-double-left" className="icon-arrow"/> 
                    <FontAwesome name="angle-left" className="icon-arrow"/>
                      <span id="previous-shift">Previous Shift</span>
                  </span>
                  <span className="semi-button-shift-change-right">
                    <span id="current-shift">Back to Current Shift</span>
                    <FontAwesome name="angle-right" className="icon-arrow"/>
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
                                data={data}
                                columns={columns}
                                showPaginationBottom={true}
                                defaultPageSize={8}
                                headerStyle={{fontSize: '0.5em'}}
                                previousText={back}
                                nextText={next} 
                                pageText={page}
                                ofText={off}
                                rowsText={rows} 
                                pageSizeOptions={[8, 16, 24]}
                                style={{whiteSpace: 'unset'}}
                            /> : <Spinner/>}
                        </Col>
                    </Row>
                    <Comments t={this.props.t} />
                </div>
                <ValueModal
                 isOpen={this.state.modal_values_IsOpen}
                 //  onAfterOpen={this.afterOpenModal}
                 onRequestClose={this.closeModal}
                 style={this.state.modalStyle}
                 contentLabel="Example Modal"
                 currentVal={100}
                />

                <CommentsModal
                  isOpen={this.state.modal_comments_IsOpen}
                  //  onAfterOpen={this.afterOpenModal}
                  onRequestClose={this.closeModal}
                  style={this.state.modalStyle}
                  contentLabel="Example Modal"
                />
            </React.Fragment>
        );
    }
};

export default DashboardOne;

// const columns = [{
//     Header: 'Name',
//     accessor: 'name' // String-based value accessors!
//   }, {
//     Header: 'Age',
//     accessor: 'age',
//     Cell: props => <span className='number'>{props.value}</span> // Custom cell components!
//   }, {
//     id: 'friendName', // Required because our accessor is not a string
//     Header: 'Friend Name',
//     accessor: d => d.friend.name // Custom value accessors!
//   }, {
//     Header: props => <span>Friend Age</span>, // Custom header components!
//     accessor: 'friend.age'
//   }]