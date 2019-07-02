import React from 'react';
import { Button } from 'react-bootstrap';
import './QueryButton.scss';

class QueryButton extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
        } 
        this.submit = this.submit.bind(this);
    }  

    submit() {
        console.log(this.props)
    }

    render() {
        return (
            <Button variant="outline-primary" className="query-button" onClick={this.submit()}>Submit</Button>
        );
    }
};

export default QueryButton;