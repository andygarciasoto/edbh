import React from 'react';
import classNames from "classnames";
import matchSorter from "match-sorter";
import moment from 'moment';
import {
    getCurrentTime,
    isFieldAllowed,
    isComponentValid,
    formatNumber,
    convertNumber
} from '../Utils/Requests';
import _ from 'lodash';
import FontAwesome from 'react-fontawesome';

const helpers = {

    getHeader(text) {
        return <span className={'wordwrap'} data-tip={text}>{text}</span>
    },

    getStyle(applyGrey, align, rowInfo, column) {
        let style = {};
        let rowValid = rowInfo ? (rowInfo.subRows ? rowInfo.subRows[0] : rowInfo.row) : null;
        let useIndividualValues = rowInfo ? (rowInfo.subRows ? (rowInfo.subRows.length > 1 ? false : true) : true) : true;

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

        if (rowValid && (rowValid.hour_interval === this.props.t('3rd Shift') || rowValid.hour_interval === this.props.t('1st Shift') || rowValid.hour_interval === this.props.t('2nd Shift') || rowValid.hour_interval === this.props.t('No Shift'))) {
            style.textAlign = 'center';
            style.borderRight = 'solid 1px rgb(219, 219, 219)';
            style.borderTop = 'solid 1px rgb(219, 219, 219)';
            style.backgroundColor = 'white';
        } else if (rowValid && column.id === 'actual' && !moment(rowValid._original.started_on_chunck).isAfter(getCurrentTime(this.props.user.timezone))) {
            if (useIndividualValues) {
                style.backgroundColor = (convertNumber(rowValid.ideal, this.state.uom_asset) === 0 && convertNumber(rowValid.target, this.state.uom_asset) === 0) ||
                    (convertNumber(rowValid._original.actual, this.state.uom_asset) === 0 && convertNumber(rowValid._original.target, this.state.uom_asset) === 0) ||
                    (convertNumber(rowValid._original.actual, this.state.uom_asset) < convertNumber(rowValid._original.target, this.state.uom_asset)) ? '#b80600' : 'green';
                style.backgroundImage = (convertNumber(rowValid.ideal, this.state.uom_asset) === 0 && convertNumber(rowValid.target, this.state.uom_asset) === 0) ||
                    (convertNumber(rowValid._original.actual, this.state.uom_asset) === 0 && convertNumber(rowValid._original.target, this.state.uom_asset) === 0) ||
                    (convertNumber(rowValid._original.actual, this.state.uom_asset) < convertNumber(rowValid._original.target, this.state.uom_asset)) ? 'url("../dark-circles.png")' :
                    'url("../arabesque.png")';
            } else {
                style.backgroundColor = (convertNumber(rowValid._original.summary_ideal, this.state.uom_asset) === 0 && convertNumber(rowValid._original.summary_target, this.state.uom_asset) === 0) ||
                    (convertNumber(rowValid._original.summary_actual, this.state.uom_asset) === 0 && convertNumber(rowValid._original.summary_target, this.state.uom_asset) === 0) ||
                    (convertNumber(rowValid._original.summary_actual, this.state.uom_asset) < convertNumber(rowValid._original.summary_target, this.state.uom_asset)) ? '#b80600' : 'green';
                style.backgroundImage = (convertNumber(rowValid._original.summary_ideal, this.state.uom_asset) === 0 && convertNumber(rowValid._original.summary_target, this.state.uom_asset) === 0) ||
                    (convertNumber(rowValid._original.summaty_actual, this.state.uom_asset) === 0 && convertNumber(rowValid._original.summary_target, this.state.uom_asset) === 0) ||
                    (convertNumber(rowValid._original.summary_actual, this.state.uom_asset) < convertNumber(rowValid._original.summary_target, this.state.uom_asset)) ? 'url("../dark-circles.png")' :
                    'url("../arabesque.png")';
            }
            style.color = 'white';

        } else if (rowValid && column.id === 'cumulative_actual' && rowInfo.subRows && !moment(rowInfo.subRows[0]._original.started_on_chunck).isAfter(getCurrentTime(this.props.user.timezone))) {
            style.backgroundColor = (convertNumber(rowValid._original.cumulative_actual, this.state.uom_asset) === 0) || (convertNumber(rowValid._original.cumulative_actual, this.state.uom_asset) < convertNumber(rowValid._original.cumulative_target, this.state.uom_asset)) ? '#b80600' : 'green';
            style.backgroundImage = (convertNumber(rowValid._original.cumulative_actual, this.state.uom_asset) === 0) || (convertNumber(rowValid._original.cumulative_actual, this.state.uom_asset) < convertNumber(rowValid._original.cumulative_target, this.state.uom_asset)) ? 'url("../dark-circles.png")' :
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
    },

    renderCell(cellInfo, prop, defaultValue, displayClick, displayEmptyClick) {
        if (cellInfo.original !== undefined) {
            return <span className="react-table-click-text table-click" onClick={() => displayClick ? this.openModal(arguments[5], cellInfo.original, prop, cellInfo.subRows !== undefined) : {}}>
                {cellInfo.original[prop] ? (isNaN(cellInfo.original[prop]) ? cellInfo.original[prop] : convertNumber(cellInfo.original[prop], this.state.uom_asset)) : defaultValue}
            </span>;
        } else {
            return <span style={{ paddingRight: '90%', cursor: 'pointer' }} className={'empty-field'} onClick={() => displayClick && displayEmptyClick ? this.openModal(arguments[5], cellInfo, prop, cellInfo.subRows !== undefined) : {}}></span>;
        }
    },

    renderAggregated(cellInfo, prop, defaultValue, orderChild, displayClick) {
        let newCellInfo = Object.assign({}, cellInfo);
        //if (orderChild && newCellInfo.subRows.length > 1) {
        //    let newSubrows = _.orderBy(cellInfo.subRows, cellInfo.subRows.map((item) => item._original.start_time));
        //    newCellInfo.subRows = newSubrows;
        //}
        let rowValid = newCellInfo ? (newCellInfo.subRows ? newCellInfo.subRows[0] : newCellInfo.row) : null;
        if (rowValid && (rowValid.hour_interval === this.props.t('3rd Shift') || rowValid.hour_interval === this.props.t('1st Shift') || rowValid.hour_interval === this.props.t('2nd Shift') || rowValid.hour_interval === this.props.t('No Shift'))) {
            prop = arguments[5] === 'dropdown' ? 'timelost_summary' : arguments[5] === 'comments' ? 'latest_comment' : prop;
            return <span className={'wordwrap'} data-tip={newCellInfo.subRows[0]._original[prop]}>{newCellInfo.subRows[0]._original[prop]}</span>
        }
        if (newCellInfo.subRows[0] !== undefined && newCellInfo.subRows[0]._original[prop] !== '') {
            if (prop !== '' || defaultValue !== '') {
                return <span className="react-table-click-text table-click" onClick={() => displayClick ? this.openModal(arguments[5], cellInfo.subRows[0]._original, prop, cellInfo.subRows.length > 1) : {}}>
                    {newCellInfo.subRows[0]._original[prop] ?
                        (isNaN(newCellInfo.subRows[0]._original[prop]) ? this.props.t(newCellInfo.subRows[0]._original[prop]) : (this.state.uom_asset && this.state.uom_asset.decimals ? (Math.round(newCellInfo.subRows[0]._original[prop] * 10 + Number.EPSILON) / 10) : Math.floor(newCellInfo.subRows[0]._original[prop]))) : defaultValue}
                </span>;
            } else {
                return <span style={{ paddingRight: '90%', cursor: 'pointer' }} className={'empty-field'} onClick={() => displayClick ? this.openModal(arguments[5], cellInfo.subRows[0]._original, prop, cellInfo.subRows.length > 1) : {}}></span>;
            }
        } else {
            return <span style={{ paddingRight: '90%', cursor: 'pointer' }} className={'empty-field'} onClick={() => displayClick ? this.openModal(arguments[5], cellInfo.subRows[0]._original, prop, cellInfo.subRows.length > 1) : {}}></span>;
        }
    },

    getTimeLostToSet(cellInfo) {
        return moment(getCurrentTime(this.props.user.timezone)).isSame(moment(cellInfo.subRows[0]._original.started_on_chunck), 'hours') ||
            !moment(getCurrentTime(this.props.user.timezone)).isBefore(moment(cellInfo.subRows[0]._original.started_on_chunck), 'hours') ? formatNumber(cellInfo.subRows[0]._original.unallocated_time) : null;
    },

    getCommentsToSet(cellInfo) {
        return cellInfo.subRows[0]._original.comment ? cellInfo.subRows[0]._original.total_comments > 1 ? cellInfo.subRows[0]._original.comment
            + ` (${(cellInfo.subRows[0]._original.total_comments - 1)}+ more)` : cellInfo.subRows[0]._original.comment : '';
    },

    renderAggregatedSignOff(cellInfo, prop, role) {
        if (cellInfo.subRows[0]._original[prop] !== null && cellInfo.subRows[0]._original[prop] !== '') {
            return <span className="react-table-click-text table-click" onClick={() => isComponentValid(this.props.user.role, role) && !this.state.summary ? this.openModal(arguments[3], cellInfo.subRows[0]._original, arguments[4], cellInfo.subRows.length > 1) : void (0)}>
                {cellInfo.subRows[0]._original[prop]}
            </span>
        } else {
            return <span style={
                (!moment(cellInfo.subRows[0]._original.started_on_chunck).isSame(getCurrentTime(this.props.user.timezone), 'hours') && this.state.signoff_reminder) ?
                    { paddingRight: '90%', cursor: 'pointer' } :
                    { paddingRight: '80%', cursor: 'pointer' }}
                className={'empty-field'} onClick={() =>
                    isComponentValid(this.props.user.role, role) && !this.state.summary ? this.openModal(arguments[3], cellInfo.subRows[0]._original, arguments[4], cellInfo.subRows.length > 1) : void (0)}>
                {!moment(cellInfo.subRows[0]._original.started_on_chunck).isSame(moment(getCurrentTime(this.props.user.timezone)).add(-1, 'hours'), 'hours') ? '' :
                    this.state.signoff_reminder && role === 'operator_signoff' ? <span style={{ textAlign: 'center' }}><FontAwesome name="warning" className={'signoff-reminder-icon'} /></span> : null}
            </span>;
        }
    },

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
    },

    getTableColumns(state) {
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
                Header: this.getHeader(state.shiftText),
                accessor: 'hour_interval',
                minWidth: 130,
                Pivot: (row) => {
                    let rowValid = row ? (row.subRows ? row.subRows[0] : row.row) : null;
                    if (rowValid && (rowValid.hour_interval === this.props.t('3rd Shift') || rowValid.hour_interval === this.props.t('1st Shift') || rowValid.hour_interval === this.props.t('2nd Shift') || rowValid.hour_interval === this.props.t('No Shift'))) {
                        return <span className={'wordwrap'} data-tip={row.value}>{row.value}</span>
                    } else {
                        return <span>{moment(row.subRows[0]._original.started_on_chunck).isSame(moment(getCurrentTime(this.props.user.timezone)), 'hours') ? row.value + '*' : row.value}</span>
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
            }, {
                Header: this.getHeader(state.partNumberText),
                minWidth: 180,
                accessor: 'product_code',
                Cell: c => this.renderCell(c, 'product_code', '', true, false, 'manualentry'),
                Aggregated: a => this.renderAggregated(a, 'summary_product_code', '', true, true, 'manualentry'),
                PivotValue: <span>{''}</span>,
                getProps: (state, rowInfo, column) => this.getStyle(false, 'center', rowInfo, column)
            }, {
                Header: this.getHeader(state.idealText),
                accessor: 'ideal',
                minWidth: 90,
                Cell: c => this.renderCell(c, 'ideal', 0, true, true, 'values', c.original),
                Aggregated: a => this.renderAggregated(a, 'summary_ideal', !moment(a.subRows[0]._original.started_on_chunck).isAfter(getCurrentTime(this.props.user.timezone)) ? 0 : null, false, false),
                getProps: (state, rowInfo, column) => this.getStyle(false, 'center', rowInfo, column)
            }, {
                Header: this.getHeader(state.targetText),
                accessor: 'target',
                minWidth: 90,
                Cell: c => this.renderCell(c, 'target', !moment(c.original.started_on_chunck).isAfter(getCurrentTime(this.props.user.timezone)) ? 0 : null, false, false),
                Aggregated: a => this.renderAggregated(a, 'summary_target', !moment(a.subRows[0]._original.started_on_chunck).isAfter(getCurrentTime(this.props.user.timezone)) ? 0 : null, false, false),
                getProps: (state, rowInfo, column) => this.getStyle(true, 'center', rowInfo, column)
            }, {
                Header: this.getHeader(state.actualText),
                accessor: 'actual',
                minWidth: 90,
                Cell: c => this.renderCell(c, 'actual', !moment(c.original.started_on_chunck).isAfter(getCurrentTime(this.props.user.timezone)) ? 0 : null, true, true, 'values'),
                Aggregated: a => this.renderAggregated(a, 'summary_actual', !moment(a.subRows[0]._original.started_on_chunck).isAfter(getCurrentTime(this.props.user.timezone)) ? 0 : null, false, true, 'values'),
                getProps: (state, rowInfo, column) => this.getStyle(false, 'center', rowInfo, column)
            },
            // {
            //     Header: this.getHeader(state.scrapText),
            //     accessor: 'scrap',
            //     minWidth: 90,
            //     Cell: c => this.renderCell(c, 'scrap', !moment(c.original.started_on_chunck).isAfter(getCurrentTime(this.props.user.timezone)) ? 0 : null, true, true, 'scrap'),
            //     Aggregated: a => this.renderAggregated(a, 'summary_scrap', !moment(a.subRows[0]._original.started_on_chunck).isAfter(getCurrentTime(this.props.user.timezone)) ? 0 : null, false, a.subRows.length === 1, 'scrap'),
            //     getProps: (state, rowInfo, column) => this.getStyle(false, 'center', rowInfo, column)
            // },
            {
                Header: this.getHeader(state.cumulativeTargetText),
                accessor: 'cumulative_target',
                minWidth: 90,
                Cell: c => this.renderCell(c, 'cumulative_target', !moment(c.original.started_on_chunck).isAfter(getCurrentTime(this.props.user.timezone)) ? 0 : null, false, false),
                Aggregated: a => this.renderAggregated(a, !moment(a.subRows[0]._original.started_on_chunck).isAfter(getCurrentTime(this.props.user.timezone)) ? 'cumulative_target' : '', !moment(a.subRows[0]._original.started_on_chunck).isAfter(getCurrentTime(this.props.user.timezone)) ? 0 : null, false, false),
                getProps: (state, rowInfo, column) => this.getStyle(true, 'center', rowInfo, column)
            }, {
                Header: this.getHeader(state.cumulativeActualText),
                accessor: 'cumulative_actual',
                minWidth: 90,
                Cell: c => this.renderCell(c, '', '', false, false),
                Aggregated: a => this.renderAggregated(a, !moment(a.subRows[0]._original.started_on_chunck).isAfter(getCurrentTime(this.props.user.timezone)) ? 'cumulative_actual' : '', !moment(a.subRows[0]._original.started_on_chunck).isAfter(getCurrentTime(this.props.user.timezone)) ? 0 : null, false, false),
                getProps: (state, rowInfo, column) => this.getStyle(false, 'center', rowInfo, column)
            }, {
                Header: this.getHeader(state.timeLostText),
                accessor: 'timelost_summary',
                minWidth: 100,
                Cell: c => this.renderCell(c, '', '', false, false),
                Aggregated: a => this.renderAggregated(a, '', this.getTimeLostToSet(a), false, true, 'dropdown'),
                getProps: (state, rowInfo, column) => this.getStyle(false, 'center', rowInfo, column)
            }, {
                Header: this.getHeader(state.commentsActionText),
                accessor: 'latest_comment',
                Cell: c => this.renderCell(c, '', '', false, false),
                Aggregated: a => this.renderAggregated(a, '', this.getCommentsToSet(a), false, true, 'comments'),
                getProps: (state, rowInfo, column) => this.getStyle(false, 'center', rowInfo, column)
            }, {
                Header: this.getHeader(state.operatorText),
                accessor: 'operator_signoff',
                minWidth: 90,
                Cell: c => this.renderCell(c, '', '', false, false),
                Aggregated: a => this.renderAggregatedSignOff(a, 'operator_signoff', 'operator_signoff', 'signoff', 'operator'),
                getProps: (state, rowInfo, column) => this.getStyle(false, 'center', rowInfo, column)
            }, {
                Header: this.getHeader(state.supervisorText),
                accessor: 'supervisor_signoff',
                minWidth: 90,
                Cell: c => this.renderCell(c, '', '', false, false),
                Aggregated: a => this.renderAggregatedSignOff(a, 'supervisor_signoff', 'supervisor_signoff', 'signoff', 'supervisor'),
                getProps: (state, rowInfo, column) => this.getStyle(false, 'center', rowInfo, column)
            }
        ];

        return { columns };
    },

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
                        allowed = isFieldAllowed(this.props.user.role, val) && this.state.selectedMachineType === 'Manual';
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
                    allowed = isFieldAllowed(this.props.user.role, val) && this.state.selectedMachineType === 'Manual';
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
        if (type === 'scrap') {
            if (val) {
                const allowed = isFieldAllowed(this.props.user.role, val);
                if (isComponentValid(this.props.user.role, 'scrap')) {
                    this.setState({
                        modal_scrap_IsOpen: allowed,
                        modalType: 'number',
                        currentRow: val
                    })
                }
            }
        }
        if (type === 'signoff') {
            if (val) {
                if (((val.operator_signoff === null) && (extraParam === 'operator')) ||
                    ((val.supervisor_signoff === null) && (extraParam === 'supervisor'))) {
                    const allowed = isFieldAllowed(this.props.user.role, val);
                    this.setState({
                        modal_signoff_IsOpen: allowed,
                        currentRow: val,
                        signOffRole: extraParam ? extraParam : null,
                    })
                } else if (((val.operator_signoff !== null) && (extraParam === 'operator')) ||
                    ((val.supervisor_signoff !== null) && (extraParam === 'supervisor'))) {
                    if (moment(getCurrentTime(this.props.user.timezone)).isSame(val.started_on_chunck, 'hours')) {
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
    },

    onExpandedChange(newExpanded) {
        this.setState({
            expanded: newExpanded
        });
    }
}

export default helpers;