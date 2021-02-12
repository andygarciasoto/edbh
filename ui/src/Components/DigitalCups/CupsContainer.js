import React from 'react';
import * as _ from 'lodash';
import { Row, Col } from 'react-bootstrap';

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
        let asset_list = _.filter(this.state.assetList, asset => { return asset.asset_level !== 'Site' && asset.asset_level !== 'Area' });
        if (this.state.levelSelection.value === 'Area') {
            asset_list = _.filter(asset_list, asset => { return asset.parent_asset_code === this.state.assetSelection.asset_code });
        } else if (this.state.levelSelection.value !== 'Site' && this.state.levelSelection.value !== 'Area') {
            asset_list = _.filter(asset_list, asset => { return asset[this.state.levelSelection.value] === this.state.assetSelection.value });
        }

        // _.forEach(asset_list, asset => {
        //     asset.target = Math.floor(Math.random() * 55) + 1;
        //     asset.actual = Math.floor(Math.random() * 55) + 1;
        //     asset.backgroundColor = asset.actual >= asset.target ? 'green' : 'red';
        //     asset.previousHours = new Array(5);
        //     asset.redCount = 0;
        //     _.forEach(asset.previousHours, (value, index) => {
        //         asset.previousHours[index] = (Math.floor(Math.random() * 2) + 1) === 1 ? 'green' : 'red';
        //         asset.redCount += (asset.previousHours[index] === 'red') ? 1 : 0;
        //     });
        //     asset.escalation = asset.previousHours[4] === 'red' && asset.previousHours[3] === 'red' && asset.previousHours[2] === 'red';
        // });

        const groupData = _.orderBy(asset_list, ['escalation', 'backgroundColor', 'redCount', 'asset_name'], ['desc', 'desc', 'desc']);
        this.setState({ groupData });
    }

    getCups(groupData) {
        return _.map(groupData, asset => {
            return (
                <Col md={2} lg={2} className={'childrenCupDiv ' + (asset.escalation ? 'escalateBlink' : '')} key={'child_' + asset.asset_id}>
                    <Row className='previousHours'>
                        {_.map(asset.previousHours, value => {
                            return (<Col className={value}></Col>)
                        })}
                    </Row>
                    <Row className={'assetName ' + asset.backgroundColor}>{'Asset: ' + asset.asset_name}</Row>
                    <Row className='currentInformation'>{asset.actual + ' / ' + asset.target}</Row>
                </Col>
            );
        });
    }

    render() {
        const t = this.props.t;
        return (
            <React.Fragment>
                <Row className='siteHeader'><h3>{t('Site') + ':' + this.props.user.site_name}</h3></Row>
                {_.isEmpty(this.state.groupData) ?
                    <h3>Empty assets</h3> :
                    <Row className='cupInformationDiv'>
                        {this.getCups(this.state.groupData)}
                    </Row>
                }
            </React.Fragment>
        );
    }
};

export default CupsContainer;