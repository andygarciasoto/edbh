import React from 'react';
import ReactTable from 'react-table';
import _ from 'lodash';
import moment from 'moment';
import {
    getRowsFromShifts,
    formatDate,
    getResponseFromGeneric,
    genericRequest
} from '../../Utils/Requests';
import { getStartEndDateTime } from '../../Utils/Utils';
import { API } from '../../Utils/Constants';
import Spinner from '../Common/Spinner';
import dashboardHelper from '../../Utils/DashboardHelper';
import ManualEntryModal from '../Modal/ManualEntryModal';
import ActualModal from '../Modal/ActualModal';
import ScrapModal from '../Modal/Reason/ScrapModal';
import TimelostModal from '../Modal/Reason/TimelostModal';
import CommentModal from '../Modal/CommentModal';
import SignoffModal from '../Modal/SignoffModal';
import OrderModal from '../Modal/OrderModal';
import ActiveOperatorsModal from '../Modal/OperatorComponent/ActiveOperatorsModal';
import 'react-table/react-table.css';
import '../../sass/DashboardTable.scss';
const axios = require('axios');
let dashOneToken = null;
let verticalToken = null;

class DashboardTable extends React.Component {
    constructor(props) {
        super(props);
        let temporalState = Object.assign(this.getInitialState(props), this.getTextTranslations(props));
        this.state = Object.assign(temporalState, this.getTableColumns(temporalState, props));
    }

    getInitialState(props) {
        return {
            data: [],
            columns: [],
            selectedAssetOption: props.selectedAssetOption,
            selectedDate: props.selectedDate,
            selectedShift: props.selectedShift,
            currentLanguage: props.currentLanguage,
            expanded: {},
            currentRow: {},
            modal_manualentry_IsOpen: false,
            modal_actual_IsOpen: false,
            modal_scrap_IsOpen: false,
            modal_timelost_IsOpen: false,
            modal_comments_IsOpen: false,
            modal_signoff_IsOpen: false,
            signOffModalType: '',
            modal_order_IsOpen: false,
            modal_active_operators_IsOpen: false
        };
    }

    getTextTranslations(props) {
        return {
            shiftText: props.t(props.selectedShift),
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
            operatorCountText: props.t('Operator Count'),
            supervisorText: props.t('Supervisor')
        }
    }

    componentDidMount() {
        this.fetchData([this.state.selectedAssetOption, this.state.selectedDate, this.state.selectedShift], this.props);
        try {
            this.props.socket.on('message', response => {
                if (response.message) {
                    this.fetchData([this.state.selectedAssetOption, this.state.selectedDate, this.state.selectedShift], this.props);
                }
            });
        } catch (e) { console.log(e) }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (!_.isEqual(nextProps.selectedAssetOption, prevState.selectedAssetOption) || !_.isEqual(nextProps.selectedDate, prevState.selectedDate) ||
            !_.isEqual(nextProps.selectedShift, prevState.selectedShift) || !_.isEqual(nextProps.currentLanguage, prevState.currentLanguage)) {
            const expanded = !_.isEqual(nextProps.selectedAssetOption, prevState.selectedAssetOption) || !_.isEqual(nextProps.selectedDate, prevState.selectedDate) ||
                !_.isEqual(nextProps.selectedShift, prevState.selectedShift) ? {} : prevState.expanded
            return {
                selectedAssetOption: nextProps.selectedAssetOption,
                selectedDate: nextProps.selectedDate,
                selectedShift: nextProps.selectedShift,
                currentLanguage: nextProps.currentLanguage,
                expanded
            }
        } else return null;
    }

    componentDidUpdate(prevProps, prevState) {
        if (!_.isEqual(this.state.currentLanguage, prevState.currentLanguage) || !_.isEqual(this.state.selectedShift, prevState.selectedShift) ||
            !_.isEqual(this.state.selectedAssetOption, prevState.selectedAssetOption)) {
            let temporalState = Object.assign(this.getTextTranslations(this.props));
            this.setState(Object.assign(temporalState, this.getTableColumns(temporalState, this.props)));
        }
        if (!_.isEqual(this.state.selectedAssetOption, prevState.selectedAssetOption) || !_.isEqual(this.state.selectedDate, prevState.selectedDate) ||
            !_.isEqual(this.state.selectedShift, prevState.selectedShift)) {
            this.fetchData([this.state.selectedAssetOption, this.state.selectedDate, this.state.selectedShift], this.props);
        }
    }

    fetchData = (data, props) => {
        props = props ? props : this.props;
        if (props.summary) {
            this.loadDataAllShift(data, props);
        } else {
            this.loadDataCurrentShift(data, props);
        }
    }

