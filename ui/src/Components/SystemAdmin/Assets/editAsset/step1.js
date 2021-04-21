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
		this.state = {
			code: '',
			automation_level: 'Automated',
			name: '',
			description: '',
			workcell: 0,
			valueStream: '',
			level: 'Cell',
			site_code: '',
			defaultPercent: 0,
			parent_code: '',
			escalation: false,
			status: 'Active',
			multiple: false,
			dynamic: false,
			displayData: [],
			workcellData: [],
			parentData: [],
			show: false,
			modalError: false,
			validation: {}
		};
	}

	componentDidMount() {
		this.loadData();
	}

	handleChange = (event) => {
		const target = event.target;
		const value = target.value;
		const name = target.name;

		if (value === 'Cell') {
			this.props.showFooter(true, false);
		} else if (value === 'Site') {
			this.props.showFooter(false, true);
		} else if (value === 'Area') {
			this.props.showFooter(false, true);
		}

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

	loadData = () => {
		const { actions } = this.props;

		return Promise.all([
			actions.getWorkcells(this.props.user.site),
			actions.getAssetsLevel(this.props.user.site),
			actions.getAssetById(this.props.user.site, this.props.asset_id),
		]).then((response) => {
			this.setState({
				workcellData: response[0],
				workcell: response[0][0].workcell_id,
				parentData: response[1],
				parent_code: response[1][0].asset_code,
				code: response[2][0].asset_code,
				automation_level: response[2][0].automation_level,
				name: response[2][0].asset_name,
				description: response[2][0].asset_description,
				workcell: response[2][0].grouping1,
				level: response[2][0].asset_level,
				site_code: response[2][0].site_code,
				defaultPercent: response[2][0].target_percent_of_ideal,
				parent_code: response[2][0].parent_asset_code,
				escalation: response[2][0].include_in_escalation,
				status: response[2][0].status,
				multiple: response[2][0].is_multiple,
				valueStream: response[2][0].value_stream,
				dynamic: response[2][0].is_dynamic
			});
		});
	};

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
		} = this.state;

		const newPercent = defaultPercent / 100;

		const validation = validateAssetForm(this.state);


		if (_.isEmpty(validation)) {
			const code = `${this.props.user.site_prefix}-${name}`.replace(/\s+/g, '');
			genericRequest('put', API, '/insert_asset', null, null, {
				site_id: this.props.user.site,
				asset_id: this.props.asset_id,
				asset_code: code,
				asset_name: name,
				asset_description: description,
				asset_level: level,
				site_code: this.props.user.site_code,
				parent_asset_code: level === 'Site' ? '' : level === 'Area' ? this.props.user.site_code : parent_code,
				automation_level: automation_level,
				include_in_escalation: escalation,
				grouping1: parseInt(workcell, 10),
				grouping2: '',
				grouping3: '',
				grouping4: '',
				grouping5: '',
				status: status,
				target_percent_of_ideal: newPercent,
				is_multiple: multiple,
				value_stream: valueStream,
				is_dynamic: dynamic,
				badge: this.props.user.badge
			}).then(
				() => {
					this.props.levelSite === true &&
						this.setState({
							show: true,
						});
					this.props.levelSite === true && this.props.nextStep(e);
					this.props.getCode(code);
				},
				(error) => {
					console.log(error);
				}
			);
		} else {
			this.setState({
				modalError: true,
			});
		}
	};

	closeModalError = () => {
		this.setState({ modalError: false });
	};

	closeSuccessModal = () => {
		this.setState({ show: false });
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
								onChange={this.handleChange}
								value={this.state.level}
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
				</Form>
				{this.props.levelSite === false ? (
					<div>
						<Button variant="Primary" onClick={(e) => this.createAsset(e)}>
							{t('Confirm')}
						</Button>
						<Button variant="secondary" onClick={this.props.closeModal}>
							{t('Close')}
						</Button>{' '}
					</div>
				) : (
					<button className="button-next" onClick={(e) => this.createAsset(e)}>
						{t('Next Step') + '>>'}
					</button>
				)}
				<Modal show={this.state.show} onHide={this.closeSuccessModal}>
					<Modal.Header closeButton>
						<Modal.Title>Sucess</Modal.Title>
					</Modal.Header>
					<Modal.Body>Asset has been updated</Modal.Body>
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
		actions: bindActionCreators(DisplayActions, dispatch),
	};
};

export default connect(null, mapDispatch)(Step1);
