import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as WorkcellActions from '../../../redux/actions/workcellActions';
import { API } from '../../../Utils/Constants';
import { genericRequest } from '../../../Utils/Requests';
import { Modal, Button, Form, Col, Row } from 'react-bootstrap';
import { generalValidationForm } from '../../../Utils/FormValidations';
import _ from 'lodash';
import '../../../sass/SystemAdmin.scss';

class WorkcellModal extends Component {
	constructor(props) {
		super(props);
		this.state = {
			workcell: props.workcell,
			name: '',
			description: '',
			status: 'Active',
			show: false,
			showForm: true,
			modalError: false,
			validation: {}
		};
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (!_.isEqual(nextProps.workcell, prevState.workcell)) {
			const name = nextProps.action === 'Edit' ? nextProps.workcell.workcell_name : '';
			const workcell_id = nextProps.action === 'Edit' ? nextProps.workcell.workcell_id : 0;
			return {
				workcell: nextProps.workcell,
				workcell_id: workcell_id,
				name: name,
				description: nextProps.workcell.workcell_description || '',
				status: nextProps.workcell.status || 'Active',
				validation: {}
			};
		}
		return null;
	}

	handleChange = (event) => {
		const target = event.target;
		const value = target.value;
		const name = target.name;

		this.setState({
			[name]: value,
		});
	};

	createWorkcell = (e) => {
		e.preventDefault();
		const { workcell_id, name, description, status } = this.state;

		const validation = generalValidationForm(this.state);

		if (_.isEmpty(validation)) {
			genericRequest('put', API, '/insert_workcell', null, null, {
				workcell_id: workcell_id,
				workcell_name: name,
				workcell_description: description,
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
						<Modal.Title>{t(this.props.action + ' Workcell')}</Modal.Title>
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
								<Form.Label column sm={2}>{t('Description')}:</Form.Label>
								<Col sm={10}>
									<Form.Control
										as="textarea"
										name="description"
										value={this.state.description}
										onChange={this.handleChange}
										rows={3} />
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
						<Button variant="Primary" onClick={(e) => this.createWorkcell(e)}>
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
					<Modal.Body>Workcell has been Copied</Modal.Body>
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
					<Modal.Body>Workcell has not been copied</Modal.Body>
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

export const mapDispatch = (dispatch) => {
	return {
		actions: bindActionCreators(WorkcellActions, dispatch),
	};
};

export default connect(null, mapDispatch)(WorkcellModal);