    loadDataAllShift(filter, props) {

        if (filter && filter[0]) {

            const { start_date_time } = getStartEndDateTime(formatDate(filter[1]), this.props.user.shifts[0].shift_name, this.props.user);
            const { end_date_time } = getStartEndDateTime(formatDate(filter[1]), this.props.user.shifts[this.props.user.shifts.length - 1].shift_name, this.props.user);



            if (verticalToken !== null) {
                verticalToken.cancel('Previous request canceled, new request is send');
            }
            verticalToken = axios.CancelToken.source();

            const parameters2 = {
                mc: filter[0].asset_code,
                dt: formatDate(filter[1]).split("-").join(""),
                start_date_time: start_date_time,
                end_date_time: end_date_time,
                st: props.user.site
            };

            getResponseFromGeneric('get', API, '/data', null, parameters2, {}, verticalToken.token).then(response => {
                let data = [];
                let current_shift = null;
                let startShift = 0;
                _.forEach(response, (value) => {
                    if (current_shift && (current_shift.shift_code === value.shift_code || value.shift_code === null)) {
                        data = _.concat(data, [value]);
                    } else {
                        current_shift = {
                            'shift_code': props.user.shifts[startShift].shift_code,
                            'hour_interval': props.user.shifts[startShift].shift_name, 'summary_product_code': this.state.partNumberText, 'summary_ideal': this.state.idealText,
                            'summary_target': this.state.targetText, 'summary_adjusted_actual': this.state.actualText, 'summary_scrap': this.state.scrapText, 'cumulative_target': this.state.cumulativeTargetText,
                            'cumulative_adjusted_actual': this.state.cumulativeActualText, 'timelost_summary': this.state.timeLostText, 'latest_comment': this.state.commentsActionText,
                            'operator_signoff': this.state.operatorText, 'active_operators': this.state.operatorCountText, 'supervisor_signoff': this.state.supervisorText
                        };
                        if (data === []) {
                            data = _.concat([current_shift], [value]);
                        } else {
                            data = _.concat(data, [current_shift], [value]);
                        }
                        startShift += 1;
                    }
                });

                let currentRow = this.state.currentRow;
                if (currentRow) {
                    currentRow = _.find(data, { productiondata_id: currentRow.productiondata_id }) || _.find(data, { dxhdata_id: currentRow.dxhdata_id });
                }
                this.setState({
                    data,
                    currentRow
                });
            }, error => {
                console.log(error);
            });
        }
    }

    async loadDataCurrentShift(filter, props) {

        if (filter && filter[0]) {

            let tz = this.state.commonParams ? this.state.commonParams.value : props.user.timezone;

            const { start_date_time, end_date_time } = getStartEndDateTime(formatDate(filter[1]), filter[2], this.props.user);

            const parameters = {
                mc: filter[0].asset_code,
                start_date_time: start_date_time,
                end_date_time: end_date_time,
                st: props.user.site,
                dt: formatDate(filter[1]).split("-").join("")
            }

            if (dashOneToken !== null) {
                dashOneToken.cancel('Previous request canceled, new request is send');
            }
            dashOneToken = axios.CancelToken.source();

            genericRequest('get', API, '/data', null, parameters, {}, dashOneToken.token).then(response => {
                dashOneToken = null;
                let data = response.data;
                let alertModalOverProd = false;
                let alertMessageOverProd = '';
                if (data[0] && data[0].order_quantity < data[0].summary_actual_quantity && moment().tz(tz).minutes() === 0 &&
                    (props.user.role === 'Supervisor' || props.user.role === 'Operator')) {
                    alertModalOverProd = true;
                    alertMessageOverProd = `Day by Hour has calculated the Order for Part ${data[0].product_code_order} is complete.  Please start a new Order when available. `;
                }

                let currentRow = this.state.currentRow;
                if (currentRow) {
                    currentRow = _.find(data, { productiondata_id: currentRow.productiondata_id }) || _.find(data, { dxhdata_id: currentRow.dxhdata_id });
                }

                this.setState({
                    data,
                    alertModalOverProd,
                    alertMessageOverProd,
                    currentRow
                });
            });
        }
    }

    openModalMessage = (messageModalType, messageModalMessage) => {
        this.setState({ messageModalType, messageModalMessage, modal_message_Is_Open: true })
    }

    closeModal = () => {
        this.setState({
            modal_manualentry_IsOpen: false,
            modal_actual_IsOpen: false,
            modal_scrap_IsOpen: false,
            modal_timelost_IsOpen: false,
            modal_comments_IsOpen: false,
            modal_signoff_IsOpen: false,
            signOffModalType: '',
            modal_order_IsOpen: false,
            modal_active_operators_IsOpen: false
        });
    }

