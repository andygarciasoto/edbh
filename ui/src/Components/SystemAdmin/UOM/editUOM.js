import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UOMActions from '../../../redux/actions/uomActions';
import { API } from '../../../Utils/Constants';
import { genericRequest } from '../../../Utils/Requests';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { generalValidationForm } from '../../../Utils/FormValidations';
import _ from 'lodash';
import '../../../sass/SystemAdmin.scss';

class EditUOM extends Component {
	constructor(props) {
		super(props);
		this.state = {
			name: '',
			description: '',
			decimals: false,
			status: 'Active',
			show: false,
			showForm: true,
			modalError: false,
			validation: {}
		};
	}

	componentDidMount() {
		this.loadData();
	}

	loadData = () => {
		const { actions } = this.props;

		return actions.getUOMById(this.props.user.site, this.props.uom_id).then((response) => {
			this.setState({
				name: response[0].UOM_name,
				description: response[0].UOM_description,
				decimals: response[0].decimals,
				status: response[0].status,
			});
		});
	};

	handleChange = (event) => {
		const target = event.target;
		const value = target.value;
		const name = target.name;

		this.setState({
			[name]: value,
		});
	};

	createUOM = (e) => {
		e.preventDefault();
		const { name, description, status, decimals } = this.state;

		const validation = generalValidationForm(this.state);

		if (_.isEmpty(validation)) {
			genericRequest('put', API, '/insert_uom', null, null, {
				uom_id: this.props.uom_id,
				uom_code: `${this.props.user.site_prefix}-${name}`.replace(/\s+/g, ''),
				uom_name: name,
				uom_description: description === '' ? null : description,
				status: status,
				decimals: parseInt(decimals, 10),
				site_id: this.props.user.site,
			}).then(
				() => {
					this.props.Refresh();
					this.setState({
						show: true,
					});
					this.handleClose();
				},
				(error) => {
					console.log(error);
				}
			);
		} else {
			this.setState({
				validation
			});
		}
	};

	handleClose = () => {
		this.setState({ showForm: false });
	};

	closeModalError = () => {
		this.setState({ modalError: false });
	};

	closeSuccessModal = () => {
		this.setState({ show: false });
	};

	render() {
		const t = this.props.t;
		const validation = this.state.validation;
		return (
			<div>
				<Modal show={this.state.showForm} onHide={this.handleClose} centered>
					<Modal.Header closeButton>
						<Modal.Title>{t('Update UOM')}</Modal.Title>
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
								<Form.Label column sm={2}>{t('Decimals')}:</Form.Label>
								<Col sm={4}>
									<Form.Control
										as="select"
										value={this.state.decimals}
										name='decimals'
										autoComplete={"false"}
										onChange={this.handleChange}
									>
										<option value={0}>No</option>
										<option value={1}>Yes</option>
									</Form.Control>
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
						<Button variant="Primary" onClick={(e) => this.createUOM(e)}>
							{t('Confirm')}
						</Button>
						<Button variant="secondary" onClick={this.handleClose}>
							{t('Close')}
						</Button>
					</Modal.Footer>
				</Modal>
				<Modal show={this.state.show} onHide={this.closeSuccessModal}>
					<Modal.Header closeButton>
						<Modal.Title>Sucess</Modal.Title>
					</Modal.Header>
					<Modal.Body>UOM has been updated</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={this.closeSuccessModal}>
							Close
						</Button>
					</Modal.Footer>
				</Modal>
				<Modal show={this.state.modalError} onHide={this.closeModalError}>
					<Modal.Header closeButton>
						<Modal.Title>Warning</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						{this.props.user.site_prefix === null
							? 'Please add a prefix for your site in the Common Parameters module'
							: 'All inputs must be filled'}
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={this.closeModalError}>
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
		actions: bindActionCreators(UOMActions, dispatch),
	};
};

export default connect(null, mapDispatch)(EditUOM);
