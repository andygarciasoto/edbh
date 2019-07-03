import React from 'react';
import './dashboard.scss';
import Header from '../Layout/Header';
import { Row, Col } from 'react-bootstrap';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import moment from 'moment';
import FontAwesome from 'react-fontawesome';
import CommentsModal from  '../Layout/commentModal';
import ValueModal from  '../Layout/ValueModal';
import Spinner from '../Spinner';
import { getRequestData } from '../Utils/Requests';

class DashboardOne extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            data: [],
            columns : [],
            machine: 1232,
            modalStyle: {},
            modal_values_IsOpen: false,
            modal_authorize_IsOpen: false,
            modal_comments_IsOpen: false,
            valid_barcode: false,
            barcode: 1001,
            dataCall: {},
        } 
        this.openModal = this.openModal.bind(this);
        // this.afterOpenModal = this.afterOpenModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.fetchData = this.fetchData.bind(this);
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

    componentDidMount() {
        const columns = [{
            Header: 'Shift Number',
            accessor: 'shift',
            width: 180
          }, {
            Header: 'Part Number',
            accessor: 'part_number'
          }, {
            Header: 'Ideal',
            accessor: 'ideal',
            Cell: props => <span className='ideal-click' onClick={() => this.openModal('values')}><span className="react-table-click-text">{props.value}</span><FontAwesome name="pencil"/></span>
          }, {
            Header: 'Target Pcs.',
            accessor: 'target_pcs'
          }, {
            Header: 'Actual Pcs.',
            accessor: 'actual_pcs'
          }, {
            Header: 'Cumulative Actual Pcs.',
            accessor: 'cumulative_pcs'
          }, {
            Header: 'Downtime (minutes)',
            accessor: 'downtime'
          }, {
            Header: 'Downtime Reason Code',
            accessor: 'downtime_reason_code'
          },{
            Header: 'Comments And Actions Taken',
            accessor: 'actions_comments',
            width: 180,
            Cell: props => <span className='ideal-click' onClick={() => this.openModal('comments')}><span className="react-table-click-text comments">{props.value}</span><FontAwesome name="search-plus"/></span>
          }, {
            Header: 'Operator',
            accessor: 'oper_id'
          }, {
            Header: 'Supervisor',
            accessor: 'superv_id'
          }
        ];

          const data = [{
           Expander: true,
           shift: '11:00 pm - 12:00 am',
           part_number: '1111111',
           ideal: '100',
           target_pcs: '75',
           actual_pcs: '77',
           cumulative_pcs: '77',
           downtime: '10',
           downtime_reason_code: '124',
           actions_comments: 'Something Happened Here',
           oper_id: 'SW',
           superv_id: 'DS',
          },{
            shift: '12:00 am - 01:00 am',
            part_number: '1111112',
            ideal: '100',
            target_pcs: '73',
            actual_pcs: '71',
            cumulative_pcs: '74',
            downtime: '08',
            downtime_reason_code: '124',
            actions_comments: 'Woops Something Broke',
            oper_id: 'RF',
            superv_id: 'DF',
          }]

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

          this.setState({columns, data, modalStyle})
    }

    fetchData(data) {
      getRequestData('/data', data);
    }
     
    render() {
        // const data = this.state.data;
        const columns = this.state.columns;
        const machine = this.state.machine;
        const data = this.state.data;
        // @DEV: *****************************
        // Always assign data to variable then 
        // ternary between data and spinner
        // ***********************************

        return (
            <React.Fragment>
                <Header className="app-header" toParent={this.fetchData} t={this.props.t}/>
                <div className="wrapper-main">
                    <Row>
                        <Col md={12} lg={12} id="dashboardOne-table">
                            <Row style={{paddingLeft: '10%'}}><Col md={4}><p>Machine/Cell:{machine}</p>
                              </Col><Col md={4}><p>Day by Hour Tracking</p></Col><Col md={4}><p>{moment().format("LLLL")}</p></Col>
                            </Row>
                            {data ? <ReactTable
                                data={data}
                                columns={columns}
                                defaultPageSize={10}
                                headerStyle={{fontSize: '0.5em'}}
                            /> : <Spinner/>}
                            
                        </Col>
                    </Row>
                </div>
                <ValueModal
                 isOpen={this.state.modal_values_IsOpen}
                //  onAfterOpen={this.afterOpenModal}
                 onRequestClose={this.closeModal}
                 style={this.state.modalStyle}
                 contentLabel="Example Modal"
                 currentVal={100}
                 // also send the entire row -- get order number and change value on database, then refresh table
                 />

                <CommentsModal
                 isOpen={this.state.modal_comments_IsOpen}
                //  onAfterOpen={this.afterOpenModal}
                 onRequestClose={this.closeModal}
                 style={this.state.modalStyle}
                 contentLabel="Example Modal"/>
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