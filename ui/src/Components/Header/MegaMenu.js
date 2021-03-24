import React from 'react';
import { Row, Col } from 'react-bootstrap';
import * as _ from 'lodash';

class MegaMenu extends React.Component {

    getFilterOptions(children) {
        const t = this.props.t;
        const titles = [
            t('Visualization Level'),
            t('Machine Selector'),
            t('Date Selector'),
            t('Shift Selector'),
            t('Language Selector'),
            t('Select ' + this.props.selectedLevelDC.label)
        ];

        let filters = [];
        _.forEach(children, (item, key) => {
            let titleIndex = item.key ? item.key.replace('.$', '') : '';
            filters.push(
                <Col sm={3} md={3} key={key} className="mega-menu-children">
                    <p className="title_child">{titles[titleIndex] || ''}</p>
                    {item}
                </Col>
            );
        });

        return filters;
    }

    render() {
        const children = React.Children.toArray(this.props.children);
        return (
            <div className={this.props.toggle + ' mega-menu-wrapper'}>
                <Row>
                    {this.getFilterOptions(children)}
                </Row>
            </div>
        );
    }
};

export default MegaMenu;