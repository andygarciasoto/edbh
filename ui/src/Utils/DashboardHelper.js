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

        if (rowValid && (rowValid.hour_interval.includes('Shift'))) {
            style.textAlign = 'center';
            style.borderRight = 'solid 1px rgb(219, 219, 219)';
            style.borderTop = 'solid 1px rgb(219, 219, 219)';
            style.backgroundColor = 'white';
        } else if (rowValid && column.id === 'actual' && !moment(rowValid._original.started_on_chunck).isAfter(getCurrentTime(this.props.user.timezone))) {
            if (useIndividualValues) {
                style.backgroundColor = (convertNumber(rowValid.ideal, this.state.uom_asset) === 0 && convertNumber(rowValid.target, this.state.uom_asset) === 0) ||
                    (convertNumber(rowValid._original.adjusted_actual, this.state.uom_asset) === 0 && convertNumber(rowValid._original.target, this.state.uom_asset) === 0) ||
                    (convertNumber(rowValid._original.adjusted_actual, this.state.uom_asset) < convertNumber(rowValid._original.target, this.state.uom_asset)) ? '#b80600' : 'green';
                style.backgroundImage = (convertNumber(rowValid.ideal, this.state.uom_asset) === 0 && convertNumber(rowValid.target, this.state.uom_asset) === 0) ||
                    (convertNumber(rowValid._original.adjusted_actual, this.state.uom_asset) === 0 && convertNumber(rowValid._original.target, this.state.uom_asset) === 0) ||
                    (convertNumber(rowValid._original.adjusted_actual, this.state.uom_asset) < convertNumber(rowValid._original.target, this.state.uom_asset)) ? 'url("../dark-circles.png")' :
                    'url("../arabesque.png")';
            } else {
                style.backgroundColor = (convertNumber(rowValid._original.summary_ideal, this.state.uom_asset) === 0 && convertNumber(rowValid._original.summary_target, this.state.uom_asset) === 0) ||
                    (convertNumber(rowValid._original.summary_adjusted_actual, this.state.uom_asset) === 0 && convertNumber(rowValid._original.summary_target, this.state.uom_asset) === 0) ||
                    (convertNumber(rowValid._original.summary_adjusted_actual, this.state.uom_asset) < convertNumber(rowValid._original.summary_target, this.state.uom_asset)) ? '#b80600' : 'green';
                style.backgroundImage = (convertNumber(rowValid._original.summary_ideal, this.state.uom_asset) === 0 && convertNumber(rowValid._original.summary_target, this.state.uom_asset) === 0) ||
                    (convertNumber(rowValid._original.summary_adjusted_actual, this.state.uom_asset) === 0 && convertNumber(rowValid._original.summary_target, this.state.uom_asset) === 0) ||
                    (convertNumber(rowValid._original.summary_adjusted_actual, this.state.uom_asset) < convertNumber(rowValid._original.summary_target, this.state.uom_asset)) ? 'url("../dark-circles.png")' :
                    'url("../arabesque.png")';
            }
            style.color = 'white';

        } else if (rowValid && column.id === 'cumulative_actual' && rowInfo.subRows && !moment(rowInfo.subRows[0]._original.started_on_chunck).isAfter(getCurrentTime(this.props.user.timezone))) {
            style.backgroundColor = (convertNumber(rowValid._original.cumulative_adjusted_actual, this.state.uom_asset) === 0) || (convertNumber(rowValid._original.cumulative_adjusted_actual, this.state.uom_asset) < convertNumber(rowValid._original.cumulative_target, this.state.uom_asset)) ? '#b80600' : 'green';
            style.backgroundImage = (convertNumber(rowValid._original.cumulative_adjusted_actual, this.state.uom_asset) === 0) || (convertNumber(rowValid._original.cumulative_adjusted_actual, this.state.uom_asset) < convertNumber(rowValid._original.cumulative_target, this.state.uom_asset)) ? 'url("../dark-circles.png")' :
                'url("../arabesque.png")';
            style.color = 'white';

        } else if (rowValid && column.id === 'timelost_summary' && !moment(rowValid._original.started_on_chunck).isAfter(getCurrentTime(this.props.user.timezone)) && rowInfo.subRows && rowInfo.row._subRows[0]._original.allocated_time !== 0) {

            style.backgroundColor = '#b80600';
            style.backgroundImage = 'url("../dark-circles.png")';
            style.color = 'white';

        } else {
            style.whiteSpace = 'normal!important';
        }
        return rowInfo ? { style } : style;
    },

    renderCell(row, prop, defaultValue) {
        if (row) {
            //validation for timelost and latest comment, don't work on render the value of each one only the text in the vertical view
            prop = !row.hour_interval.includes('Shift') ? (prop === 'timelost_summary' || prop === 'latest_comment' ? '' : prop) : prop;
            let valueToDisplay = (row[prop] ?
                (isNaN(row[prop]) ? row[prop] : convertNumber(row[prop], this.state.uom_asset, prop))
                : defaultValue);
            return valueToDisplay || valueToDisplay === 0 ?
                <span className={row.hour_interval.includes('Shift') ? 'wordwrap' : 'react-table-click-text table-click'} data-tip={valueToDisplay}>{valueToDisplay}</span> :
                <span style={{ paddingRight: '90%', cursor: 'pointer' }} className={'empty-field'}></span>;
        } else {
            return <span style={{ paddingRight: '90%', cursor: 'pointer' }} className={'empty-field'}></span>;
        }
    },

    getTimeLostToSet(row) {
        return moment(getCurrentTime(this.props.user.timezone)).isSame(moment(row.started_on_chunck), 'hours') ||
            !moment(getCurrentTime(this.props.user.timezone)).isBefore(moment(row.started_on_chunck), 'hours') ? formatNumber(row.unallocated_time) : null;
    },

    getCommentsToSet(row) {
        return row.comment ? row.total_comments > 1 ? row.comment + ` (${(row.total_comments - 1)}+ more)` : row.comment : '';
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
                    if (rowValid && (rowValid.hour_interval.includes('Shift'))) {
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
                Cell: c => this.renderCell(c.original, 'product_code', ''),
                Aggregated: a => this.renderCell(a.subRows[0]._original, 'summary_product_code', ''),
                PivotValue: <span>{''}</span>,
                getProps: (state, rowInfo, column) => this.getStyle(false, 'center', rowInfo, column)
            }, {
                Header: this.getHeader(state.idealText),
                accessor: 'ideal',
                minWidth: 90,
                Cell: c => this.renderCell(c.original, 'ideal', 0),
                Aggregated: a => this.renderCell(a.subRows[0]._original, 'summary_ideal', !moment(a.subRows[0]._original.started_on_chunck).isAfter(getCurrentTime(this.props.user.timezone)) ? 0 : ''),
                getProps: (state, rowInfo, column) => this.getStyle(false, 'center', rowInfo, column)
            }, {
                Header: this.getHeader(state.targetText),
                accessor: 'target',
                minWidth: 90,
                Cell: c => this.renderCell(c.original, 'target', !moment(c.original.started_on_chunck).isAfter(getCurrentTime(this.props.user.timezone)) ? 0 : ''),
                Aggregated: a => this.renderCell(a.subRows[0]._original, 'summary_target', !moment(a.subRows[0]._original.started_on_chunck).isAfter(getCurrentTime(this.props.user.timezone)) ? 0 : ''),
                getProps: (state, rowInfo, column) => this.getStyle(true, 'center', rowInfo, column)
            }, {
                Header: this.getHeader(state.actualText),
                accessor: 'actual',
                minWidth: 90,
                Cell: c => this.renderCell(c.original, 'adjusted_actual', !moment(c.original.started_on_chunck).isAfter(getCurrentTime(this.props.user.timezone)) ? 0 : null),
                Aggregated: a => this.renderCell(a.subRows[0]._original, 'summary_adjusted_actual', !moment(a.subRows[0]._original.started_on_chunck).isAfter(getCurrentTime(this.props.user.timezone)) ? 0 : ''),
                getProps: (state, rowInfo, column) => this.getStyle(false, 'center', rowInfo, column)
            },
            {
                Header: this.getHeader(state.scrapText),
                accessor: 'scrap',
                minWidth: 90,
                Cell: c => this.renderCell(c.original, 'scrap', !moment(c.original.started_on_chunck).isAfter(getCurrentTime(this.props.user.timezone)) ? 0 : ''),
                Aggregated: a => this.renderCell(a.subRows[0]._original, 'summary_scrap', !moment(a.subRows[0]._original.started_on_chunck).isAfter(getCurrentTime(this.props.user.timezone)) ? 0 : ''),
                getProps: (state, rowInfo, column) => this.getStyle(false, 'center', rowInfo, column)
            },
            {
                Header: this.getHeader(state.cumulativeTargetText),
                accessor: 'cumulative_target',
                minWidth: 90,
                Cell: c => this.renderCell(c.original, 'cumulative_target', !moment(c.original.started_on_chunck).isAfter(getCurrentTime(this.props.user.timezone)) ? 0 : ''),
                Aggregated: a => this.renderCell(a.subRows[0]._original, !moment(a.subRows[0]._original.started_on_chunck).isAfter(getCurrentTime(this.props.user.timezone)) ? 'cumulative_target' : '', !moment(a.subRows[0]._original.started_on_chunck).isAfter(getCurrentTime(this.props.user.timezone)) ? 0 : ''),
                getProps: (state, rowInfo, column) => this.getStyle(true, 'center', rowInfo, column)
            }, {
                Header: this.getHeader(state.cumulativeActualText),
                accessor: 'cumulative_actual',
                minWidth: 90,
                Cell: c => this.renderCell(c.original, '', ''),
                Aggregated: a => this.renderCell(a.subRows[0]._original, !moment(a.subRows[0]._original.started_on_chunck).isAfter(getCurrentTime(this.props.user.timezone)) ? 'cumulative_adjusted_actual' : '', !moment(a.subRows[0]._original.started_on_chunck).isAfter(getCurrentTime(this.props.user.timezone)) ? 0 : ''),
                getProps: (state, rowInfo, column) => this.getStyle(false, 'center', rowInfo, column)
            }, {
                Header: this.getHeader(state.timeLostText),
                accessor: 'timelost_summary',
                minWidth: 100,
                Cell: c => this.renderCell(c.original, 'timelost_summary', ''),
                Aggregated: a => this.renderCell(a.subRows[0]._original, 'timelost_summary', this.getTimeLostToSet(a.subRows[0]._original)),
                getProps: (state, rowInfo, column) => this.getStyle(false, 'center', rowInfo, column)
            }, {
                Header: this.getHeader(state.commentsActionText),
                accessor: 'latest_comment',
                Cell: c => this.renderCell(c.original, '', ''),
                Aggregated: a => this.renderCell(a.subRows[0]._original, 'latest_comment', this.getCommentsToSet(a.subRows[0]._original)),
                getProps: (state, rowInfo, column) => this.getStyle(false, 'center', rowInfo, column)
            }, {
                Header: this.getHeader(state.operatorText),
                accessor: 'operator_signoff',
                minWidth: 90,
                Cell: c => this.renderCell(c.original, '', ''),
                Aggregated: a => this.renderCell(a.subRows[0]._original, 'operator_signoff', ''),
                getProps: (state, rowInfo, column) => this.getStyle(false, 'center', rowInfo, column)
            }, {
                Header: this.getHeader(state.supervisorText),
                accessor: 'supervisor_signoff',
                minWidth: 90,
                Cell: c => this.renderCell(c.original, '', ''),
                Aggregated: a => this.renderCell(a.subRows[0]._original, 'supervisor_signoff', ''),
                getProps: (state, rowInfo, column) => this.getStyle(false, 'center', rowInfo, column)
            }
        ];

        return { columns };
    },

    clickWholeCell(rowInfo, column) {
        let openModal = false;
        let modalType = '';
        let row = {};
        if ((rowInfo.level === 0 && !rowInfo.subRows[0]._original.hour_interval.includes('Shift')) || rowInfo.level === 1) {
            switch (column.id) {
                case 'product_code':
                case 'timelost_summary':
                case 'latest_comment':
                case 'operator_signoff':
                case 'supervisor_signoff':
                    if (rowInfo.level === 0) {
                        modalType = column.id === 'product_code' ? 'manualentry' : (column.id === 'timelost_summary' ? 'timelost' : (column.id === 'latest_comment' ? 'comments' : column.id));
                        row = rowInfo.subRows[0]._original;
                        openModal = true;
                    }
                    break;
                case 'actual':
                case 'scrap':
                    if ((rowInfo.level === 0 && rowInfo.subRows.length === 1) || rowInfo.level === 1) {
                        modalType = column.id;
                        row = rowInfo.level === 0 ? rowInfo.subRows[0]._original : rowInfo.original;
                        openModal = true;
                    }
                    break;
                default:
                    openModal = false;
                    break;
            }
        }
        if (openModal) {
            this.openModal(modalType, row);
        }
    },

    openModal(modalType, currentRow) {

        let newModalProps = {};

        if (isComponentValid(this.props.user.role, modalType)) {
            newModalProps['modal_' + modalType + '_IsOpen'] = false;
            newModalProps.currentRow = currentRow;
            if (modalType === 'order') {
                newModalProps['modal_' + modalType + '_IsOpen'] = false;
            } else if (currentRow) {

                switch (modalType) {
                    //case 'manualentry':
                    case 'actual':
                        newModalProps['modal_' + modalType + '_IsOpen'] = this.state.selectedMachineType !== 'Automated';
                        break;
                    case 'timelost':
                    case 'comments':
                    case 'scrap':
                        newModalProps['modal_' + modalType + '_IsOpen'] = true;
                        break;
                    case 'supervisor_signoff':
                    case 'operator_signoff':
                        newModalProps['modal_signoff_IsOpen'] = true;
                        newModalProps['signOffModalType'] = modalType === 'supervisor_signoff' ? 'Supervisor' : 'Operator';
                        break;
                    default:
                        break;
                }

                newModalProps['readOnly'] = !isFieldAllowed(this.props.user.role, currentRow, this.props.user.timezone);

                this.setState(Object.assign(newModalProps));

            }

        } else {
            console.log('User can´t open this modal ' + modalType);
        }
    },

    onExpandedChange(newExpanded) {
        this.setState({
            expanded: newExpanded
        });
    }
}

export default helpers;