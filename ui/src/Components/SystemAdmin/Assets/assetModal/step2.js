import React, { Component } from 'react';
import { Form, Button, Col, Row, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UOMActions from '../../../../redux/actions/uomActions';
import * as TagActions from '../../../../redux/actions/tagActions';
import { API } from '../../../../Utils/Constants';
import Axios from 'axios';
import { validateTagForm } from '../../../../Utils/FormValidations';
import _ from 'lodash';

export class Step2 extends Component {
	constructor(props) {
		super(props);
		this.state = {
			asset: props.asset,
			asset2: props.asset2,
			tag: {},
			status: 'Active',
			name: '',
			uom_code: 0,
			description: '',
			rollover: 999999,
			data_type: 'Integer',
			max_change: 10,
			uomData: [],
			show: false,
			modalError: false,
			validation: {}
		};
	}

	componentDidMount() {
		this.fetchData();
	}

	fetchData = () => {
		const { actions } = this.props;

		const params = {
			site_id: this.props.user.site,
			asset_id: this.state.asset.asset_id
		};

		return Promise.all([
			actions.getUOMFilter(params),
			actions.getTagsFilter(params)
		]).then(
			(response) => {
				const uomData = response[0];
				const tag = response[1][0] || {};
				this.setState({
					uomData,
					tag,
					uom_code: tag.UOM_code || (uomData[0] ? uomData[0].UOM_code : 0),
					status: tag.status || 'Active',
					name: tag.tag_name || '',
					description: tag.tag_description || '',
					rollover: tag.rollover_point || 999999,
					data_type: tag.datatype || 'Integer',
					max_change: tag.max_change || 10
				});
			}
		);
	}

	handleChange = (event) => {
		this.setState({
			[event.target.name]: event.target.value
		});
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
		this.setState({ modalError: false, show: false });
	};

	createTag = (e) => {
		e.preventDefault();
		const { tag, status, name, uom_code, description, rollover, data_type, max_change, asset } = this.state;
		var url = `${API}/insert_tag`;

		const validation = validateTagForm(this.state);

		if (_.isEmpty(validation)) {
			const new_code = !tag.tag_id ? `${this.props.user.site_prefix}-${name}`.replace(/\s+/g, '') : tag.tag_code;
			Axios.put(url, {
				tag_id: tag.tag_id,
				tag_code: new_code,
				tag_name: name,
				tag_description: description,
				datatype: data_type,
				UOM_code: uom_code,
				site_id: this.props.user.site,
				rollover_point: parseInt(rollover, 10),
				aggregation: 'SUM',
				asset_id: asset.asset_id,
				max_change: parseInt(max_change, 10),
				status: status,
			}).then(
				() => {
					this.setState({
						show: true
					});
					this.fetchData();
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

	render() {
		const t = this.props.t;
		const validation = this.state.validation;
		return (
			<div>
				<Form>
					<Form.Group as={Row}>
						<Form.Label column sm={2}>
							{t('Name')}:
					</Form.Label>
						<Col sm={4}>
							<Form.Control
								type="text"
								name="name"
								value={this.state.name}
								autoComplete={'false'}
								onChange={this.handleChange}
							/>
							<Form.Text className="validation">{validation.name}</Form.Text>
						</Col>
						<Form.Label column sm={2}>
							{t('UOM Code')}:
					</Form.Label>
						<Col sm={4}>
							<Form.Control
								as="select"
								name="uom_code"
								onChange={this.handleChange}
								value={this.state.uom_code}
							>
								{this.state.uomData.map(this.renderUOM)}
							</Form.Control>
						</Col>
					</Form.Group>
					<Form.Group as={Row}>
						<Form.Label column sm={2}>
							{t('Rollover Point')}:
					</Form.Label>
						<Col sm={4}>
							<Form.Control
								type="number"
								name="rollover"
								min={1}
								value={this.state.rollover}
								autoComplete={'false'}
								onChange={this.handleChange}
							/>
							<Form.Text className="validation">{validation.rollover}</Form.Text>
						</Col>
						<Form.Label column sm={2}>
							{t('Data Type')}:
					</Form.Label>
						<Col sm={4}>
							<Form.Control
								as="select"
								name="data_type"
								value={this.state.data_type}
								onChange={this.handleChange}
							>
								<option value="Integer">Integer</option>
								<option value="Float">Decimals</option>
							</Form.Control>
						</Col>
					</Form.Group>
					<Form.Group as={Row}>
						<Form.Label column sm={2}>
							{t('Difference Between Values to Reset the Count')}:
					</Form.Label>
						<Col sm={4}>
							<Form.Control
								type="number"
								min={1}
								name="max_change"
								value={this.state.max_change}
								autoComplete={'false'}
								onChange={this.handleChange}
							/>
							<Form.Text className="validation">{validation.max_change}</Form.Text>
						</Col>
						<Form.Label column sm={2}>
							{t('Status')}:
					</Form.Label>
						<Col sm={4}>
							<Form.Control as="select" name="status" value={this.state.status} onChange={this.handleChange}>
								<option value="Active">Active</option>
								<option value="Inactive">Inactive</option>
							</Form.Control>
						</Col>
					</Form.Group>
					<Form.Group as={Row}>
						<Form.Label column sm={2}>
							{t('Description')}:
					</Form.Label>
						<Col sm={4}>
							<Form.Control
								as="textarea"
								name="description"
								value={this.state.description}
								onChange={this.handleChange}
								rows={3}
							/>
						</Col>
					</Form.Group>
					<Form.Group as={Row}>
						<Col sm={4}>
							<Button variant='success' onClick={(e) => this.createTag(e)}>
								{t('Apply')}
							</Button>
						</Col>
					</Form.Group>
					<button className='button-next' onClick={(e) => this.props.nextStep(e)}>{t('Next Step') + '>>'}</button>
					<button className='button-back' onClick={(e) => this.props.back(e)}>{'<<' + t('Previous Step')}</button>
				</Form>
				<Modal show={this.state.show} onHide={this.closeModalMessage}>
					<Modal.Header closeButton>
						<Modal.Title>Sucess</Modal.Title>
					</Modal.Header>
					<Modal.Body>Tag has been {this.props.action === 'Create' ? 'created' : (this.props.action === 'Edit' ? 'updated' : 'copied')}</Modal.Body>
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
					<Modal.Body>Tag has not been {this.props.action === 'Create' ? 'created' : (this.props.action === 'Edit' ? 'updated' : 'copied')}</Modal.Body>
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
		actions: Object.assign(bindActionCreators(TagActions, dispatch), bindActionCreators(UOMActions, dispatch)),
	};
};

export default connect(null, mapDispatch)(Step2);
