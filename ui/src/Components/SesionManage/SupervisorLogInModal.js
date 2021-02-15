import React from 'react';
import { Modal, Row, Col, Button } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import { AUTH, API } from '../../Utils/Constants';
import { genericRequest, getCurrentTime, getResponseFromGeneric } from '../../Utils/Requests';
import * as _ from 'lodash';
import '../../sass/SupervisorLogInModal.scss';
const ACCESS_TOKEN_STORAGE_KEY = 'accessToken';


class SupervisorLogInModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.isOpen !== prevState.isOpen) {
            return {
                isOpen: nextProps.isOpen
            };
        }
        return null;
    }

    continueAs = async (role) => {

        if (role === 'Operator') {
            const data = {
                badge: this.props.user.badge,
                first_name: this.props.user.first_name,
                last_name: this.props.user.last_name,
                asset_id: this.props.selectedAssetOption.asset_id,
                timestamp: getCurrentTime(this.props.user.timezone),
                reason: 'Check-In',
                status: 'Active',
                site_id: this.props.user.site,
                break_minutes: 0,
                lunch_minutes: 0
            };
            await getResponseFromGeneric('put', API, '/new_scan', {}, {}, data);
        }


        const parameters = {
            newRole: role,
            token: localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY),
            role_name: role
        };

        let res = await genericRequest('get', AUTH, '/assignRoleToken', { Authorization: 'Bearer ' + localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) }, parameters) || {};
        if (res.status !== 200) {
            console.log('error when try to change the token', res);
        } else {
            const permissions = await getResponseFromGeneric('get', API, '/get_components_by_role', {}, parameters, {}) || [];
            if (_.isEmpty(permissions)) {
                console.log('error when try to get the role information', permissions);
            } else {
                let newUser = this.props.user;
                newUser.role = role;
                newUser.assing_role = role;
                newUser.permissions = permissions;
                localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, res.data);
                
                this.props.onRequestClose(newUser);
            }
        }
    }

    render() {
        const t = this.props.t;
        return (
            <React.Fragment>
                <Modal
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    show={this.state.isOpen} onHide={() => this.continueAs('Supervisor')}
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter" className='SupervisorTitle'>
                            <FontAwesome className="icon" name="question" />
                            {t('Attention')}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row>
                            <Col md={12} lg={12}><span className='supervisorMessage'>{t('Please select which role you will perform at this station today') + ':'}</span></Col>
                            <Col md={12} lg={12} className="d-flex justify-content-center roleButtons">
                                <Button onClick={() => this.continueAs('Operator')} className='btnYellow'>{t('Continue As Operator')}</Button>
                                <Button onClick={() => this.continueAs('Supervisor')} className='btnGreen'>{t('Continue As Supervisor')}</Button>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => this.continueAs('Supervisor')} variant='outline-danger'>{t('Cancel')}</Button>
                    </Modal.Footer>
                </Modal>
            </React.Fragment>
        )
    }
}

export default SupervisorLogInModal;