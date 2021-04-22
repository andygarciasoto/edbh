import React, { Component } from 'react';
import { API } from '../../../Utils/Constants';
import { getResponseFromGeneric } from '../../../Utils/Requests';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { validateEscalationCreateForm } from '../../../Utils/FormValidations';
import _ from 'lodash';
import '../../../sass/SystemAdmin.scss';

class EscalationCreateModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            EscalationData: props.EscalationData,
            name_es_1: 'Site Manager',
            group: '',
            level_es_1: 1,
            hours_es_1: 2,
            status_es_1: 'Active',
            name_es_2: 'Value Stream Manager',
            level_es_2: 2,
            hours_es_2: 3,
            status_es_2: 'Active',
            name_es_3: 'Plant Manager',
            level_es_3: 3,
            hours_es_3: 4,
            status_es_3: 'Active',
            show: false,
            modalError: false,
            validation: {}
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const groupingData = _.chain(nextProps.EscalationData)
            .groupBy('escalation_group')
            .map((value, key) => {
                return {
                    groupName: key,
                    children: value
                };
            })
            .value();
        const new_group = 'Group ' + (groupingData.length + 1);
        if (nextProps.isOpen && new_group !== prevState.group) {
            return {
                group: new_group,
                name_es_1: 'Site Manager',
                level_es_1: 1,
                hours_es_1: 2,
                status_es_1: 'Active',
                name_es_2: 'Value Stream Manager',
                level_es_2: 2,
                hours_es_2: 3,
                status_es_2: 'Active',
                name_es_3: 'Plant Manager',
                level_es_3: 3,
                hours_es_3: 4,
                status_es_3: 'Active',
                validation: {}
            };
        }
        if (!nextProps.isOpen) {
            return {
                validation: {},
                group: ''
            }
        }
        return null;
    }

    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value,
        });
    };

    createEscalation = async (e) => {
        e.preventDefault();
        const { group } = this.state;
        const validation = validateEscalationCreateForm(this.state);

        if (_.isEmpty(validation)) {

            let arrayData = [];
            for (let i = 0; i < 3; i++) {
                arrayData.push({
                    escalation_name: this.state['name_es_' + (i + 1)],
                    escalation_group: group,
                    escalation_level: this.state['level_es_' + (i + 1)],
                    escalation_hours: this.state['hours_es_' + (i + 1)],
                    status: this.state['status_es_' + (i + 1)]
                });
            }
            const data = {
                site_id: this.props.user.site,
                table: 'Escalation',
                data: arrayData
            };

            let res = await getResponseFromGeneric('put', API, '/dragndrop', {}, {}, data);
            if (res.status !== 200) {
                this.setState({
                    modalError: true,
                    validation: {}
                });
            } else {
                this.props.Refresh();
                this.props.handleClose();
                this.setState({
                    show: true,
                    validation: {}
                });
            }
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
                <Modal show={this.props.isOpen} onHide={this.props.handleClose} centered className='general-modal'>
                    <Modal.Header closeButton>
                        <Modal.Title>{t('Create New Escalation Group')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group as={Row}>
                                <Form.Label column sm={12}>{t('Escalation 1')}:</Form.Label>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm={1}>{t('Name')}:</Form.Label>
                                <Col sm={3}>
                                    <Form.Control
                                        type="text"
                                        name="name_es_1"
                                        value={this.state.name_es_1}
                                        autoComplete={"false"}
                                        onChange={this.handleChange}
                                    />
                                    <Form.Text className='validation'>{validation.name_es_1}</Form.Text>
                                </Col>
                                <Form.Label column sm={1}>{t('Group')}:</Form.Label>
                                <Col sm={2}>
                                    <Form.Control
                                        type="text"
                                        name="group"
                                        value={this.state.group}
                                        autoComplete={"false"}
                                        onChange={this.handleChange}
                                        disabled={true}
                                    />
                                </Col>
                                <Form.Label column sm={1}>{t('Level')}:</Form.Label>
                                <Col sm={2}>
                                    <Form.Control
                                        as="select"
                                        value={this.state.level_es_1}
                                        name='level_es_1'
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
                                <Form.Label column sm={1}>{t('Hours')}:</Form.Label>
                                <Col sm={2}>
                                    <Form.Control
                                        type="number"
                                        name="hours_es_1"
                                        value={this.state.hours_es_1}
                                        autoComplete={"false"}
                                        min={1}
                                        onChange={this.handleChange}
                                    />
                                    <Form.Text className='validation'>{validation.hours_es_1}</Form.Text>
                                </Col>
                                <Form.Label column sm={1}>{t('Status')}:</Form.Label>
                                <Col sm={2}>
                                    <Form.Control
                                        as="select"
                                        value={this.state.status_es_1}
                                        name='status_es_1'
                                        autoComplete={"false"}
                                        onChange={this.handleChange}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </Form.Control>
                                </Col>
                            </Form.Group>
                            <hr />
                            <Form.Group as={Row}>
                                <Form.Label column sm={12}>{t('Escalation 2')}:</Form.Label>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm={1}>{t('Name')}:</Form.Label>
                                <Col sm={3}>
                                    <Form.Control
                                        type="text"
                                        name="name_es_2"
                                        value={this.state.name_es_2}
                                        autoComplete={"false"}
                                        onChange={this.handleChange}
                                    />
                                    <Form.Text className='validation'>{validation.name_es_2}</Form.Text>
                                </Col>
                                <Form.Label column sm={1}>{t('Group')}:</Form.Label>
                                <Col sm={2}>
                                    <Form.Control
                                        type="text"
                                        name="group"
                                        value={this.state.group}
                                        autoComplete={"false"}
                                        onChange={this.handleChange}
                                        disabled={true}
                                    />
                                </Col>
                                <Form.Label column sm={1}>{t('Level')}:</Form.Label>
                                <Col sm={2}>
                                    <Form.Control
                                        as="select"
                                        value={this.state.level_es_2}
                                        name='level_es_2'
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
                                <Form.Label column sm={1}>{t('Hours')}:</Form.Label>
                                <Col sm={2}>
                                    <Form.Control
                                        type="number"
                                        name="hours_es_2"
                                        value={this.state.hours_es_2}
                                        autoComplete={"false"}
                                        min={1}
                                        onChange={this.handleChange}
                                    />
                                    <Form.Text className='validation'>{validation.hours_es_2}</Form.Text>
                                </Col>
                                <Form.Label column sm={1}>{t('Status')}:</Form.Label>
                                <Col sm={2}>
                                    <Form.Control
                                        as="select"
                                        value={this.state.status_es_2}
                                        name='status_es_2'
                                        autoComplete={"false"}
                                        onChange={this.handleChange}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </Form.Control>
                                </Col>
                            </Form.Group>
                            <hr />
                            <Form.Group as={Row}>
                                <Form.Label column sm={12}>{t('Escalation 3')}:</Form.Label>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm={1}>{t('Name')}:</Form.Label>
                                <Col sm={3}>
                                    <Form.Control
                                        type="text"
                                        name="name_es_3"
                                        value={this.state.name_es_3}
                                        autoComplete={"false"}
                                        onChange={this.handleChange}
                                    />
                                    <Form.Text className='validation'>{validation.name_es_3}</Form.Text>
                                </Col>
                                <Form.Label column sm={1}>{t('Group')}:</Form.Label>
                                <Col sm={2}>
                                    <Form.Control
                                        type="text"
                                        name="group"
                                        value={this.state.group}
                                        autoComplete={"false"}
                                        onChange={this.handleChange}
                                        disabled={true}
                                    />
                                </Col>
                                <Form.Label column sm={1}>{t('Level')}:</Form.Label>
                                <Col sm={2}>
                                    <Form.Control
                                        as="select"
                                        value={this.state.level_es_3}
                                        name='level_es_3'
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
                                <Form.Label column sm={1}>{t('Hours')}:</Form.Label>
                                <Col sm={2}>
                                    <Form.Control
                                        type="number"
                                        name="hours_es_3"
                                        value={this.state.hours_es_3}
                                        autoComplete={"false"}
                                        min={1}
                                        onChange={this.handleChange}
                                    />
                                    <Form.Text className='validation'>{validation.hours_es_3}</Form.Text>
                                </Col>
                                <Form.Label column sm={1}>{t('Status')}:</Form.Label>
                                <Col sm={2}>
                                    <Form.Control
                                        as="select"
                                        value={this.state.status_es_3}
                                        name='status_es_3'
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
                        <Modal.Title>Success</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Escalation has been created</Modal.Body>
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
                        Escalation has not been created
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
