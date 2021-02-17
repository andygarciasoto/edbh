import React from 'react';
import { Button } from 'react-bootstrap';
import $ from 'jquery';
import moment from 'moment';
import * as qs from 'query-string';

class QueryButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    onSubmit = async () => {
        let { search } = qs.parse(this.props.history.location.search);
        let queryItem = Object.assign({}, search);
        queryItem["mc"] = this.props.machine;
        queryItem["dt"] = moment(this.props.date).format('YYYY/MM/DD HH:mm');
        queryItem["sf"] = this.props.shift;
        queryItem["ln"] = this.props.language;
        queryItem["tp"] = this.props.machine_type;
        queryItem["cs"] = this.props.site;
        let parameters = $.param(queryItem);
        this.props.changeLanguageBrowser();
        await this.props.history.push(`${this.props.history.location.pathname}?${parameters}`);
        this.props.openMenu();
    }

    render() {
        return (
            <Button variant="outline-primary" className="query-button" onClick={this.onSubmit}>{this.props.t('Submit')}</Button>
        );
    }
};

export default QueryButton;