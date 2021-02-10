import React from 'react';
import * as _ from 'lodash';
import { Row, Col } from 'react-bootstrap';
import '../../sass/CupInformation.scss';

class CupInformation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    getChildren(childrenAssets) {
        return _.map(childrenAssets, children => {
            const target = Math.floor(Math.random() * 55) + 1;
            const actual = Math.floor(Math.random() * target) + 1;
            return (
                <Col md={2} lg={2} className='childrenCupDiv'>
                    <Row className='previousHours'>
                        <Col className={(Math.floor(Math.random() * 2) + 1) === 1 ? 'green' : 'red'}></Col>
                        <Col className={(Math.floor(Math.random() * 2) + 1) === 1 ? 'green' : 'red'}></Col>
                        <Col className={(Math.floor(Math.random() * 2) + 1) === 1 ? 'green' : 'red'}></Col>
                        <Col className={(Math.floor(Math.random() * 2) + 1) === 1 ? 'green' : 'red'}></Col>
                        <Col className={(Math.floor(Math.random() * 2) + 1) === 1 ? 'green' : 'red'}></Col>
                    </Row>
                    <Row className={'assetName ' + (actual >= target ? 'green' : 'red')}>{'Asset: ' + children.asset_code + ' - ' + children.asset_name}</Row>
                    <Row className='currentInformation'>{actual + ' / ' + target}</Row>
                </Col>
            );
        });
    }

    render() {
        const t = this.props.t;
        return (
            <React.Fragment>
                <Row className='cupInformationDiv'>
                    <Col md={12} lg={12}>
                        <h5>{t('Area') + ':' + this.props.assetInformation.asset_name}</h5>
                    </Col>
                    {this.getChildren(this.props.assetInformation.children)}
                </Row>
            </React.Fragment>
        );
    }
};

export default CupInformation;