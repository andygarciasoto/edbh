import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as CommonActions from '../../../redux/actions/commonActions';
import * as UserActions from "../../../redux/actions/userActions";
import Axios from 'axios';
import { API } from '../../../Utils/Constants';
import { Form, Col, Modal, Button, Row, InputGroup } from 'react-bootstrap';
import { validateCommonParametersForm } from '../../../Utils/FormValidations';
import { getResponseFromGeneric } from '../../../Utils/Requests';
import _ from 'lodash';


class CommonParams extends Component {
	constructor(props) {
		super(props);
		this.state = {
			defaultRouted: 0,
			defaultLunch: 0,
			productionOffset: 0,
			language: '',
			defaultBreak: 0,
			timezone: '',
			timezone_id: 0,
			language_id: 0,
			inactiveTimeout: 0,
			defaultPercent: 0,
			verticalDashboard: 0,
			defaultMinutes: 0,
			siteCode: '',
			status: '',
			assembly_url: '',
			timezonesData: [],
			languagesData: [],
			modalError: false,
			show: false,
			readOnly: true,
			validation: {},
			escalationlevel1: 0,
			escalationlevel2: 0,
			escalationlevel3: 0
		};
	}

	componentDidMount() {
		this.loadData();
	}

	loadData = () => {
		const { actions } = this.props;
		const params = {
			site_id: this.props.user.site
		}
		Promise.all([
			actions.getParams(this.props.user.site),
			actions.getTimezones(),
			actions.getLanguages(),
			actions.getEscalationFilter(params),
			actions.getEscalationFilter()
		]).then((response) => {
			const escalationlevel1 = _.isEmpty(response[3]) ? 0 : response[3][0].escalation_hours;
			const escalationlevel2 = _.isEmpty(response[3]) ? 0 : response[3][1].escalation_hours;
			const escalationlevel3 = _.isEmpty(response[3]) ? 0 : response[3][2].escalation_hours;
			this.setState({
				defaultRouted: response[0].default_routed_cycle_time,
				defaultLunch: response[0].lunch_minutes,
				productionOffset: response[0].production_day_offset_minutes,
				language: response[0].language,
				language_id: response[0].language_id,
				defaultBreak: response[0].break_minutes,
				timezone: response[0].ui_timezone,
				timezone_id: response[0].timezone_id,
				inactiveTimeout: response[0].inactive_timeout_minutes,
				assembly_url: response[0].assembly_url || '',
				defaultPercent: response[0].default_target_percent_of_ideal * 100,
				verticalDashboard: response[0].summary_timeout,
				defaultMinutes: response[0].default_setup_minutes,
				siteCode: response[0].site_code,
				status: response[0].status,
				timezonesData: response[1],
				languagesData: response[2],
				escalationlevel1,
				escalationlevel2,
				escalationlevel3,
				siteEscalations: response[3],
				newSiteEscalations: response[4]
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

	handleChangeNumbers = (event) => {
		const target = event.target;

		if (parseInt(target.value, 10) >= 0) {
			this.setState({
				[target.name]: target.value,
			});
		}
	};

	handleChangePercentage = (event) => {
		const target = event.target;
		if (parseInt(target.value, 10) >= 0 && parseInt(target.value, 10) <= 100 && !target.value.includes('.')) {
			this.setState({
				[target.name]: target.value,
			});
		}
	};

	renderTimezones(timezones, index) {
		return (
			<option value={timezones.timezone_id} key={index}>
				{timezones.name}
			</option>
		);
	}

	renderLanguages(languages, index) {
		return (
			<option value={languages.language_id} key={index}>
				{languages.translation.charAt(0).toUpperCase() + languages.translation.slice(1)}
			</option>
		);
	}

	updateParams = (e) => {
		e.preventDefault();
		const {
			defaultRouted,
			defaultLunch,
			productionOffset,
			language_id,
			defaultBreak,
			timezone_id,
			inactiveTimeout,
			assembly_url,
			defaultPercent,
			verticalDashboard,
			defaultMinutes,
			siteCode,
			status,
			escalationlevel1,
			escalationlevel2,
			escalationlevel3,
			siteEscalations,
			newSiteEscalations
		} = this.state;

		let url = `${API}/insert_commonparameter`;
		const newPercent = defaultPercent / 100;

		const validation = validateCommonParametersForm(this.state);

		if (
			_.isEmpty(validation)
		) {
			const escalation_group = _.isEmpty(siteEscalations) ? 'Group ' + newSiteEscalations[0]["Group to create"] : siteEscalations[0].escalation_group;
			Axios.put(url, {
				site_id: this.props.user.site,
				site_name: this.props.user.site_name,
				production_day_offset_minutes: parseInt(productionOffset, 10),
				default_target_percent_of_ideal: newPercent,
				default_setup_minutes: parseInt(defaultMinutes, 10),
				default_routed_cycle_time: parseInt(defaultRouted, 10),
				inactive_timeout_minutes: parseInt(inactiveTimeout, 10),
				status: status,
				summary_timeout: parseInt(verticalDashboard, 10),
				break_minutes: parseInt(defaultBreak, 10),
				lunch_minutes: parseInt(defaultLunch, 10),
				site_prefix: siteCode,
				assembly_url: assembly_url,
				timezone_id: parseInt(timezone_id, 10),
				language_id: parseInt(language_id, 10),
				escalation_group: escalation_group
			}).then(
				async () => {
					let arrayData = [];
					for (let i = 0; i < 3; i++) {
						arrayData.push({
							escalation_name: i === 0 ? 'Site Manager' : (i === 1 ? 'Value Stream Manager' : 'Plant Manager'),
							escalation_group: escalation_group,
							escalation_level: i + 1,
							escalation_hours: i === 0 ? escalationlevel1 : (i === 1 ? escalationlevel2 : escalationlevel3),
							status: 'Active'
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
						this.setState({
							show: true,
							validation: {}
						});
						this.loadData();
					}
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

	closeModal = (e) => {
		e.preventDefault(e);
		this.setState({ show: false, modalError: false });
	};

	showEscalationModal = (escalation, action) => {
		this.setState({
			escalation,
			action,
			showEscalationModal: true
		})
	}

	showEscalationCreateModal = () => {
		this.setState({
			showEscalationCreateModal: true
		})
	}

	closeEscalationModal = () => {
		this.setState({
			escalation: {},
			action: '',
			showEscalationModal: false,
			showEscalationCreateModal: false
		})
	}

	render() {
		const t = this.props.t;
		const validation = this.state.validation;
		return (
			<div className="common-params">
				<Form className='commonParametersForm'>
					<Form.Group as={Row}>
						<Form.Label column sm={1}>{t('Site Name')}:</Form.Label>
						<Col sm={2}>
							<Form.Control
								type="text"
								name="siteName"
								value={this.props.user.site_name}
								autoComplete={"false"}
								readOnly={true}
							/>
						</Col>
						<Form.Label column sm={1}>{t('Routed Cycle Time')}:</Form.Label>
						<Col sm={2}>
							<Form.Control
								type="number"
								name="defaultRouted"
								value={this.state.defaultRouted}
								min={1}
								autoComplete={"false"}
								onChange={this.handleChangeNumbers}
							/>
						</Col>
						<Form.Label column sm={1}>{t('Lunch Minutes')}:</Form.Label>
						<Col sm={2}>
							<Form.Control
								type="number"
								name="defaultLunch"
								value={this.state.defaultLunch}
								min={0}
								autoComplete={"false"}
								onChange={this.handleChangeNumbers}
							/>
						</Col>
					</Form.Group>
					<Form.Group as={Row}>
						<Form.Label column sm={1}>{t('Production Day Offset Minutes')}:</Form.Label>
						<Col sm={2}>
							<Form.Control
								type="number"
								name="productionOffset"
								value={this.state.productionOffset}
								autoComplete={"false"}
								onChange={this.handleChange}
							/>
						</Col>
						<Form.Label column sm={1}>{t('Language')}:</Form.Label>
						<Col sm={2}>
							<Form.Control
								as="select"
								name="language_id"
								value={this.state.language_id}
								autoComplete={"false"}
								onChange={this.handleChange}
							>
								{this.state.languagesData.map(this.renderLanguages)}
							</Form.Control>
							<Form.Text className='validation'>{validation.language_id}</Form.Text>
						</Col>
						<Form.Label column sm={1}>{t('Break Minutes')}:</Form.Label>
						<Col sm={2}>
							<Form.Control
								type="number"
								name="defaultBreak"
								value={this.state.defaultBreak}
								min={0}
								autoComplete={"false"}
								onChange={this.handleChangeNumbers}
							/>
						</Col>
					</Form.Group>
					<Form.Group as={Row}>
						<Form.Label column sm={1}>{t('Timezone')}:</Form.Label>
						<Col sm={2}>
							<Form.Control
								as="select"
								name="timezone_id"
								value={this.state.timezone_id}
								autoComplete={"false"}
								onChange={this.handleChange}
							>
								{this.state.timezonesData.map(this.renderTimezones)}
							</Form.Control>
							<Form.Text className='validation'>{validation.timezone_id}</Form.Text>
						</Col>
						<Form.Label column sm={1}>{t('Operator Session Timeout')}:</Form.Label>
						<Col sm={2}>
							<Form.Control
								type="number"
								name="inactiveTimeout"
								value={this.state.inactiveTimeout}
								autoComplete={"false"}
								min={0}
								onChange={this.handleChangeNumbers}
							/>
						</Col>
						<Form.Label column sm={1}>{t('Assembly URL')}:</Form.Label>
						<Col sm={2}>
							<Form.Control
								type="url"
								name="assembly_url"
								value={this.state.assembly_url || ' '}
								autoComplete={"false"}
								onChange={this.handleChange}
							/>
						</Col>
					</Form.Group>
					<Form.Group as={Row}>
						<Form.Label column sm={1}>{t('Target Percent of Ideal')}:</Form.Label>
						<Col sm={2}>
							<InputGroup className="mb-2">
								<Form.Control
									type='number'
									name='defaultPercent'
									value={this.state.defaultPercent}
									autoComplete={"false"}
									min={0}
									max={100}
									step={1}
									onChange={this.handleChangePercentage}
								/>
								<InputGroup.Prepend>
									<InputGroup.Text>%</InputGroup.Text>
								</InputGroup.Prepend>
							</InputGroup>
						</Col>
						<Form.Label column sm={1}>{t('Vertical Dashboard Timeout')}:</Form.Label>
						<Col sm={2}>
							<Form.Control
								type="number"
								name="verticalDashboard"
								value={this.state.verticalDashboard}
								autoComplete={"false"}
								min={0}
								onChange={this.handleChangeNumbers}
							/>
						</Col>
						<Form.Label column sm={1}>{t('Setup Minutes')}:</Form.Label>
						<Col sm={2}>
							<Form.Control
								type="number"
								name="defaultMinutes"
								value={this.state.defaultMinutes}
								autoComplete={"false"}
								min={0}
								onChange={this.handleChangeNumbers}
							/>
						</Col>
					</Form.Group>
					<Form.Group as={Row}>
						<Form.Label column sm={1}>{t('Site Identifier')}:</Form.Label>
						<Col sm={2}>
							<Form.Control
								type="text"
								name="siteCode"
								value={this.state.siteCode}
								autoComplete={"false"}
								onChange={this.handleChange}
							/>
							<Form.Text className='validation'>{validation.siteCode}</Form.Text>
						</Col>
					</Form.Group>
					<Form.Group as={Row}>
						<Form.Label column sm={2}>{t('Level 1 Site Manager Escalation Hours')}:</Form.Label>
						<Col sm={2}>
							<Form.Control
								type="number"
								name="escalationlevel1"
								value={this.state.escalationlevel1}
								autoComplete={"false"}
								min={0}
								onChange={this.handleChangeNumbers}
							/>
						</Col>
						<Form.Label column sm={2}>{t('Level 2 Value Stream Manager Escalation Hours')}:</Form.Label>
						<Col sm={2}>
							<Form.Control
								type="number"
								name="escalationlevel2"
								value={this.state.escalationlevel2}
								autoComplete={"false"}
								min={0}
								onChange={this.handleChangeNumbers}
							/>
						</Col>
					</Form.Group>
					<Form.Group as={Row}>
						<Form.Label column sm={2}>{t('Level 3 Plant Manager Escalation Hour')}:</Form.Label>
						<Col sm={2}>
							<Form.Control
								type="number"
								name="escalationlevel3"
								value={this.state.escalationlevel3}
								autoComplete={"false"}
								min={0}
								onChange={this.handleChangeNumbers}
							/>
						</Col>
						<Col md={{ span: 3, offset: 5 }}>
							<Button variant="outline-primary" className='commonParamBtn' onClick={(e) => this.updateParams(e)}>
								{t('Confirm')}
							</Button>
							<Button variant="outline-danger" className='commonParamBtn' onClick={() => this.loadData()}>
								{t('Cancel')}
							</Button>
						</Col>
					</Form.Group>
				</Form>
				<Modal show={this.state.show} onHide={this.handleClose}>
					<Modal.Header closeButton>
						<Modal.Title>Sucess</Modal.Title>
					</Modal.Header>
					<Modal.Body>Info has been updated</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={(e) => this.closeModal(e)}>
							Close
						</Button>
					</Modal.Footer>
				</Modal>
				<Modal show={this.state.modalError} onHide={this.handleClose}>
					<Modal.Header closeButton>
						<Modal.Title>Warning</Modal.Title>
					</Modal.Header>
					<Modal.Body>All inputs must be filled</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={(e) => this.closeModal(e)}>
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
		actions: Object.assign(bindActionCreators(CommonActions, dispatch), bindActionCreators(UserActions, dispatch)),
	};
};

export default connect(null, mapDispatch)(CommonParams);
