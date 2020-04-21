import React from 'react';
import BarcodeScanner from './Scanner/BarcodeScanner';
import logo from './Parker_Hannifin.svg';
import EYlogo from './ernst-young-vector-logo.png';
import Background from './eDBH_IndustryBackground.jpg';
import FontAwesome from 'react-fontawesome';
import './sass/SignIn.scss';
import * as qs from 'query-string';
import i18next from 'i18next';

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
            style: {
                backgroundImage: `linear-gradient( rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.8) ), url(${Background})`,
                height: '100vh',
                backgroundSize: '150%, 150%',
                errMessage: this.props.search.err ? this.props.search.err : null
            }
        })
    }

    render() {
        return (
            <div id="main" style={this.state.style}>
                <div id="signIn">
                    <img src={EYlogo} className="App-logo" alt="logo" />
                    <h3 style={{ fontSize: '0.9em', paddingTop: '5px' }} className='drop-shadow'>{this.props.t('Day by Hour Application')}</h3>
                    <BarcodeScanner t={this.props.t} st={this.props.st} />
                </div>
                {this.props.search.err ? <div className="app-info"><FontAwesome name="warning" /><span>{this.state.errMessage}</span></div> : 'null'}
            </div>
        );
    }
};
export default SignIn;