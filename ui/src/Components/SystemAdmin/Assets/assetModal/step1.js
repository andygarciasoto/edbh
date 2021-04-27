import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as DisplayActions from '../../../../redux/actions/displayActions';
import { genericRequest } from '../../../../Utils/Requests';
import { API } from '../../../../Utils/Constants';
import { Modal, Button } from 'react-bootstrap';
import { validateAssetForm } from '../../../../Utils/FormValidations';
import _ from 'lodash';
import { Form, Col, Row } from 'react-bootstrap';

export class Step1 extends Component {

	constructor(props) {
		super(props);
		const name = props.action === 'Copy' && _.isEqual(props.asset, props.asset2) ? '' : props.asset.asset_name;
		const code = props.action === 'Copy' && _.isEqual(props.asset, props.asset2) ? '' : props.asset.asset_code;
		this.state = {
			asset: props.asset || {},
			asset2: props.asset2 || {},
			code: code || '',
			automation_level: props.asset.automation_level || 'Automated',
			name: name || '',
			description: props.asset.asset_description || '',
			workcell: props.asset.workcell_id || '',
			level: props.asset.asset_level || 'Cell',
			site_code: props.asset.site_code || '',
			defaultPercent: props.asset.target_percent_of_ideal ? props.asset.target_percent_of_ideal * 100 : 0,
			parent_code: props.asset.parent_asset_code || '',
			escalation: props.asset.include_in_escalation || false,
			status: props.asset.status || 'Active',
			multiple: props.asset.is_multiple || false,
			valueStream: props.asset.value_stream || '',
			dynamic: props.asset.is_dynamic || false,
			siteCode: '',
			displayData: [],
			workcellData: [],
			parentData: [],
			show: false,
			modalError: false,
			validation: {}
		};
	}

