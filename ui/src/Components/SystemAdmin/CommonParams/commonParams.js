import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as CommonActions from '../../../redux/actions/commonActions';
import Axios from 'axios';
import { API } from '../../../Utils/Constants';
import { Form, Col, Modal, Button } from 'react-bootstrap';

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
		};
	}

	componentDidMount() {
		const { actions } = this.props;

		return Promise.all([
			actions.getParams(this.props.user.site),
			actions.getTimezones(),
			actions.getLanguages(),
		]).then((response) => {
			this.setState({
				defaultRouted: response[0].default_routed_cycle_time,
				defaultLunch: response[0].lunch_minutes,
				productionOffset: response[0].production_day_offset_minutes,
				language: response[0].language,
				language_id: response[0].language_id,
				defaultBreak: response[0].break_minutes,
				timezone: response[0].ui_timezone,
				timezone_id: response[0].timezone_id,
				inactiveTimeout: response[0].summary_timeout,
				assembly_url: response[0].assembly_url,
				defaultPercent: response[0].default_target_percent_of_ideal,
				verticalDashboard: response[0].inactive_timeout_minutes,
				defaultMinutes: response[0].default_setup_minutes,
				siteCode: response[0].site_code,
				status: response[0].status,
				timezonesData: response[1],
				languagesData: response[2],
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
		} = this.state;

		var url = `${API}/insert_commonparameter`;
		const newPercent = defaultPercent / 100;
		console.log(newPercent);
		if (
			defaultRouted !== '' &&
			defaultLunch !== '' &&
			productionOffset != '' &&
			language_id !== null &&
			defaultBreak !== 0 &&
			timezone_id !== null &&
			inactiveTimeout !== 0 &&
			assembly_url !== '' &&
			verticalDashboard !== 0 &&
			defaultMinutes !== 0 &&
			siteCode !== ''
		) {
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
			}).then(
				() => {
					this.setState({
						show: true,
					});
					this.componentDidMount();
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

	closeModal = (e) => {
		e.preventDefault(e);
		this.setState({ show: false, modalError: false });
	};

	render() {
		return (
			<div className="common-params">
				<Form>
					<Form.Row>
						<Col>
							<label className="common1">
								Site Name:
								<input
									type="text"
									name="siteName"
									className="input site-name"
									value={this.props.user.site_name}
									autoComplete={'false'}
									readOnly={true}
								/>
							</label>
						</Col>
						<Col>
							<label className="common1">
								Default Routed Cycle Time:
								<input
									type="number"
									name="defaultRouted"
									className="input"
									value={this.state.defaultRouted}
									autoComplete={'false'}
									onChange={this.handleChange}
								/>
							</label>
						</Col>
						<Col>
							<label className="common1">
								{' '}
								Default Lunch Allowed:
								<input
									type="number"
									name="defaultLunch"
									className="input"
									value={this.state.defaultLunch}
									autoComplete={'false'}
									onChange={this.handleChange}
								/>
							</label>
						</Col>
					</Form.Row>
					<Form.Row>
						<Col>
							<label className="common1">
								{' '}
								Production Day Offset Minutes:
								<input
									type="number"
									name="productionOffset"
									className="input"
									value={this.state.productionOffset}
									autoComplete={'false'}
									onChange={this.handleChange}
								/>
							</label>
						</Col>
						<Col>
							<label className="common1 label-language">
								Default Language:
								<select
									className="input select-language"
									name="language_id"
									onChange={this.handleChange}
									value={this.state.language_id}
								>
									{this.state.languagesData.map(this.renderLanguages)}
								</select>
							</label>
						</Col>
						<Col>
							<label className="common1 label-default-break">
								{' '}
								Default Break Allowed:
								<input
									type="number"
									name="defaultBreak"
									className="input"
									value={this.state.defaultBreak}
									autoComplete={'false'}
									onChange={this.handleChange}
								/>
							</label>
						</Col>
					</Form.Row>
					<Form.Row>
						<Col>
							<label className="common1">
								{' '}
								Timezone:
								<select
									className="input timezone"
									name="timezone_id"
									value={this.state.timezone_id}
									onChange={this.handleChange}
								>
									{this.state.timezonesData.map(this.renderTimezones)}
								</select>
							</label>
						</Col>
						<Col>
							<label className="common1  label-ito">
								{' '}
								Dashboard Token Timeout:
								<input
									type="number"
									name="inactiveTimeout"
									className="input inactive-timeout"
									value={this.state.inactiveTimeout}
									autoComplete={'false'}
									onChange={this.handleChange}
								/>
							</label>
						</Col>
						<Col>
							<label className="common1  label-ito">
								{' '}
								Assembly URL:
								<input
									type="text"
									name="assembly_url"
									className="input assembly-url"
									value={this.state.assembly_url}
									autoComplete={'false'}
									onChange={this.handleChange}
								/>
							</label>
						</Col>
					</Form.Row>
					<Form.Row>
						<Col>
							<label className="common1">
								{' '}
								Default Target Percent of Ideal:
								<input
									type="number"
									name="defaultPercent"
									className="input default-target"
									value={this.state.defaultPercent}
									autoComplete={'false'}
									onChange={this.handleChange}
								/>
							</label>
						</Col>
						<Col>
							<label className="common1 label-vertical-dashboard">
								{' '}
								Vertical Token Timeout:
								<input
									type="number"
									name="verticalDashboard"
									className="input input-vertical-dashboard"
									value={this.state.verticalDashboard}
									autoComplete={'false'}
									onChange={this.handleChange}
								/>
							</label>
						</Col>
					</Form.Row>
					<Form.Row>
						<Col>
							<label className="common1 label-default-setup">
								Default Setup Minutes:
								<input
									type="number"
									name="defaultMinutes"
									className="input input-default-setup"
									value={this.state.defaultMinutes}
									autoComplete={'false'}
									onChange={this.handleChange}
								/>
							</label>
						</Col>
						<Col>
							<label className="common1 label-site-code">
								Site Identifier:
								<input
									type="text"
									name="siteCode"
									className="input input-site-code"
									value={this.state.siteCode}
									autoComplete={'false'}
									onChange={this.handleChange}
								/>
							</label>
						</Col>
					</Form.Row>
					<div>
						<button onClick={(e) => this.updateParams(e)} className="button-edit-2">
							Confirm
						</button>
						<button className="button-edit-2 fix">
							Cancel
						</button>
					</div>
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
		actions: bindActionCreators(CommonActions, dispatch),
	};
};

export default connect(null, mapDispatch)(CommonParams);
