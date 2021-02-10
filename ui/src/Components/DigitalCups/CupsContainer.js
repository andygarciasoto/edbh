import React from 'react';
import * as _ from 'lodash';
import { Row } from 'react-bootstrap';
import CupInformation from './CupInformation';

class CupsContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = Object.assign(this.getInitialState(props));
    }

    getInitialState(props) {
        return {
            levelSelection: props.levelSelection,
            assetSelection: props.assetSelection,
            assetList: props.assetList,
            groupData: []
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (!_.isEqual(nextProps.levelSelection, prevState.levelSelection) || !_.isEqual(nextProps.assetSelection, prevState.assetSelection) ||
            !_.isEqual(nextProps.assetList, prevState.assetList)) {
            return {
                levelSelection: nextProps.levelSelection,
                assetSelection: nextProps.assetSelection,
                assetList: nextProps.assetList
            }
        } else return null
    }

    componentDidUpdate(prevProps, prevState) {
        if (!_.isEqual(this.state.levelSelection, prevState.levelSelection) || !_.isEqual(this.state.assetSelection, prevState.assetSelection) ||
            !_.isEqual(this.state.assetList, prevState.assetList)) {
            this.fetchData();
        }
    }

    fetchData() {
        let asset_list = _.filter(this.state.assetList, asset => { return asset.asset_level !== 'Site' });
        if (this.state.levelSelection.value === 'Area') {
            asset_list = _.filter(asset_list, asset => { return asset.asset_code === this.state.assetSelection.asset_code || asset.parent_asset_code === this.state.assetSelection.asset_code });
        } else if (this.state.levelSelection.value === 'Cell') {
            asset_list = _.filter(asset_list, asset => { return asset.asset_code === this.state.assetSelection.asset_code || asset.asset_code === this.state.assetSelection.parent_asset_code });
        }

        let groupData = _.filter(asset_list, (asset) => {
            return asset.asset_level !== 'Site' && asset.asset_level !== 'Cell'
        });
        _.forEach(groupData, asset => {
            asset.children = _.filter(asset_list, { parent_asset_code: asset.asset_code });
        });
        this.setState({ groupData });
    }

    getCups(groupData) {
        return _.map(groupData, assetInformation => {
            return (
                <CupInformation
                    assetInformation={assetInformation}
                    t={this.props.t}
                    user={this.props.user}
                />
            );
        });
    }

    render() {
        const t = this.props.t;
        return (
            <React.Fragment>
                <Row><h3>{t('Site') + ':' + this.props.user.site_name}</h3></Row>
                {_.isEmpty(this.state.groupData) ?
                    <h3>Empty assets</h3> :
                    this.getCups(this.state.groupData)
                }
            </React.Fragment>
        );
    }
};

export default CupsContainer;