import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as DisplayActions from '../../../redux/actions/displayActions';
//import Axios from "axios";
//import { API } from "../../../Utils/Constants";

import { Form, Col } from 'react-bootstrap';

export class Step1 extends Component {
	constructor(props) {
		super(props);
		this.state = {
			code: '',
			automation_level: 'Automated',
			name: '',
			asset_display: 0,
			description: '',
			workcell: 0,
			level: 'Site',
			site_code: '',
			parent_code: '',
			escalation: true,
			displayData: [],
			workcellData: [],
			parentData: [],
		};
	}

	componentDidMount() {
		this.loadData();
	}

	handleChange = (event) => {
		const target = event.target;
		const value = target.value;
		const name = target.name;

		this.setState({
			[name]: value,
		});
	};

	loadData = () => {
		const { actions } = this.props;

		return Promise.all([
			actions.getDisplay(this.props.user.site),
			actions.getWorkcells(this.props.user.site),
			actions.getAssetsLevel(this.props.user.site),
		]).then((response) => {
			this.setState({
				displayData: response[0],
				asset_display: response[0][0].assetdisplaysystem_id,
				workcellData: response[1],
				workcell: response[1][0].workcell_id,
				parentData: response[2],
				parent_code: response[2][0].asset_code,
			});
		});
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
		console.log(this.state);
		return (
			<div>
				<form>
					<Form.Row>
						<Col>
							<label>
								Code:
								<input
									className="input-tag-code asset-code"
									type="text"
									name="code"
									autoComplete={'false'}
									onChange={this.handleChange}
								/>
							</label>
						</Col>
						<Col>
							<label className="label-tag-category">
								Automation Level:
								<select
									className="select-tag-category asset-automation"
									name="automation_level"
									onChange={this.handleChange}
								>
									<option value="Automated">Automated</option>
									<option value="Partially_Manual_Scan_Order">Partially_Manual_Scan_Order</option>
									<option value="Manuak">Manual</option>
								</select>
							</label>
						</Col>
					</Form.Row>
					<Form.Row>
						<Col>
							<label>
								Name:
								<input
									className="input-tag-name asset-name"
									type="text"
									name="name"
									autoComplete={'false'}
									onChange={this.handleChange}
								/>
							</label>
						</Col>
						<Col>
							<label className="label-tag-category">
								Asset Display:
								<select
									className="select-tag-type asset-asset"
									name="asset_display"
									onChange={this.handleChange}
								>
									{this.state.displayData.map(this.renderDisplay)}
								</select>
							</label>
						</Col>
					</Form.Row>
					<Form.Row>
						<Col>
							<label>
								Description:
								<textarea
									className="input-tag-description asset-description"
									type="text"
									name="description"
									autoComplete={'false'}
									onChange={this.handleChange}
								/>
							</label>
						</Col>
						<Col>
							<label className="label-tag-category">
								Workcell:
								<select
									className="select-tag-type asset-workcell"
									name="workcell"
									onChange={this.handleChange}
								>
									{this.state.workcellData.map(this.renderWorkcell)}
								</select>
							</label>
						</Col>
					</Form.Row>
					<Form.Row>
						<Col>
							<label>
								Level:
								<select
									className="select-tag-type asset-level"
									name="level"
									onChange={this.handleChange}
								>
									<option value="Site">Site</option>
									<option value="Area">Area</option>
									<option value="Cell">Cell</option>
								</select>
							</label>
						</Col>
						<Col>
							<label className="label-tag-category">
								Site Code:
								<input
									className="input-tag-aggregation asset-site-code"
									type="text"
									name="site_code"
									autoComplete={'false'}
									onChange={this.handleChange}
								/>
							</label>
						</Col>
					</Form.Row>
					<Form.Row>
						<Col>
							<label>
								Parent Code:
								<select
									className="select-tag-type asset-parent"
									disabled={this.state.level === 'Cell' ? false : true}
									name="parent_code"
									onChange={this.handleChange}
								>
									{this.state.parentData.map(this.renderParent)}
								</select>
							</label>
						</Col>
						<Col>
							<label className="label-tag-category">
								Include Escalation:
								<select
									className="input-tag-aggregation asset-escalation"
									name="escalation"
									onChange={this.handleChange}
								>
									<option value={true}>Yes</option>
									<option value={false}>No</option>
								</select>
							</label>
						</Col>
					</Form.Row>
				</form>
				<button className="button-next" onClick={(e) => this.props.nextStep(e)}>
					{'Next Step>>'}
				</button>
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
