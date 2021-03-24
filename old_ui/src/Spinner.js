import React from 'react';
import './sass/Spinner.scss';
import FontAwesome from  'react-fontawesome';

class Spinner extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        return (
        <div className="spinner">
            <div className="rect1"><FontAwesome className={'fontAwesome'} name="circle"/></div>
            <div className="rect2"><FontAwesome className={'fontAwesome'} name="circle"/></div>
            <div className="rect3"><FontAwesome className={'fontAwesome'} name="circle"/></div>
            <div className="rect4"><FontAwesome className={'fontAwesome'} name="circle"/></div>
        </div>);
        }
};

export default Spinner;
