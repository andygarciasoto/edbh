import React from 'react';
import './Header.scss';
import './MegaMenu.scss'
class MegaMenu extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
        } 
    }  

    render() {
        return (
          <div className={this.props.toggle}>
            <p>Selectors:</p>
            {this.props.children}
        </div>
        );
    }
};

export default MegaMenu;