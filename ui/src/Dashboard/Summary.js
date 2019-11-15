import React from 'react';
import ReactTable from 'react-table';
import FontAwesome from 'react-fontawesome';
import { getCurrentTime, BuildGet, formatNumber, isComponentValid } from '../Utils/Requests';
import { Row, Col } from 'react-bootstrap';
import { SOCKET, API } from '../Utils/Constants';
import Spinner from '../Spinner';
import * as _ from 'lodash';
import * as qs from 'query-string';
import classNames from "classnames";
import matchSorter from "match-sorter";
import moment from 'moment';
const axios = require('axios');

class Summary extends React.Component {

    constructor(props) {
        super(props);
        this.state = Object.assign(this.getInitialState(props), this.getTextTranslations(props));
    }

    getInitialState(props) {
        return {
            data: [],
            columns: [],
            machine: '',
            date: moment(),
            expanded: true
        }
    }

    getTextTranslations(props) {
        let search = qs.parse(props.history.location.search);
        return {
            shiftText: props.t('All Shifts'),
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

    componentDidMount() {
        this.fetchData(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.fetchData(nextProps);
    }

    fetchData(props) {
        let { history } = props;
        if (history && history.location.search) {

            let search = qs.parse(props.history.location.search);

            const parameters1 = {
                params: {
                    mc: search.mc,
                    dt: moment(search.dt).format('YYYY/MM/DD') + ' 06:00'
                }
            }
            const parameters2 = {
                params: {
                    mc: search.mc,
                    dt: moment(search.dt).format('YYYY/MM/DD') + ' 08:00'
                }
            }
            const parameters3 = {
                params: {
                    mc: search.mc,
                    dt: moment(search.dt).format('YYYY/MM/DD') + ' 16:00'
                }
            }

            //"2019/11/13 10:40"

            let requestData = [
                BuildGet(`${API}/data`, parameters1),
                BuildGet(`${API}/data`, parameters2),
                BuildGet(`${API}/data`, parameters3)
            ];

            let _this = this;

            axios.all(requestData).then(
                axios.spread((responseData1, responseData2, responseData3) => {

                    let data = _.concat(responseData1.data, responseData2.data, responseData3.data);

                    if (data instanceof Object) {
                        data = _.orderBy(data, ['hour_interval_start', 'start_time']);
                    }

                    _this.setState(_this.getTextTranslations(props));
                    _this.setState({ data, columns: _this.getTableColumns(), machine: search.mc, date: search.dt });

                })
            ).catch(function (error) {
                console.log(error);
            });
        }
    }

    getHeader(text) {
        return <span className={'wordwrap'} data-tip={text}>{text}</span>
    }

    getStyle(applyGrey, align, rowInfo, column) {
        let style = {};
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
        let rowValid = rowInfo ? (rowInfo.subRows ? rowInfo.subRows[0] : rowInfo.row) : null;
        if (rowValid && column.id === 'actual_pcs' && !moment(rowValid._original.hour_interval_start).isAfter(getCurrentTime())) {
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
            return <span className="react-table-click-text table-click">{cellInfo.original[prop] || defaultValue}</span>;
        } else {
            return <span style={{ paddingRight: '90%', cursor: 'pointer' }} className={'empty-field'}></span>;
        }
    }

    renderAggregated(cellInfo, prop, defaultValue, orderChild, displayClick) {
        let newCellInfo = Object.assign({}, cellInfo);
        if (orderChild && newCellInfo.subRows.length > 1) {
            let newSubrows = _.orderBy(cellInfo.subRows, cellInfo.subRows.map((item) => item._original.start_time));
            newCellInfo.subRows = newSubrows;
        }
        if (newCellInfo.subRows[0] !== undefined && newCellInfo.subRows[0]._original[prop] !== '') {
            if (prop !== '' || defaultValue !== '') {
                return <span className="react-table-click-text table-click">{newCellInfo.subRows[0]._original[prop] || defaultValue}</span>;
            } else {
                return <span style={{ paddingRight: '90%', cursor: 'pointer' }} className={'empty-field'}></span>;
            }
        } else {
            return <span style={{ paddingRight: '90%', cursor: 'pointer' }} className={'empty-field'}></span>;
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
            return <span className="react-table-click-text table-click">
                {cellInfo.subRows[0]._original[prop]}
            </span>
        } else {
            return <span style={
                (!moment(cellInfo.subRows[0]._original.hour_interval_start).isSame(getCurrentTime(), 'hours') && this.state.signoff_reminder) ?
                    { paddingRight: '90%', cursor: 'pointer' } :
                    { paddingRight: '80%', cursor: 'pointer' }}
                className={'empty-field'}>
                {!moment(cellInfo.subRows[0]._original.hour_interval_start).isSame(moment(getCurrentTime()).add(-1, 'hours'), 'hours') ? '' :
                    this.state.signoff_reminder === true ? <span style={{ textAlign: 'center' }}><FontAwesome name="warning" className={'signoff-reminder-icon'} /></span> : null}
            </span>;
        }
    }

    getExpandClick(state, rowInfo, column) {
        // this deletes the first repeated row in children section
        // rowInfo.subRows && rowInfo.subRows.length > 1 ? delete rowInfo.subRows[0]: void(0);
        // end of fix
        const needsExpander = rowInfo.subRows && rowInfo.subRows.length > 1 ? true : false;
        const expanderEnabled = !column.disableExpander;
        const expandedRows = Object.keys(this.state.expanded).filter(expandedIndex => {
            return this.state.expanded[expandedIndex] !== false;
        }).map(Number);
        const rowIsExpanded =
            expandedRows.includes(rowInfo.nestingPath[0]) && needsExpander
                ? true
                : false;
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
        const columns = [
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
                style: this.getStyle(true, 'left'),
                Pivot: (row) => {
                    return <span>{moment(row.subRows[0]._original.hour_interval_start).isSame(getCurrentTime(), 'hours') ? row.value + '*' : row.value}</span>
                },
                disableExpander: false,
                filterMethod: (filter, rows) =>
                    matchSorter(rows, filter.value, { keys: ["hour_interval"] }),
                filterAll: true,
                getProps: (state, rowInfo, column) => this.getExpandClick(state, rowInfo, column)
            }, {
                Header: this.getHeader(this.state.partNumberText),
                minWidth: 180,
                accessor: 'product_code',
                Cell: c => this.renderCell(c, 'product_code', '', true, false, 'manualentry'),
                Aggregated: a => this.renderAggregated(a, 'summary_product_code', '', true, true, 'manualentry'),
                style: this.getStyle(false, 'center'),
                PivotValue: <span>{''}</span>
            }, {
                Header: this.getHeader(this.state.idealText),
                accessor: 'ideal',
                minWidth: 90,
                Cell: c => this.renderCell(c, 'ideal', '0', true, true, 'values', c.original),
                Aggregated: a => this.renderAggregated(a, 'summary_ideal', '', false, false),
                style: this.getStyle(false, 'center')
            }, {
                Header: this.getHeader(this.state.targetText),
                accessor: 'target_pcs',
                minWidth: 90,
                Cell: c => this.renderCell(c, 'target_pcs', !moment(c.original.hour_interval_start).isAfter(getCurrentTime()) ? 0 : null, false, false),
                Aggregated: a => this.renderAggregated(a, 'summary_target', !moment(a.subRows[0]._original.hour_interval_start).isAfter(getCurrentTime()) ? 0 : null, false, false),
                style: this.getStyle(true, 'center')
            }, {
                Header: this.getHeader(this.state.actualText),
                accessor: 'actual_pcs',
                minWidth: 90,
                Cell: c => this.renderCell(c, 'actual_pcs', !moment(c.original.hour_interval_start).isAfter(getCurrentTime()) ? 0 : null, true, true, 'values'),
                Aggregated: a => this.renderAggregated(a, 'summary_actual', !moment(a.subRows[0]._original.hour_interval_start).isAfter(getCurrentTime()) ? 0 : null, false, true, 'values'),
                getProps: (state, rowInfo, column) => this.getStyle(false, 'center', rowInfo, column)
            }, {
                Header: this.getHeader(this.state.cumulativeTargetText),
                accessor: 'cumulative_target_pcs',
                minWidth: 90,
                Cell: c => this.renderCell(c, 'cumulative_target_pcs', !moment(c.original.hour_interval_start).isAfter(getCurrentTime()) ? 0 : null, false, false),
                Aggregated: a => this.renderAggregated(a, 'cumulative_target_pcs', !moment(a.subRows[0]._original.hour_interval_start).isAfter(getCurrentTime()) ? 0 : null, false, false),
                style: this.getStyle(true, 'center'),
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
                style: this.getStyle(false, 'center')
            }, {
                Header: this.getHeader(this.state.operatorText),
                accessor: 'oper_id',
                minWidth: 90,
                Cell: c => this.renderCell(c, '', '', false, false),
                Aggregated: a => this.renderAggregatedSignOff(a, 'oper_id', 'operator_signoff', 'signoff', 'operator'),
                style: this.getStyle(false, 'center')
            }, {
                Header: this.getHeader(this.state.supervisorText),
                accessor: 'superv_id',
                minWidth: 90,
                Cell: c => this.renderCell(c, '', '', false, false),
                Aggregated: a => this.renderAggregatedSignOff(a, 'superv_id', 'supervisor_signoff', 'signoff', 'supervisor'),
                style: this.getStyle(false, 'center')
            }
        ];

        return columns;
    }

    render() {
        const t = this.props.t;
        const back = t('Back');
        const next = t('Next');
        const page = t('Page');
        const off = t('Of');
        const rows = t('Rows');
        return (
            <React.Fragment>
                <div className="wrapper-main">
                    <Row style={{ paddingLeft: '5%' }}>
                        <Col md={3}><h5>{t('Day by Hour Tracking')}</h5></Col>
                        <Col md={3}><h5>{t('Machine/Cell')}: {this.state.machine}</h5></Col>
                        <Col md={3}><h5 style={{ textTransform: 'Capitalize' }}>{this.props.user.first_name ?
                            `${this.props.user.first_name} ${this.props.user.last_name.charAt(0)}, ` : void (0)}{`(${this.props.user.role})`}</h5></Col>
                        <Col md={3}><h5 style={{ fontSize: '1.0em' }}>{'Showing Data for: '}
                            {!_.isEmpty(this.state.data) ? moment(this.state.date).format('LL') : null}</h5></Col>
                    </Row>
                    {!_.isEmpty(this.state.data) ?
                        <ReactTable
                            sortable={false}
                            data={this.state.data}
                            columns={this.state.columns}
                            showPaginationBottom={false}
                            headerStyle={{ fontSize: '0.5em' }}
                            previousText={back}
                            nextText={next}
                            pageText={page}
                            ofText={off}
                            headerClassName={"wordwrap"}
                            rowsText={rows}
                            pivotBy={["hour_interval"]}
                            onExpandedChange={newExpanded => this.onExpandedChange(newExpanded)}
                            expanded={this.state.expanded}
                            resizable={false}
                        /> : <Spinner />}
                </div>
            </React.Fragment>
        )
    }

};

export default Summary;