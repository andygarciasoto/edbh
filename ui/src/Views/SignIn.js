import React from 'react';
import { Row } from 'react-bootstrap';
import BarcodeScanner from '../Components/SignIn/BarcodeScanner';
import { AUTH } from '../Utils/Constants';
import logo from '../resources/Parker_Hannifin.svg';
import FontAwesome from 'react-fontawesome';
import * as qs from 'query-string';
import i18next from 'i18next';
import '../sass/SignIn.scss';

class SignIn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            style: {},
            errMessage: 'Incorrect Clocknumber, please try again with a different Clocknumber.'
        }
        let search = qs.parse(props.history.location.search);

        if (search.ln) {
            let currentLanguage = search.ln.toLowerCase();
            currentLanguage = currentLanguage.replace('-', '_');
            i18next.changeLanguage(currentLanguage);
        }
    }

    componentDidMount() {
        this.setState({
            errMessage: this.props.search.err ? this.props.search.err : null
        })
    }

    authorize(code) {
        window.location.replace(`${AUTH}/badge?badge=${code}&st=${this.props.st}`);
    }

    render() {
        return (
            <Row bsPrefix="main">
                <Row bsPrefix="signIn">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h3 style={{ fontSize: '0.9em', paddingTop: '5px' }} className='drop-shadow'>{this.props.t('Parker Hannifin Day by Hour Application')}</h3>
                    <BarcodeScanner t={this.props.t} st={this.props.st} />
                </Row>
                {this.props.search.err ? <div className="app-info"><FontAwesome name="warning" /><span>{this.state.errMessage}</span></div> : 'null'}
            </Row>
        );
    }
};
export default SignIn;