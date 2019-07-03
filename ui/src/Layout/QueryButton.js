import React from 'react';
import { Button } from 'react-bootstrap';
import './QueryButton.scss';

class QueryButton extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
        } 
        this.onSubmit = this.onSubmit.bind(this);
    }  

    onSubmit() {
        const {machine, date, shift} = this.props;
        const values = [machine, date, shift];
        this.props.toParent(values);
    }

    render() {
        return (
            <Button variant="outline-primary" className="query-button" onClick={this.onSubmit}>Submit</Button>
        );
    }
};

export default QueryButton;