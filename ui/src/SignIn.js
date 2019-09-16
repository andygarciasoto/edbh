import React from 'react';
import BarcodeScanner from './Scanner/BarcodeScanner';
import logo from './Parker_Hannifin.svg';
import Background from './backdrop1.jpg';
import './sass/SignIn.scss';

class SignIn extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            style: {},
        } 
    }

    componentDidMount() {
        this.setState({style: {
            backgroundImage: `linear-gradient( rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.8) ), url(${Background})`,
            height: '100vh',
            backgroundSize: '150%, 150%',
        }})
    }  

    render() {
        return (
            <div id="main" style={this.state.style}>
                <div id="signIn">
                    <img src={logo} className="App-logo" alt="logo" />  
                    <h3 style={{fontSize: '0.9em', paddingTop: '5px'}} className='drop-shadow'>{this.props.t('Parker Hannifin Day by Hour Application')}</h3>
                    <BarcodeScanner t={this.props.t}/>
                </div>
                <div className="app-info"><p></p></div>
            </div>
        );
    }
};
export default SignIn;