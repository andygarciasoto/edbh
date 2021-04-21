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

class UOMModal extends Component {
	constructor(props) {
		super(props);
		this.state = {
			uom: props.uom,
			code: '',
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

	static getDerivedStateFromProps(nextProps, prevState) {
		if (!_.isEqual(nextProps.uom, prevState.uom)) {
			const name = nextProps.action === 'Edit' ? nextProps.uom.UOM_name : '';
			const uom_id = nextProps.action === 'Edit' ? nextProps.uom.UOM_id : 0;
			return {
				uom: nextProps.uom,
				uom_id: uom_id,
				name: name,
				description: nextProps.uom.UOM_description || '',
				decimals: nextProps.uom.decimals || false,
				status: nextProps.uom.status || 'Active',
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

	createUOM = (e) => {
		e.preventDefault();
		const { uom_id, code, name, description, status, decimals } = this.state;

		const validation = generalValidationForm(this.state);

		if (_.isEmpty(validation)) {
			genericRequest('put', API, '/insert_uom', null, null, {
				uom_id: uom_id,
				uom_code: this.props.action === 'Edit' ? code : `${this.props.user.site_prefix}-${name}`.replace(/\s+/g, ''),
				uom_name: name,
				uom_description: description,
				status: status,
				decimals: parseInt(decimals, 10),
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
					console.log(error);
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
										<option value={false}>No</option>
										<option value={true}>Yes</option>
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
						<Button variant="secondary" onClick={this.props.handleClose}>
							{t('Close')}
						</Button>
					</Modal.Footer>
				</Modal>
				<Modal show={this.state.show} onHide={this.closeModalMessage}>
					<Modal.Header closeButton>
						<Modal.Title>Sucess</Modal.Title>
					</Modal.Header>
					<Modal.Body>UOM has been copied</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={this.closeModalMessage}>
							Close
						</Button>
					</Modal.Footer>
				</Modal>
				<Modal show={this.state.modalError} onHide={this.closeModalMessage}>
					<Modal.Header closeButton>
						<Modal.Title>Warning</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						{this.props.user.site_prefix === null
							? 'Please add a prefix for your site in the Common Parameters module'
							: 'All inputs must be filled'}
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

export const mapDispatch = (dispatch) => {
	return {
		actions: bindActionCreators(UOMActions, dispatch),
	};
};

export default connect(null, mapDispatch)(UOMModal);
