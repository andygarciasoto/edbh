import React, { Component } from 'react';
import { API } from '../../../Utils/Constants';
import { genericRequest } from '../../../Utils/Requests';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { generalValidationForm } from '../../../Utils/FormValidations';
import _ from 'lodash';
import '../../../sass/SystemAdmin.scss';

class EscalationCreateModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            escalation: props.escalation,
            escalation_id: 0,
            name: '',
            group: '',
            level: 1,
            hours: 1,
            status: 'Active',
            show: false,
            modalError: false,
            validation: {}
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (!_.isEqual(nextProps.escalation, prevState.escalation)) {
            const name = nextProps.action === 'Edit' ? nextProps.escalation.escalation_name : '';
            const escalation_id = nextProps.action === 'Edit' ? nextProps.escalation.escalation_id : 0;
            return {
                escalation: nextProps.escalation,
                escalation_id: escalation_id,
                name: name,
                group: nextProps.escalation.escalation_group || '',
                level: nextProps.escalation.escalation_level || 1,
                hours: nextProps.escalation.escalation_hours || 1,
                status: nextProps.escalation.status || 'Active',
                validation: {}
            };
        }
        return null;
    }

    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value,
        });
    };

    createEscalation = (e) => {
        e.preventDefault();
        const { escalation_id, name, group, level, hours, status } = this.state;

        const validation = generalValidationForm(this.state);

        if (_.isEmpty(validation)) {
            genericRequest('put', API, '/insert_escalation', null, null, {
                escalation_id: escalation_id,
                escalation_name: name,
                escalation_group: group,
                escalation_level: level,
                escalation_hours: hours,
                status: status,
                site_id: this.props.user.site,
            }).then(
                () => {
                    this.props.Refresh();
                    this.props.handleClose();
                    this.setState({
                        show: true,
                        validation: {}
                    });
                },
                (error) => {
                    this.setState({
                        modalError: true
                    });
                }
            );
        } else {
            this.setState({
                validation
            });
        }
    };

    closeModalMessage = () => {
        this.setState({ modalError: false, show: false });
    };

    render() {
        const t = this.props.t;
        const validation = this.state.validation;
        return (
            <div>
                <Modal show={this.props.isOpen} onHide={this.props.handleClose} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{t(this.props.action + ' escalation')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>{t('Name')}:</Form.Label>
                                <Col sm={10}>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={this.state.name}
                                        autoComplete={"false"}
                                        onChange={this.handleChange}
                                    />
                                    <Form.Text className='validation'>{validation.name}</Form.Text>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>{t('Group')}:</Form.Label>
                                <Col sm={10}>
                                    <Form.Control
                                        type="text"
                                        name="group"
                                        value={this.state.group}
                                        autoComplete={"false"}
                                        onChange={this.handleChange}
                                        disabled={true}
                                    />
                                    <Form.Text className='validation'>{validation.group}</Form.Text>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>{t('Level')}:</Form.Label>
                                <Col sm={4}>
                                    <Form.Control
                                        as="select"
                                        value={this.state.level}
                                        name='level'
                                        autoComplete={"false"}
                                        onChange={this.handleChange}
                                        disabled={true}
                                    >
                                        <option value={1}>1</option>
                                        <option value={2}>2</option>
                                        <option value={3}>3</option>
                                    </Form.Control>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>{t('Hours')}:</Form.Label>
                                <Col sm={4}>
                                    <Form.Control
                                        type="number"
                                        name="hours"
                                        value={this.state.hours}
                                        autoComplete={"false"}
                                        min={1}
                                        onChange={this.handleChange}
                                    />
                                    <Form.Text className='validation'>{validation.hours}</Form.Text>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>{t('Status')}:</Form.Label>
                                <Col sm={4}>
                                    <Form.Control
                                        as="select"
                                        value={this.state.status}
                                        name='status'
                                        autoComplete={"false"}
                                        onChange={this.handleChange}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </Form.Control>
                                </Col>
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="Primary" onClick={(e) => this.createEscalation(e)}>
                            {t('Confirm')}
                        </Button>
                        <Button variant="secondary" onClick={this.props.handleClose}>
                            {t('Close')}
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Modal show={this.state.show} onHide={this.closeModalMessage}>
                    <Modal.Header closeButton>
                        <Modal.Title>Sucess</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Escalation has been updated</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.closeModalMessage}>
                            Close
						</Button>
                    </Modal.Footer>
                </Modal>
                <Modal show={this.state.modalError} onHide={this.closeModalMessage}>
                    <Modal.Header closeButton>
                        <Modal.Title>Error</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Escalation has not been updated
					</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.closeModalMessage}>
                            Close
						</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

export default EscalationCreateModal;
