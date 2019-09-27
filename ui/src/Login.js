import React from 'react';
import logo from './Parker_Hannifin.svg';
import Background from './backdrop1.jpg';
import './sass/SignIn.scss';
import { Form, Button } from 'react-bootstrap';
import { AUTH } from './Utils/Constants';
import queryString from 'query-string'
import { getRequest } from  './Utils/Requests';

class Login extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            username: '',
            password: '',
            style: {},
        } 
    }

    componentDidMount() {
        this.setState({style: {
            backgroundImage: `linear-gradient( rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.8) ), url(${Background})`,
            height: '100vh',
            backgroundSize: '150%, 150%',
        }});
    }  

    render() {
        return (
            <div id="main" style={this.state.style}>
                <div id="signIn">
                    <img src={logo} className="App-logo" alt="logo" />  
                    <h3 style={{fontSize: '0.9em', paddingTop: '5px'}} className='drop-shadow'>{this.props.t('Parker Hannifin Day by Hour Application')}</h3>
                    <Form action={AUTH} method="post">
                    <Form.Group controlId="formGroupEmail" style={{textAlign: 'right'}}>
                        <Form.Label>Username: &nbsp;</Form.Label>
                        <Form.Control value={this.state.username} name={'username'} type="text" placeholder="Enter username" style={{width: '400px', float: 'right'}} onChange={(e) => 
                            {this.setState({username: e.target.value})}}/>
                    </Form.Group>
                    <Form.Group controlId="formGroupPassword">
                        <Form.Label>Password: &nbsp;</Form.Label>
                        <Form.Control value={this.state.password} name={'password'} type="password" placeholder="Password" style={{width: '400px', float: 'right'}} onChange={(e) => 
                            {this.setState({password: e.target.value})}}/>
                    </Form.Group>
                    <Button type="submit" variant="outline-primary" style={{marginTop: '10px'}}>{'Submit'}</Button>
                    </Form>
                </div>
            </div>
        );
    }
};

export default Login;