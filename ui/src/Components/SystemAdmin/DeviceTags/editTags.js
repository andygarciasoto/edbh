import Axios from 'axios';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UOMActions from '../../../redux/actions/uomActions';
import { API } from '../../../Utils/Constants';
import { Modal, Button, Form, Col, Row } from 'react-bootstrap';
import _ from 'lodash';
import { validateTagForm } from '../../../Utils/FormValidations';
import '../../../sass/SystemAdmin.scss';

class EditDevice extends Component {
	constructor(props) {
		super(props);
		this.state = {
			code: '',
			status: 'Active',
			name: '',
			uom_code: '',
			description: '',
			rollover: 999999,
			data_type: 'Integer',
			max_change: 10,
			asset: 0,
			uomData: [],
			show: false,
			showForm: true,
			sites: [],
			modalError: false,
			validation: {}
		};
	}

	componentDidMount() {
		const { actions } = this.props;

		return Promise.all([
			actions.getUOM(this.props.user.site),
			actions.getAssets(this.props.user.site),
			actions.getTagById(this.props.user.site, this.props.tag_id),
		]).then((response) => {
			const assetOption = _.filter(response[1], { asset_level: 'Cell' });
			this.setState({
				uomData: response[0],
				sites: assetOption,
				asset: response[2][0].asset_id,
				code: response[2][0].tag_code,
				status: response[2][0].status,
				name: response[2][0].tag_name,
				uom_code: response[2][0].UOM_code,
				description: response[2][0].tag_description,
				rollover: response[2][0].rollover_point,
				data_type: response[2][0].datatype,
				max_change: response[2][0].max_change,
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

	createTag = (e) => {
		e.preventDefault();
		const { code, status, name, uom_code, description, rollover, data_type, max_change, asset } = this.state;

		let url = `${API}/insert_tag`;
		const validation = validateTagForm(this.state);
		if (_.isEmpty(validation)) {
			Axios.put(url, {
				tag_id: this.props.tag_id,
				tag_code: code,
				tag_name: name,
				tag_description: description,
				datatype: data_type,
				UOM_code: uom_code,
				site_id: this.props.user.site,
				rollover_point: parseInt(rollover, 10),
				aggregation: 'SUM',
				asset_id: parseInt(asset, 10),
				max_change: parseInt(max_change, 10),
				status: status,
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

	renderAssets(assets, index) {
		return (
			<option value={assets.asset_id} key={index}>
				{assets.asset_name}
			</option>
		);
	}

	renderUOM(uom, index) {
		return (
			<option value={uom.UOM_code} key={index}>
				{uom.UOM_code}
			</option>
		);
	}

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
				<Modal show={this.state.showForm} onHide={this.handleClose} className="general-modal" centered>
					<Modal.Header closeButton>
						<Modal.Title>{t('Update Tag')}</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Form>
							<Form.Group as={Row}>
								<Form.Label column sm={2}>{t('Name')}:</Form.Label>
								<Col sm={4}>
									<Form.Control
										type='text'
										name='name'
										value={this.state.name}
										autoComplete={'false'}
										onChange={this.handleChange}
									/>
									<Form.Text className='validation'>{validation.name}</Form.Text>
								</Col>
								<Form.Label column sm={2}>{t('UOM Code')}:</Form.Label>
								<Col sm={4}>
									<Form.Control
										as='select'
										name='uom_code'
										onChange={this.handleChange}
										value={this.state.uom_code}
									>
										{this.state.uomData.map(this.renderUOM)}
									</Form.Control>
								</Col>
							</Form.Group>
							<Form.Group as={Row}>
								<Form.Label column sm={2}>{t('Rollover Point')}:</Form.Label>
								<Col sm={4}>
									<Form.Control
										type='number'
										name='rollover'
										min={1}
										value={this.state.rollover}
										autoComplete={'false'}
										onChange={this.handleChange}
									/>
									<Form.Text className='validation'>{validation.rollover}</Form.Text>
								</Col>
								<Form.Label column sm={2}>{t('Data Type')}:</Form.Label>
								<Col sm={4}>
									<Form.Control
										as='select'
										name='data_type'
										value={this.state.data_type}
										onChange={this.handleChange}
									>
										<option value="Integer">Integer</option>
										<option value="Float">Decimals</option>
									</Form.Control>
								</Col>
							</Form.Group>
							<Form.Group as={Row}>
								<Form.Label column sm={2}>{t('Max Change')}:</Form.Label>
								<Col sm={4}>
									<Form.Control
										type='number'
										min={1}
										name='max_change'
										value={this.state.max_change}
										autoComplete={'false'}
										onChange={this.handleChange}
									/>
									<Form.Text className='validation'>{validation.max_change}</Form.Text>
								</Col>
								<Form.Label column sm={2}>{t('Asset')}:</Form.Label>
								<Col sm={4}>
									<Form.Control
										as='select'
										name='asset'
										value={this.state.asset}
										onChange={this.handleChange}
									>
										{this.state.sites.map(this.renderAssets)}
									</Form.Control>
								</Col>
							</Form.Group>
							<Form.Group as={Row}>
								<Form.Label column sm={2}>{t('Description')}:</Form.Label>
								<Col sm={4}>
									<Form.Control
										as="textarea"
										name="description"
										value={this.state.description}
										onChange={this.handleChange}
										rows={3} />
								</Col>
								<Form.Label column sm={2}>{t('Status')}:</Form.Label>
								<Col sm={4}>
									<Form.Control
										as='select'
										name='status'
										value={this.state.status}
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
						<Button variant="Primary" onClick={(e) => this.createTag(e)}>
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
					<Modal.Body>Tag has been updated</Modal.Body>
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
					<Modal.Body>All inputs must be filled</Modal.Body>
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

export default connect(null, mapDispatch)(EditDevice);
