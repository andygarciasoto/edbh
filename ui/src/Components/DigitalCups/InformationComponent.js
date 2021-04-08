import React from 'react';
import { Row, Col } from 'react-bootstrap';
import _ from 'lodash';
import moment from 'moment';
import('moment/locale/es');
import('moment/locale/it');
import('moment/locale/de');
import('moment/locale/ko');

class InformationComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    getValues(assetList) {
        let values = { scheduleAttainment: 0, totalActual: 0, totalTarget: 0, totalIdeal: 0 };
        _.forEach(assetList, asset => {
            _.forEach(asset.children, childAsset => {
                values.totalActual += childAsset.summary_adjusted_actual;
                values.totalTarget += childAsset.summary_target;
                values.totalIdeal += childAsset.summary_ideal;
            });
        });
        const scheduleAttainment = Number(values.totalActual * 100 / values.totalTarget).toFixed(1);
        values.scheduleAttainment = scheduleAttainment === 'NaN' ? 0 : scheduleAttainment

        return values;
    }

    render() {
        const { scheduleAttainment, totalActual, totalTarget, totalIdeal } = this.getValues(this.props.assetList);
        const t = this.props.t;
        return (
            <React.Fragment>
                <Row>
                    <Col lg={2} md={2}><h5>{t('Schedule Attainment') + ': ' + scheduleAttainment + '%'}</h5></Col>
                    <Col lg={3} md={3}><h5>{t('Actual') + ' - ' + t('Target') + '/' + t('Ideal') + ': ' + totalActual + ' - ' + totalTarget + '/' + totalIdeal}</h5></Col>
                    <Col lg={2} md={2}><h5>{t('Selected Shift') + ': ' + this.props.selectedShift}</h5></Col>
                    <Col lg={3} md={3}><h5>{t('Showing Data for') + ': ' + moment(this.props.selectedDate).locale(this.props.currentLanguage).format('LL')}</h5></Col>
                </Row>
            </React.Fragment>
        );
    }
};

export default InformationComponent;