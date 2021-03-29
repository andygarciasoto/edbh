import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as CommonActions from '../../../redux/actions/commonActions';
import Axios from 'axios';
import { API } from '../../../Utils/Constants';
import { Form, Col } from 'react-bootstrap';
import { timezones } from '../../../Utils/timezones';

class CommonParams extends Component {
	constructor(props) {
		super(props);
		this.state = {
			commonData: {},
		};
	}

	componentDidMount() {
		const { actions } = this.props;

		return actions.getParams(this.props.user.site).then((response) => {
			this.setState({
				commonData: response,
			});
		});
	}

	renderTimezones(timezones, index) {
		return (
			<option value={timezones.offset} key={index}>
				{timezones.name}
			</option>
		);
	}
	render() {
		const { commonData } = this.state;
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
									type="text"
									name="defaultRouted"
									className="input"
									value={commonData.default_routed_cycle_time}
									autoComplete={'false'}
									//onChange={this.handleChange}
								/>
							</label>
						</Col>
						<Col>
							<label className="common1">
								{' '}
								Default Lunch Allowed:
								<input
									type="text"
									name="defaultLunch"
									className="input"
									value={commonData.lunch_minutes}
									autoComplete={'false'}
									//onChange={this.handleChange}
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
									type="text"
									name="productionOffset"
									className="input"
									value={commonData.production_day_offset_minutes}
									autoComplete={'false'}
									//onChange={this.handleChange}
								/>
							</label>
						</Col>
						<label className="common1 label-language">
							{' '}
							Default Language:
							<select
								className="input select-language"
								name="language"
								//onChange={this.handleChange}
                value={commonData.language}

							>
								<option value="1:00">1:00</option>
							</select>
						</label>
						<Col>
							<label className="common1 label-default-break">
								{' '}
								Default Break Allowed:
								<input
									type="text"
									name="defaultBreak"
									className="input"
                  value={commonData.break_minutes}
									autoComplete={'false'}
									//onChange={this.handleChange}
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
									name="timezone"
                  value={commonData.ui_timezone}

									//onChange={this.handleChange}
								>
									{timezones.map(this.renderTimezones)}
								</select>
							</label>
						</Col>
						<Col>
							<label className="common1  label-ito">
								{' '}
								Dashboard Token Timeout:
								<input
									type="text"
									name="inactiveTimeout"
									className="input inactive-timeout"
                  value={commonData.ui_timezone}
									autoComplete={'false'}
									//onChange={this.handleChange}
								/>
							</label>
						</Col>
						<Col>
							<label className="common1  label-ito">
								{' '}
								Assembly URL:
								<input
									type="text"
									name="inactiveTimeout"
									className="input assembly-url"
                  value={commonData.assembly_url}
									autoComplete={'false'}
									//onChange={this.handleChange}
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
									type="text"
									name="defaultPercent"
									className="input default-target"
                  value={commonData.default_target_percent_of_ideal}
									autoComplete={'false'}
									//onChange={this.handleChange}
								/>
							</label>
						</Col>
						<Col>
							<label className="common1 label-vertical-dashboard">
								{' '}
								Vertical Token Timeout:
								<input
									type="text"
									name="verticalDashboard"
									className="input input-vertical-dashboard"
                  value={commonData.ui_timezone}
									autoComplete={'false'}
									//onChange={this.handleChange}
								/>
							</label>
						</Col>
					</Form.Row>
					<Form.Row>
						<Col>
							<label className="common1 label-default-setup">
								{' '}
								Default Setup Minutes:
								<input
									type="text"
									name="defaultMinutes"
									className="input input-default-setup"
                  value={commonData.default_setup_minutes}
									autoComplete={'false'}
									//onChange={this.handleChange}
								/>
							</label>
						</Col>
						<Col>
							<label className="common1 label-site-code">
								{' '}
								Site Code:
								<input
									type="text"
									name="siteCode"
									className="input input-site-code"
                  value={commonData.site_code}
									autoComplete={'false'}
									//onChange={this.handleChange}
								/>
							</label>
						</Col>
					</Form.Row>
				</Form>
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
