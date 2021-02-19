import React from 'react';
import CupsContainer from '../Components/DigitalCups/CupsContainer';
import FilterComponent from '../Components/DigitalCups/FilterComponent';
import { API } from '../Utils/Constants';
import { getResponseFromGeneric, getCurrentTime, formatDateWithTime } from '../Utils/Requests';
import _ from 'lodash';
import '../sass/DigitalCups.scss';

class DigitalCups extends React.Component {
    constructor(props) {
        super(props);
        this.state = Object.assign(this.getInitialState(props));
    }

    getInitialState(props) {
        return {
            levelSelection: {},
            assetSelection: {},
            assetList: []
        };
    };

    componentDidMount() {
        this.loadData({ value: 'Site' }, { asset_id: this.props.user.site });
    }

    async loadData(levelSelection, assetSelection) {
        const asset = {
            start_time: formatDateWithTime(_.find(this.props.user.shifts, { shift_id: this.props.user.shift_id }).start_date_time_today),
            end_time: getCurrentTime(this.props.user.timezone),
            asset_id: this.props.user.site,
            aggregation: levelSelection.value === 'Site' ? 2 : (levelSelection.value === 'Area' ? 1 : 0),
            production_day: this.props.user.date_of_shift
        };
        let assets_list = await getResponseFromGeneric('get', API, '/digital_cups', {}, asset, {}) || [];
        //console.log(_.groupBy(assets_list, 'asset_code'));
        assets_list = _.map(assets_list, asset => {
            asset.backgroundColor = asset.actual >= asset.target ? 'green' : 'red';
            return asset;
        });
        console.log(assets_list);
        console.log(_.groupBy(assets_list, 'asset_code'));
        console.log(
            _.chain(assets_list)
                .groupBy('asset_code')
                .map((value, key) => {
                    const actualHour = value[value.length - 1];
                    return {
                        asset_code: key,
                        children: value,
                        target: actualHour.target,
                        actual: actualHour.actual,
                        backgroundColor: actualHour.backgroundColor
                    };
                })
                .value());
    }

    loadCups = (levelSelection, assetSelection, assetList) => {
        this.setState({ levelSelection, assetSelection, assetList });
    }

    render() {
        const t = this.props.t;
        return (
            <React.Fragment>
                <div className="wrapper-main">
                    <FilterComponent
                        t={t}
                        user={this.props.user}
                        loadCups={this.loadCups}
                    />
                    <CupsContainer
                        t={t}
                        user={this.props.user}
                        levelSelection={this.state.levelSelection}
                        assetSelection={this.state.assetSelection}
                        assetList={this.state.assetList}
                    />
                </div>
            </React.Fragment>
        );
    }
};

export default DigitalCups;