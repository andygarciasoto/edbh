import React from 'react';
import { Button } from 'react-bootstrap';
import './QueryButton.scss';
import $ from 'jquery';
import moment from 'moment';
import * as qs from 'query-string';

class QueryButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            machine: props.machine,
            date: props.date,
            shift: props.shift,
            language: props.language,
            machine_type: props.machine_type,
            site: props.site
        }
    }
    componentDidMount() {
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            machine: nextProps.machine,
            date: nextProps.date,
            shift: nextProps.shift,
            language: nextProps.language,
            machine_type: nextProps.machine_type,
            site: nextProps.site
        })
    }

    onSubmit = async () => {
        //this.props.clearExpanded();
        let { search } = qs.parse(this.props.history.location.search);
        let queryItem = Object.assign({}, search);
        queryItem["mc"] = this.state.machine;
        queryItem["dt"] = moment(this.state.date).format('YYYY/MM/DD HH:mm');
        queryItem["sf"] = this.state.shift;
        queryItem["ln"] = this.state.language;
        queryItem["tp"] = this.state.machine_type;
        queryItem["cs"] = this.state.site;
        let parameters = $.param(queryItem);
        this.props.changeLanguageBrowser();
        await this.props.history.push(`${this.props.history.location.pathname}?${parameters}`);
        this.props.openMenu();
    }

    render() {
        return (
            <Button variant="outline-info" className="query-button" onClick={this.onSubmit}>{this.props.t('Submit')}</Button>
        );
    }
};

export default QueryButton;