import React from 'react';
import CupsContainer from '../Components/DigitalCups/CupsContainer';
import InformationComponent from '../Components/DigitalCups/InformationComponent';
import Spinner from '../Components/Common/Spinner';
import { API } from '../Utils/Constants';
import { Row } from 'react-bootstrap';
import { getResponseFromGeneric, getCurrentTime, formatDate } from '../Utils/Requests';
import { getStartEndDateTime } from '../Utils/Utils';
import _ from 'lodash';
import moment from 'moment-timezone';
import '../sass/DigitalCups.scss';

class DigitalCups extends React.Component {
    constructor(props) {
        super(props);
        this.state = Object.assign(this.getInitialState(props));
    }

    getInitialState(props) {
        return {
            selectedLevelDC: props.search.sldc || 'Site',
            selectedAssetDC: props.search.sadc || props.user.site,
            selectedDate: props.search.dt || formatDate(props.user.date_of_shift) || getCurrentTime(props.user.timezone),
            selectedShift: props.search.sf || props.user.current_shift,
            currentLanguage: props.search.ln || props.user.language,
            assetList: [],
            spinner_isLoading: false
        };
    };

    componentDidMount() {
        this.setState({ spinner_isLoading: true }, () => {
            this.loadData();
        });
        try {
            this.props.socket.on('message', response => {
                if (response.message) {
                    this.loadData();
                }
            });
        } catch (e) { console.log(e) }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const selectedLevelDC = nextProps.search.sldc || 'Site';
        const selectedAssetDC = nextProps.search.sadc || nextProps.user.site;
        const selectedDate = nextProps.search.dt || formatDate(nextProps.user.date_of_shift) || getCurrentTime(nextProps.user.timezone);
        const selectedShift = nextProps.search.sf || nextProps.user.current_shift;
        const currentLanguage = nextProps.search.ln || nextProps.user.language;
        if (!_.isEqual(selectedLevelDC, prevState.selectedLevelDC) || !_.isEqual(selectedAssetDC, prevState.selectedAssetDC) ||
            !_.isEqual(selectedDate, prevState.selectedDate) || !_.isEqual(selectedShift, prevState.selectedShift) ||
            !_.isEqual(currentLanguage, prevState.currentLanguage)) {
            return {
                selectedLevelDC,
                selectedAssetDC,
                selectedDate,
                selectedShift,
                currentLanguage
            };
        }
        return null;
    }

    componentDidUpdate(prevProps, prevState) {
        if (!_.isEqual(this.state.selectedLevelDC, prevState.selectedLevelDC) || !_.isEqual(this.state.selectedAssetDC, prevState.selectedAssetDC) ||
            !_.isEqual(this.state.selectedDate, prevState.selectedDate) || !_.isEqual(this.state.selectedShift, prevState.selectedShift) ||
            !_.isEqual(this.state.currentLanguage, prevState.currentLanguage)) {
            this.setState({ spinner_isLoading: true }, () => {
                this.loadData();
            });
        }
    }

    async loadData() {
        const selectedLevelDC = this.state.selectedLevelDC;
        const { start_date_time, end_date_time } = getStartEndDateTime(this.state.selectedDate, this.state.selectedShift, this.props.user, true);
        const asset = {
            start_time: start_date_time,
            end_time: end_date_time,
            asset_id: selectedLevelDC === 'Area' ? this.state.selectedAssetDC : this.props.user.site,
            aggregation: selectedLevelDC === 'Area' ? 1 : 2,
            production_day: this.state.selectedDate
        };
        let assetList = await getResponseFromGeneric('get', API, '/digital_cups', {}, asset, {}) || [];
        if (selectedLevelDC === 'value_stream' || selectedLevelDC === 'workcell_name') {
            assetList = _.filter(assetList, { [selectedLevelDC]: this.state.selectedAssetDC })
        }

        const currentDatetime = moment.tz(this.props.user.timezone);

        assetList =
            _.chain(assetList)
                .groupBy('asset_code')
                .map((value, key) => {
                    const childrenLength = value.length;
                    const actualHour = value[childrenLength - 1];
                    let sequentialRed = 0;
                    let actualEscalation = {};

                    if (currentDatetime.isSameOrAfter(moment(start_date_time)) && currentDatetime.isBefore(moment(end_date_time))) {
                        _.forEach(value, row => {
                            if (currentDatetime.isAfter(moment.tz(row.end_time, this.props.user.timezone))) {
                                sequentialRed = row.background_color === 'red' ? sequentialRed + 1 : 0;
                            }
                            
                        });
                        if (sequentialRed > 0) {
                            _.forEach(this.props.user.escalations, escalation => {
                                if (Number(escalation.escalation_hours) <= sequentialRed) {
                                    actualEscalation = escalation;
                                }
                            });
                        }
                    }
                    const redCount = (_.filter(_.initial(value), { background_color: 'red' }) || []).length;
                    
                    return {
                        asset_id: actualHour.asset_id,
                        asset_code: key,
                        asset_name: actualHour.asset_name,
                        summary_target: actualHour.summary_target,
                        summary_adjusted_actual: actualHour.summary_adjusted_actual,
                        background_color: actualHour.background_color,
                        supervisor_signoff: actualHour.supervisor_signoff,
                        redCount: redCount,
                        children: value,
                        sequentialRed: sequentialRed,
                        actualEscalation: actualEscalation
                    };
                })
                .value();

        this.setState({ assetList, spinner_isLoading: false })
    }

    render() {
        return (
            <React.Fragment>
                <div className="wrapper-main">
                    <Row className='siteHeader'><h3>{this.props.t('Site') + ':' + this.props.user.site_name}</h3></Row>
                    {this.state.spinner_isLoading ?
                        <Spinner></Spinner>
                        :
                        <React.Fragment>
                            <InformationComponent
                                t={this.props.t}
                                user={this.props.user}
                                history={this.props.history}
                                selectedDate={this.state.selectedDate}
                                currentLanguage={this.state.currentLanguage}
                                selectedShift={this.state.selectedShift}
                                assetList={this.state.assetList}
                            />
                            <CupsContainer
                                t={this.props.t}
                                user={this.props.user}
                                history={this.props.history}
                                assetList={this.state.assetList}
                            />
                        </React.Fragment>
                    }
                </div>
            </React.Fragment>
        );
    }
};

export default DigitalCups;