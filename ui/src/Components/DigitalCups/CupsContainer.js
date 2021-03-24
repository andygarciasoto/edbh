import React from 'react';
import { Row, Col } from 'react-bootstrap';
import _ from 'lodash';
import $ from 'jquery';
import * as qs from 'query-string';

class CupsContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    redirectToDashboard = async (selectedAsset) => {
        let search = qs.parse(this.props.history.location.search);
        search.mc = selectedAsset.asset_code;
        let parameters = $.param(search);
        await this.props.history.push(`dashboard?${parameters}`);
    }

    getCups(assetList) {
        const sortData = _.orderBy(assetList, ['escalation', 'background_color', 'redCount', 'asset_name'], ['desc', 'desc', 'desc']);
        return _.map(sortData, asset => {
            const children = _.initial(asset.children);
            return (
                <Col
                    md={2} lg={2}
                    className={'childrenCupDiv ' + (asset.escalation ? 'escalateBlink' : '')}
                    key={'child_' + asset.asset_id}
                    onClick={() => this.redirectToDashboard(asset)}>
                    <Row className='previousHours'>
                        {_.map(children, value => {
                            return (<Col key={'previous_hours_' + value.hour_interval + '_' + value.asset_id} className={value.background_color}></Col>)
                        })}
                    </Row>
                    <Row className={'assetName ' + asset.background_color}>{this.props.t('Machine/Cell') + ': ' + asset.asset_name}</Row>
                    <Row className='currentInformation'>{asset.summary_adjusted_actual + ' / ' + (asset.summary_target || 0)}</Row>
                </Col>
            );
        });
    }

    render() {
        return (
            <React.Fragment>
                {_.isEmpty(this.props.assetList) ?
                    <h3>Empty assets</h3> :
                    <Row className='cupInformationDiv'>
                        {this.getCups(this.props.assetList)}
                    </Row>
                }
            </React.Fragment>
        );
    }
};

export default CupsContainer;