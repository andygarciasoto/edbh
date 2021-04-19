import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as DisplayActions from '../../../redux/actions/displayActions';
import { genericRequest } from '../../../Utils/Requests';
import { Modal, Button } from 'react-bootstrap';
import { API } from '../../../Utils/Constants';

import { Form, Col } from 'react-bootstrap';

export class Step1 extends Component {
	constructor(props) {
		super(props);
		this.state = {
			code: '',
			automation_level: 'Automated',
			name: '',
			description: '',
			workcell: 0,
			level: 'Site',
			site_code: '',
			defaultPercent: 0,
			parent_code: '',
			escalation: false,
			status: 'Active',
			multiple: false,
			displayData: [],
			workcellData: [],
			parentData: [],
			show: false,
			modalError: false,
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

		const params = {
			site_id: this.props.user.site,
		};

		return Promise.all([
			actions.getWorkcells(this.props.user.site),
			actions.getAssetsLevel(this.props.user.site),
		]).then((response) => {
			this.setState({
				workcellData: response[0],
				workcell: response[0][0].workcell_id,
				parentData: response[1],
				parent_code: response[1][0].asset_code,
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
			status,
			defaultPercent,
			multiple,
		} = this.state;

		const newPercent = defaultPercent / 100;

		if (name !== '' && code !== '' && description !== '') {
			genericRequest('put', API, '/insert_asset', null, null, {
				site_id: this.props.user.site,
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
			}).then(
				() => {
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
									<option value="Manual">Manual</option>
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
								Status:
								<select
									className="select-tag-type asset-asset"
									name="status"
									onChange={this.handleChange}
								>
									<option value="Active">Active</option>
									<option value="Inactive">Inactive</option>
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
								Target Percent of Ideal:
								<input
									className="input-tag-aggregation asset-site-code"
									type="number"
									name="defaultPercent"
									min={0}
									max={100}
									step={1}
									value={this.state.defaultPercent}
									onChange={this.handleChangePercentage}
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
									<option value={false}>No</option>
									<option value={true}>Yes</option>
								</select>
							</label>
						</Col>
					</Form.Row>
					<Form.Row>
						<Col>
							<label className="label-tag-category">
								Is Multiple:
								<select
									className="input-tag-aggregation asset-escalation"
									name="multiple"
									onChange={this.handleChange}
								>
									<option value={false}>No</option>
									<option value={true}>Yes</option>
								</select>
							</label>
						</Col>
					</Form.Row>
				</form>
				{this.props.levelSite === false ? (
					<div>
						<Button variant="Primary" onClick={(e) => this.createAsset(e)}>
							Confirm
						</Button>
						<Button variant="secondary" onClick={this.props.handleClose}>
							Close
						</Button>{' '}
					</div>
				) : (
					<button className="button-next" onClick={(e) => this.createAsset(e)}>
						{'Next Step>>'}
					</button>
				)}
				<Modal show={this.state.show} onHide={this.closeSuccessModal}>
					<Modal.Header closeButton>
						<Modal.Title>Sucess</Modal.Title>
					</Modal.Header>
					<Modal.Body>Asset has been added</Modal.Body>
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
