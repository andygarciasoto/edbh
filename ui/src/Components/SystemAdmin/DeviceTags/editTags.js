import Axios from 'axios';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UOMActions from '../../../redux/actions/uomActions';
import { API } from '../../../Utils/Constants';
import { Modal, Button, Form, Col } from 'react-bootstrap';
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
		};
	}

	componentDidMount() {
		const { actions } = this.props;

		return Promise.all([
			actions.getUOM(this.props.user.site),
			actions.getAssets(this.props.user.site),
			actions.getTagById(this.props.user.site, this.props.tag_id),
		]).then((response) => {
			this.setState({
				uomData: response[0],
				sites: response[1],
				asset: response[1][1].asset_id,
				code: response[2][0].UOM_code,
				status: response[2][0].status,
				name: response[2][0].tag_name,
				uom_code: response[2][0].tag_code,
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

		var url = `${API}/insert_tag`;
		if (code !== '' && name !== '' && description !== '') {
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
				modalError: true,
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
		return (
			<div>
				<Modal show={this.state.showForm} onHide={this.handleClose} contentClassName="modal-reason">
					<Modal.Header closeButton>
						<Modal.Title>Update Tag</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<form>
							<Form.Row>
								<Col>
									<label>
										Code:
										<input
											className="input-tag-code"
											type="text"
											name="code"
											value={this.state.code}
											autoComplete={'false'}
											onChange={this.handleChange}
										/>
									</label>
								</Col>
								<Col>
									<label>
										Status:
										<select
											value={this.state.status}
											className="select-display-status uom-status"
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
										Name:
										<input
											className="input-tag-name"
											type="text"
											name="name"
											value={this.state.name}
											autoComplete={'false'}
											onChange={this.handleChange}
										/>
									</label>
								</Col>
								<Col>
									<label className="label-tag-category">
										UOM Code:
										<select
											value={this.state.uom_code}
											className="select-tag-type"
											name="uom_code"
											onChange={this.handleChange}
										>
											{this.state.uomData.map(this.renderUOM)}
										</select>
									</label>
								</Col>
							</Form.Row>
							<Form.Row>
								<Col>
									<label>
										Description:
										<textarea
											className="input-tag-description"
											type="text"
											name="description"
											value={this.state.description}
											autoComplete={'false'}
											onChange={this.handleChange}
										/>
									</label>
								</Col>

								<Col>
									<label className="label-tag-category">
										Rollover Point:
										<input
											className="input-reason-name"
											type="number"
											name="rollover"
											min={999999}
											value={this.state.rollover}
											autoComplete={'false'}
											onChange={this.handleChange}
										/>
									</label>
								</Col>
							</Form.Row>
							<Form.Row>
								<Col>
									<label>
										Data Type:
										<select
											className="select-tag-type"
											name="data_type"
											onChange={this.handleChange}
											value={this.state.datatype}
										>
											<option value="Integer">Integer</option>
											<option value="Float">Decimals</option>
										</select>
									</label>
								</Col>
								<Col>
									<label className="label-tag-category">
										Max Change:
										<input
											className="input-tag-aggregation"
											type="number"
											min={10}
											name="max_change"
											value={this.state.max_change}
											autoComplete={'false'}
											onChange={this.handleChange}
										/>
									</label>
								</Col>
							</Form.Row>
							<Form.Row>
								<Col>
									<label>
										Asset:
										<select
											className="select-display-status uom-status"
											name="asset"
											onChange={this.handleChange}
										>
											{this.state.sites.map(this.renderAssets)}
										</select>
									</label>
								</Col>
							</Form.Row>
						</form>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="Primary" onClick={(e) => this.createTag(e)}>
							Confirm
						</Button>
						<Button variant="secondary" onClick={this.handleClose}>
							Close
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
