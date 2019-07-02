import React from 'react';
import { Row, Col } from 'react-bootstrap';
import './MegaMenu.scss'
class MegaMenu extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
        } 
    }  


    render() {
        const children = React.Children.toArray(this.props.children);
        const titles = ['Machine Selector', 'Date Selector', 'Shift Selector', 'Submit']
        return (
          <div className={this.props.toggle + ' mega-menu-wrapper'}>
            <Row>
                
                {children.map((item, key) => {
                    return (
                        <Col sm={3} md={3} key={key} className="mega-menu-children">
                            <p>{titles[key]}</p>
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