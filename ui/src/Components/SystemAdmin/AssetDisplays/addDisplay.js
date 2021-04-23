import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as AssetActions from '../../../redux/actions/assetActions';
import { API } from "../../../Utils/Constants";
import { genericRequest } from '../../../Utils/Requests';
import { Modal, Button, Form, Col, Row } from 'react-bootstrap';
import _ from 'lodash';
import { generalValidationForm } from '../../../Utils/FormValidations';
import '../../../sass/SystemAdmin.scss';

class AddDisplay extends Component {
	constructor(props) {
		super(props);
		this.state = {
			AssetsData: [],
			name: '',
			asset: 0,
			status: 'Active',
			show: false,
			showForm: true,
			modalError: false,
			validation: {}
		};
	}

	componentDidMount() {
		const { actions } = this.props;

		return actions.getAssets(this.props.user.site).then((response) => {
			let assetList = _.filter(response, { asset_level: 'Cell' });
			this.setState({
				AssetsData: assetList,
				asset: assetList[0] ? assetList[0].asset_id : 0
			});
		});
	}

	handleChange = (event) => {
		const target = event.target;
		const value = target.value;
		const name = target.name;

		this.setState({
			[name]: value,
		});
	};

	createDisplay = (e) => {
		e.preventDefault();
		const { name, asset, status } = this.state;

		const validation = generalValidationForm(this.state);

		if (_.isEmpty(validation)) {
			genericRequest('put', API, '/insert_displaysystem', null, null, {
				asset_id: parseInt(asset, 10),
				displaysystem_name: name,
				site_id: this.props.user.site,
				status: status
			}).then(
				() => {
					this.props.Refresh();
					this.setState({
						show: true,
					});
					this.handleClose();
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

	renderAssets(assets, index) {
		return (
			<option value={assets.asset_id} key={index}>
				{assets.asset_name}
			</option>
		);
	}

	handleClose = () => {
		this.setState({ showForm: false });
		this.props.closeForm();
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
						<Modal.Title>{t('Add Display')}</Modal.Title>
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
								<Form.Label column sm={2}>{t('Asset')}:</Form.Label>
								<Col sm={4}>
									<Form.Control
										as='select'
										name='asset'
										value={this.state.asset}
										onChange={this.handleChange}
									>
										{this.state.AssetsData.map(this.renderAssets)}
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
						<Button variant="Primary" onClick={(e) => this.createDisplay(e)}>
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
					<Modal.Body>Display has been added</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={this.closeSuccessModal}>
							Close
						</Button>
					</Modal.Footer>
				</Modal>
				<Modal show={this.state.modalError} onHide={this.closeModalError}>
					<Modal.Header closeButton>
						<Modal.Title>Error</Modal.Title>
					</Modal.Header>
					<Modal.Body>Display has not been added</Modal.Body>
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
		actions: bindActionCreators(AssetActions, dispatch),
	};
};

export default connect(null, mapDispatch)(AddDisplay);