    render() {

        const { data, columns } = this.state;
        const num_rows = getRowsFromShifts(this.props, this.props.summary);
        const t = this.props.t;
        const back = t('Back');
        const next = t('Next');
        const page = t('Page');
        const off = t('Of');
        const rows = t('Rows');

        return (
            <React.Fragment>
                {!_.isEmpty(data) ?
                    <ReactTable
                        getTheadThProps={(state, rowInfo, column) => {
                            return this.props.summary ?
                                {
                                    style: { display: 'none' } // override style for 'myHeaderTitle'.
                                }
                                : {}
                        }}
                        getTdProps={(state, rowInfo, column) => {
                            return {
                                onClick: () => {
                                    this.clickWholeCell(rowInfo, column)
                                },
                                style: {
                                    cursor: rowInfo && rowInfo.level === 0 && rowInfo.subRows[0]._original.hour_interval.includes('Shift') ? '' : 'pointer'
                                }
                            }
                        }}
                        sortable={false}
                        data={data}
                        columns={columns}
                        showPaginationBottom={false}
                        pageSize={num_rows}
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
                <ManualEntryModal
                    isOpen={this.state.modal_manualentry_IsOpen}
                    onRequestClose={this.closeModal}
                    currentRow={this.state.currentRow}
                    parentData={[this.state.selectedAssetOption, this.state.selectedDate, this.state.selectedShift]}
                    Refresh={this.fetchData}
                    user={this.props.user}
                    t={t}
                    selectedAssetOption={this.props.selectedAssetOption}
                    activeOperators={this.props.activeOperators}
                    isEditable={this.state.isEditable}
                />
                <ActualModal
                    isOpen={this.state.modal_actual_IsOpen}
                    onRequestClose={this.closeModal}
                    currentRow={this.state.currentRow}
                    parentData={[this.state.selectedAssetOption, this.state.selectedDate, this.state.selectedShift]}
                    Refresh={this.fetchData}
                    user={this.props.user}
                    t={t}
                    selectedAssetOption={this.props.selectedAssetOption}
                    activeOperators={this.props.activeOperators}
                    isEditable={this.state.isEditable}
                />
                <ScrapModal
                    isOpen={this.state.modal_scrap_IsOpen}
                    onRequestClose={this.closeModal}
                    currentRow={this.state.currentRow}
                    parentData={[this.state.selectedAssetOption, this.state.selectedDate, this.state.selectedShift, this.state.selectedHour]}
                    Refresh={this.fetchData}
                    user={this.props.user}
                    t={t}
                    selectedAssetOption={this.props.selectedAssetOption}
                    activeOperators={this.props.activeOperators}
                    isEditable={this.state.isEditable}
                />
                <TimelostModal
                    isOpen={this.state.modal_timelost_IsOpen}
                    onRequestClose={this.closeModal}
                    currentRow={this.state.currentRow}
                    parentData={[this.state.selectedAssetOption, this.state.selectedDate, this.state.selectedShift, this.state.selectedHour]}
                    Refresh={this.fetchData}
                    user={this.props.user}
                    t={t}
                    selectedAssetOption={this.props.selectedAssetOption}
                    activeOperators={this.props.activeOperators}
                    isEditable={this.state.isEditable}
                />
                <CommentModal
                    isOpen={this.state.modal_comments_IsOpen}
                    onRequestClose={this.closeModal}
                    currentRow={this.state.currentRow}
                    parentData={[this.state.selectedAssetOption, this.state.selectedDate, this.state.selectedShift, this.state.selectedHour]}
                    Refresh={this.fetchData}
                    user={this.props.user}
                    t={t}
                    selectedAssetOption={this.props.selectedAssetOption}
                    activeOperators={this.props.activeOperators}
                    isEditable={this.state.isEditable}
                />
                <SignoffModal
                    isOpen={this.state.modal_signoff_IsOpen}
                    signOffModalType={this.state.signOffModalType}
                    onRequestClose={this.closeModal}
                    currentRow={this.state.currentRow}
                    parentData={[this.state.selectedAssetOption, this.state.selectedDate, this.state.selectedShift, this.state.selectedHour]}
                    Refresh={this.fetchData}
                    user={this.props.user}
                    t={t}
                    selectedAssetOption={this.props.selectedAssetOption}
                    activeOperators={this.props.activeOperators}
                    isEditable={this.state.isEditable}
                />
                <OrderModal
                    isOpen={this.props.modal_order_IsOpen}
                    onRequestClose={() => this.props.displayOrderModal(false)}
                    parentData={[this.state.selectedAssetOption, this.state.selectedDate, this.state.selectedShift, this.state.selectedHour]}
                    selectedAssetOption={this.props.selectedAssetOption}
                    modalTitle={'New Order'}
                    inputText={'Please scan the new order code...'}
                    user={this.props.user}
                    t={t}
                />
                <ActiveOperatorsModal
                    isOpen={this.state.modal_active_operators_IsOpen}
                    onRequestClose={this.closeModal}
                    currentRow={this.state.currentRow}
                    selectedAssetOption={this.state.selectedAssetOption}
                    t={t}
                />
            </React.Fragment>
        );
    }
}

Object.assign(DashboardTable.prototype, dashboardHelper);

export default DashboardTable;