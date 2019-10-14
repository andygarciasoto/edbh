import React from 'react';
import { Button } from 'react-bootstrap';
import './QueryButton.scss';
import $ from 'jquery';
import moment from 'moment';


class QueryButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            machine: props.machine,
            date: props.date,
            shift: props.shift,
            language: props.language,
            machine_type: props.machine_type
        }
        this.onSubmit = this.onSubmit.bind(this);
    }
    componentDidMount() {
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            machine: nextProps.machine,
            date: nextProps.date,
            shift: nextProps.shift,
            language: nextProps.language,
            machine_type: nextProps.machine_type
        })
    }

    async onSubmit() {
        this.props.clearExpanded();
        let { search } = this.props;
        let queryItem = Object.assign({}, search);
        queryItem["mc"] = this.state.machine;
        queryItem["dt"] = moment(this.state.date).format('YYYY/MM/DD HH:mm');
        queryItem["sf"] = this.state.shift;
        queryItem["ln"] = this.state.language;
        queryItem["tp"] = this.state.machine_type;
        let parameters = $.param(queryItem);
        await this.props.history.push(`${this.props.history.location.pathname}?${parameters}`);
        this.props.openMenu();
        this.props.changeLanguageBrowser();
    }

    render() {
        return (
            <Button variant="outline-primary" className="query-button" onClick={this.onSubmit}>{this.props.t('Submit')}</Button>
        );
    }
};

export default QueryButton;