	componentDidMount() {
		const { actions } = this.props;
		return Promise.all([
			actions.getWorkcells(this.props.user.site),
			actions.getAssetsLevel(this.props.user.site)
		]).then((response) => {
			const workcellData = response[0];
			const parentData = _.filter(response[1], { asset_level: 'Area' });
			this.setState({
				workcellData,
				parentData,
				parent_code: parentData[0] ? parentData[0].asset_code : ''
			});
		});
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (!_.isEqual(nextProps.asset, prevState.asset)) {
			const name = nextProps.action === 'Copy' && _.isEqual(nextProps.asset, nextProps.asset2) ? '' : nextProps.asset.asset_name;
			const code = nextProps.action === 'Copy' && _.isEqual(nextProps.asset, nextProps.asset2) ? '' : nextProps.asset.asset_code;
			return {
				asset: nextProps.asset,
				asset2: nextProps.asset2,
				code: code,
				automation_level: nextProps.asset.automation_level,
				name: name,
				description: nextProps.asset.asset_description,
				workcell: nextProps.asset.workcell_id || '',
				level: nextProps.asset.asset_level,
				site_code: nextProps.asset.site_code,
				defaultPercent: nextProps.asset.target_percent_of_ideal ? nextProps.asset.target_percent_of_ideal * 100 : 0,
				parent_code: nextProps.asset.parent_asset_code || '',
				escalation: nextProps.asset.include_in_escalation,
				status: nextProps.asset.status,
				multiple: nextProps.asset.is_multiple,
				valueStream: nextProps.asset.value_stream || '',
				dynamic: nextProps.asset.is_dynamic
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

	handleChangeLevel = (event) => {
		const target = event.target;
		const value = target.value;
		const name = target.name;

		this.props.showFooter(value === 'Cell');

		this.setState({
			[name]: value,
		});
	};

	handleChangePercentage = (event) => {
		const target = event.target;
		if (parseInt(target.value, 10) >= 0 && parseInt(target.value, 10) <= 100 && !target.value.includes('.')) {
			this.setState({
				[target.name]: target.value,
			});
		}
	};

	renderDisplay(display, index) {
		return (
			<option value={display.assetdisplaysystem_id} key={index}>
				{display.displaysystem_name}
			</option>
		);
	}

	renderWorkcell(workcell, index) {
		return (
			<option value={workcell.workcell_id} key={index}>
				{workcell.workcell_name}
			</option>
		);
	}

	renderParent(parent, index) {
		return (
			<option value={parent.asset_code} key={index}>
				{parent.asset_name}
			</option>
		);
	}

	createAsset = (e) => {
		e.preventDefault();
		const {
			code,
			automation_level,
			name,
			description,
			workcell,
			level,
			parent_code,
			escalation,
			valueStream,
			dynamic,
			status,
			defaultPercent,
			multiple,
			asset,
			asset2,
			siteCode
		} = this.state;

		const newPercent = defaultPercent / 100;

		const validation = validateAssetForm(this.state, this.props);


		if (_.isEmpty(validation)) {
			console.log(code);
			const new_code = code === '' ? `${this.props.user.site_prefix}-${name}`.replace(/\s+/g, '') : code;
			const asset_id = this.props.action === 'Copy' && _.isEqual(asset, asset2) ? 0 : asset.asset_id;
			genericRequest('put', API, '/insert_asset', null, null, {
				site_id: this.props.user.site,
				asset_id: asset_id,
				asset_code: new_code,
				asset_name: name,
				asset_description: description,
				asset_level: level,
				site_code: this.props.user.site_code,
				parent_asset_code: level === 'Site' ? '' : level === 'Area' ? this.props.user.site_code : parent_code,
				automation_level: automation_level,
				include_in_escalation: escalation,
				grouping1: workcell,
				grouping2: '',
				grouping3: '',
				grouping4: '',
				grouping5: '',
				status: status,
				target_percent_of_ideal: newPercent,
				is_multiple: multiple,
				value_stream: valueStream,
				is_dynamic: dynamic,
				badge: this.props.user.badge,
				site_prefix: siteCode
			}).then(
				() => {
					this.setState({
						show: true,
						validation: {}
					});
					this.props.Refresh();
					if (level !== 'Cell' && (this.props.action === 'Create' || this.props.action === 'Copy')) {
						this.props.handleClose();
					} else {
						this.props.updateAssetByCode(new_code);
					}
				},
				(error) => {
					this.setState({
						modalError: true,
						validation: {}
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
			<div className='stepContent'>
				<Form>
					<Form.Group as={Row}>
						<Form.Label column sm={2}>{t('Name')}:</Form.Label>
						<Col sm={4}>
							<Form.Control
								type='text'
								name="name"
								autoComplete={'false'}
								onChange={this.handleChange}
								value={this.state.name}
							/>
							<Form.Text className='validation'>{validation.name}</Form.Text>
						</Col>
						<Form.Label column sm={2}>{t('Automation Level')}:</Form.Label>
						<Col sm={4}>
							<Form.Control
								as='select'
								name='automation_level'
								onChange={this.handleChange}
								value={this.state.automation_level}
								disabled={this.state.level !== 'Cell'}
							>
								<option value='Automated'>Automated</option>
								<option value='Manual'>Manual</option>
								<option value='Partially_Automatic_Order'>Partially Automatic Order</option>
								<option value='Partially_Manual_Automatic_Order'>Partially Manual Automatic Order</option>
								<option value='Partially_Manual_Scan_Order'>Partially Manual Scan Order</option>
							</Form.Control>
						</Col>
					</Form.Group>
					<Form.Group as={Row}>
						<Form.Label column sm={2}>{t('Level')}:</Form.Label>
						<Col sm={4}>
							<Form.Control
								as='select'
								name='level'
								onChange={this.handleChangeLevel}
								value={this.state.level}
								disabled={this.props.action !== 'Create'}
							>
								<option value='Site'>Site</option>
								<option value='Area'>Area</option>
								<option value='Cell'>Cell</option>
							</Form.Control>
						</Col>
						<Form.Label column sm={2}>{t('Parent Code')}:</Form.Label>
						<Col sm={4}>
							<Form.Control
								as='select'
								name='parent_code'
								onChange={this.handleChange}
								value={this.state.parent_code}
								disabled={this.state.level === 'Cell' ? false : true}
							>
								{this.state.parentData.map(this.renderParent)}
							</Form.Control>
						</Col>
					</Form.Group>
					<Form.Group as={Row}>
						<Form.Label column sm={2}>{t('Workcell')}:</Form.Label>
						<Col sm={4}>
							<Form.Control
								as='select'
								name="workcell"
								value={this.state.workcell}
								onChange={this.handleChange}
								disabled={this.state.level !== 'Cell'}
							>
								<option value=''>None</option>
								{this.state.workcellData.map(this.renderWorkcell)}
							</Form.Control>
						</Col>
						<Form.Label column sm={2}>{t('Target Percent of Ideal')}:</Form.Label>
						<Col sm={4}>
							<Form.Control
								type='number'
								name="defaultPercent"
								min={0}
								max={100}
								step={1}
								value={this.state.defaultPercent}
								onChange={this.handleChangePercentage}
								autoComplete={'false'}
								disabled={this.state.level !== 'Cell'}
							/>
							<Form.Text className='validation'>{validation.defaultPercent}</Form.Text>
						</Col>
					</Form.Group>
					<Form.Group as={Row}>
						<Form.Label column sm={2}>{t('Multi Sign-In Machine')}:</Form.Label>
						<Col sm={4}>
							<Form.Control
								as='select'
								name='multiple'
								onChange={this.handleChange}
								value={this.state.multiple}
								disabled={this.state.level !== 'Cell'}
							>
								<option value={true}>Yes</option>
								<option value={false}>No</option>
							</Form.Control>
						</Col>
						<Form.Label column sm={2}>{t('Include in Escalation')}:</Form.Label>
						<Col sm={4}>
							<Form.Control
								as='select'
								name='escalation'
								onChange={this.handleChange}
								value={this.state.escalation}
								disabled={this.state.level !== 'Cell'}
							>
								<option value={true}>Yes</option>
								<option value={false}>No</option>
							</Form.Control>
						</Col>
					</Form.Group>
					<Form.Group as={Row}>
						<Form.Label column sm={2}>{t('Unscheduled Lunchs/Breaks')}:</Form.Label>
						<Col sm={4}>
							<Form.Control
								as='select'
								name='dynamic'
								onChange={this.handleChange}
								value={this.state.dynamic}
								disabled={this.state.level !== 'Cell'}
							>
								<option value={true}>Yes</option>
								<option value={false}>No</option>
							</Form.Control>
						</Col>
						<Form.Label column sm={2}>{t('Value Stream')}:</Form.Label>
						<Col sm={4}>
							<Form.Control
								type='text'
								name='valueStream'
								onChange={this.handleChange}
								value={this.state.valueStream}
								disabled={this.state.level !== 'Cell'}
							/>
						</Col>
					</Form.Group>
					<Form.Group as={Row}>
						<Form.Label column sm={2}>{t('Status')}:</Form.Label>
						<Col sm={4}>
							<Form.Control
								as="select"
								name="status"
								onChange={this.handleChange}
								value={this.state.status}
							>
								<option value="Active">Active</option>
								<option value="Inactive">Inactive</option>
							</Form.Control>
						</Col>
						<Form.Label column sm={2}>{t('Description')}:</Form.Label>
						<Col sm={4}>
							<Form.Control
								as="textarea"
								name="description"
								onChange={this.handleChange}
								value={this.state.description}
								rows={3} />
						</Col>
					</Form.Group>
					{this.state.level === 'Site' &&
						<Form.Group as={Row}>
							<Form.Label column sm={2}>{t('Site Prefix Code')}:</Form.Label>
							<Col sm={4}>
								<Form.Control
									type='text'
									name="siteCode"
									autoComplete={'false'}
									onChange={this.handleChange}
									value={this.state.siteCode}
								/>
								<Form.Text className='validation'>{validation.siteCode}</Form.Text>
							</Col>
						</Form.Group>
					}
					{this.state.level !== 'Cell' && this.props.action !== 'Edit' ? (
						<Form.Group as={Row}>
							<Col sm={6}>
								<Button variant="Primary" onClick={(e) => this.createAsset(e)}>
									{t('Confirm')}
								</Button>
								<Button variant="secondary" onClick={(e) => this.props.handleClose()}>
									{t('Close')}
								</Button>
							</Col>
						</Form.Group>
					) : (
						<div>
							{this.props.action !== 'Create' || (this.props.action === 'Create' && !this.props.asset.asset_id) ?
								<Form.Group as={Row}>
									<Col sm={4}>
										<Button variant='success' onClick={(e) => this.createAsset(e)}>{t('Apply')}</Button>
									</Col>
								</Form.Group>
								: null}
							{this.props.action === 'Edit' || (this.props.action === 'Create' && this.props.asset.asset_id) || (this.props.action === 'Copy' && !_.isEqual(this.state.asset, this.state.asset2)) ?
								<button className="button-next" onClick={(e) => this.props.nextStep(e)}>{t('Next Step') + '>>'}</button>
								: null}
						</div>
					)}
				</Form>
				<Modal show={this.state.show} onHide={this.closeModalMessage}>
					<Modal.Header closeButton>
						<Modal.Title>Sucess</Modal.Title>
					</Modal.Header>
					<Modal.Body>Asset has been {this.props.action === 'Create' ? 'created' : (this.props.action === 'Edit' ? 'updated' : 'copied')}</Modal.Body>
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
					<Modal.Body>Asset has not been {this.props.action === 'Create' ? 'created' : (this.props.action === 'Edit' ? 'updated' : 'copied')}</Modal.Body>
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
		actions: bindActionCreators(DisplayActions, dispatch),
	};
};

export default connect(null, mapDispatch)(Step1);
