import React from 'react';
import logo from '../resources/EY_Logo_White_Back.jpg';
import { Row, Form, Button } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import { AUTH } from '../Utils/Constants';
import '../sass/SignIn.scss';

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            style: {},
            errMessage: 'Incorrect Username or Password, please try again.'
        }
    }

    render() {
        return (
            <Row bsPrefix="main">
                <Row bsPrefix="signIn">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h3 style={{ fontSize: '0.9em', paddingTop: '5px' }} className='drop-shadow'>{this.props.t('Day by Hour Application')}</h3>
                    <Form action={AUTH} method="post">
                        <Form.Group controlId="formGroupEmail" style={{ textAlign: 'right' }}>
                            <Form.Label>Username: &nbsp;</Form.Label>
                            <Form.Control value={this.state.username} name={'username'} type="text" placeholder="Enter username" style={{ width: '400px', float: 'right' }} onChange={(e) => { this.setState({ username: e.target.value }) }} />
                        </Form.Group>
                        <Form.Group controlId="formGroupPassword">
                            <Form.Label>Password: &nbsp;</Form.Label>
                            <Form.Control value={this.state.password} name={'password'} type="password" placeholder="Password" style={{ width: '400px', float: 'right' }} onChange={(e) => { this.setState({ password: e.target.value }) }} />
                        </Form.Group>
                        <Form.Control value={this.props.st} name={'st'} type="hidden" />
                        <Button type="submit" variant="outline-info" style={{ marginTop: '10px' }}>{'Submit'}</Button>
                    </Form>
                </Row>
                {this.props.search.err ? <div className="app-info"><FontAwesome name="warning" /><span>{this.state.errMessage}</span></div> : 'null'}
            </Row>
        );
    }
};

export default Login;