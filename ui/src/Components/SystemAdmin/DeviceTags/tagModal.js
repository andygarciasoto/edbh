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

class TagModal extends Component {
	constructor(props) {
		super(props);
		this.state = {
			tag: props.tag,
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
			actions.getAssets(this.props.user.site)
		]).then((response) => {
			const assetOption = _.filter(response[1], { asset_level: 'Cell' });
			this.setState({
				uomData: response[0],
				uom_code: response[0][0].UOM_code,
				sites: assetOption,
				asset: assetOption[0].asset_id
			});
		});
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (!_.isEqual(nextProps.tag, prevState.tag)) {
			const name = nextProps.action === 'Edit' ? nextProps.tag.tag_name : '';
			const tag_id = nextProps.action === 'Edit' ? nextProps.tag.tag_id : 0;
			return {
				tag: nextProps.tag,
				tag_id: tag_id,
				name: name,
				asset: nextProps.tag.asset_id || prevState.asset_id,
				code: nextProps.tag.tag_code || '',
				status: nextProps.tag.status || 'Active',
				uom_code: nextProps.tag.UOM_code || prevState.uom_code,
				description: nextProps.tag.tag_description || '',
				rollover: nextProps.tag.rollover_point || 999999,
				data_type: nextProps.tag.datatype || 'Integer',
				max_change: nextProps.tag.max_change || 10,
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

	createTag = (e) => {
		e.preventDefault();
		const { tag_id, code, status, name, uom_code, description, rollover, data_type, max_change, asset } = this.state;

		let url = `${API}/insert_tag`;
		const validation = validateTagForm(this.state);
		if (_.isEmpty(validation)) {
			Axios.put(url, {
				tag_id: tag_id,
				tag_code: this.props.action === 'Edit' ? code : `${this.props.user.site_prefix}-${name}`.replace(/\s+/g, ''),
				tag_name: name,
				tag_description: description,
				datatype: data_type,
				UOM_code: uom_code,
				site_id: this.props.user.site,
				rollover_point: parseInt(rollover, 10),
				aggregation: 'SUM',
				asset_id: parseInt(asset, 10),
				max_change: parseInt(max_change, 10),
				status: status
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
						modalError: true,
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

	renderUOM(uom, index) {
		return (
			<option value={uom.UOM_code} key={index}>
				{uom.UOM_code}
			</option>
		);
	}

	closeModalMessage = () => {
		this.setState({ show: false, modalError: false });
	};

	render() {
		const t = this.props.t;
		const validation = this.state.validation;
		return (
			<div>
				<Modal show={this.props.isOpen} onHide={this.props.handleClose} className="general-modal" centered>
					<Modal.Header closeButton>
						<Modal.Title>{t(this.props.action + ' Tag')}</Modal.Title>
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
								<Form.Label column sm={2}>{t('Difference Between Values to Reset the Count')}:</Form.Label>
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
							</Form.Group>
						</Form>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="Primary" onClick={(e) => this.createTag(e)}>
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
					<Modal.Body>Tag has been copied</Modal.Body>
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
					<Modal.Body>Tag has not been copied</Modal.Body>
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

export default connect(null, mapDispatch)(TagModal);
