import React from 'react';
import './dashboard.scss';
import Header from '../Layout/Header';
import { Row, Col } from 'react-bootstrap';
import ReactTable from 'react-table';
import 'react-table/react-table.css'

class DashboardOne extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            data: [],
            columns : []
        } 
    }

    componentDidMount() {
        const columns = [{
            Header: 'Shift Number',
            accessor: 'shift'
          }, {
            Header: 'Order Number',
            accessor: 'order_number',
          }, {
            Header: 'Part Number',
            accessor: 'part_number'
          }, {
            Header: 'Ideal',
            accessor: 'ideal'
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
            accessor: 'actions_comments'
          }, {
            Header: 'Operator Id',
            accessor: 'oper_id'
          }, {
            Header: 'Supervisor Id',
            accessor: 'superv_id'
          }
        ];

          const data = [{
           shift: '11:00 pm - 12:00 am',
           order_number: '0000001',
           part_number: '1111111',
           ideal: '100',
           target_pcs: '75',
           actual_pcs: '77',
           cumulative_pcs: '77',
           downtime: '10',
           downtime_reason_code: '124',
           actions_comments: 'Something Happened Here',
           oper_id: '030',
           superv_id: 'AF 031',
          },{
            shift: '12:00 am - 01:00 am',
            order_number: '0000002',
            part_number: '1111112',
            ideal: '100',
            target_pcs: '73',
            actual_pcs: '71',
            cumulative_pcs: '74',
            downtime: '08',
            downtime_reason_code: '124',
            actions_comments: 'Woops Something Broke',
            oper_id: '031',
            superv_id: 'AF 000',
          }]
          this.setState({columns, data})
    }
     
    render() {
        const data = this.state.data;
        const columns = this.state.columns;
        return (
            <React.Fragment>
                <Header className="app-header"/>
                <div className="wrapper-main">
                    <Row>
                        <Col md={12} lg={12}>
                            <p>Day by Hour Tracking</p>
                            <ReactTable
                                data={data}
                                columns={columns}
                                defaultPageSize={10}
                            />
                        </Col>
                    </Row>
                </div>
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