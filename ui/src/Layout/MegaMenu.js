import React from 'react';
import { Row, Col } from 'react-bootstrap';
import './MegaMenu.scss';
class MegaMenu extends React.Component {
    render() {
        const t = this.props.t;
        const children = React.Children.toArray(this.props.children);
        const titles = [t('Machine Selector'), t('Date Selector'), t('Shift Selector'), t('Language Selector'), t('Submit')]
        return (
            <div className={this.props.toggle + ' mega-menu-wrapper'}>
                <Row>
                    {children.map((item, key) => {
                        return (
                            <Col sm={3} md={3} key={key} className="mega-menu-children">
                                <p className="title_child">{titles[key]}</p>
                                {item}
                            </Col>
                        )
                    })}
                </Row>
            </div>
        );
    }
};

export default MegaMenu;