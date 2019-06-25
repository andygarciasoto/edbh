import React from 'react';
import BarcodeScanner from './Scanner/BarcodeScanner';
import logo from './Parker_Hannifin.svg';

class SignIn extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
        } 
    }

    componentDidMount() {
        console.log(this.state);
    }
        

    render() {
        return (
            <div className="signIn">
                <img src={logo} className="App-logo" alt="logo" />  
                <p style={{fontSize: '0.6em'}}>Parker Hannifin Day by Hour Application</p>
                <BarcodeScanner/>
            </div>
        );
    }
};

export default SignIn;