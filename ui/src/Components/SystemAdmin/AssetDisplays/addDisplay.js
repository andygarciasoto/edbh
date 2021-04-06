import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as AssetActions from '../../../redux/actions/assetActions';
import { API } from "../../../Utils/Constants";
import { genericRequest } from '../../../Utils/Requests';
import { Modal, Button } from 'react-bootstrap';
import '../../../sass/SystemAdmin.scss';

class AddDisplay extends Component {
	constructor(props) {
		super(props);
		this.state = {
			AssetsData: [],
			name: '',
			asset: 0,
			status: 'Active',
			show: false,
			showForm: true,
			modalError: false,
		};
	}

	componentDidMount() {
		const { actions } = this.props;

		return actions.getAssets(this.props.user.site).then((response) => {
			this.setState({
				AssetsData: response,
				asset: response[0].asset_id,
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

	createDisplay = (e) => {
		e.preventDefault();
		const { name, asset, status } = this.state;

		if (name !== '') {
      genericRequest('put', API, '/insert_displaysystem', null, null, {
				asset_id: parseInt(asset, 10),
        displaysystem_name: name,
				site_id: this.props.user.site,
        status: status
			}).then(
				() => {
					this.setState({
						show: true,
					});
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

	handleClose = () => {
		this.props.closeForm();
	};

	closeModalError = () => {
		this.setState({ modalError: false });
	};

	render() {
		console.log(this.state);
		return (
			<div>
				<Modal show={this.props.showForm} onHide={this.handleClose}>
					<Modal.Header closeButton>
						<Modal.Title>Add Display</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<form>
							<label>
								Name:
								<input
									className="input-display-name"
									type="text"
									name="name"
									value={this.state.badge}
									autoComplete={'false'}
									onChange={this.handleChange}
								/>
							</label>
							<label>
								Asset:
								<select className="input-display-asset" name="asset" onChange={this.handleChange}>
									{this.state.AssetsData.map(this.renderAssets)}
								</select>
							</label>
							<label>
								Status:
								<select className="select-display-status" name="status" onChange={this.handleChange}>
									<option value="Active">Active</option>
									<option value="Inactive">Inactive</option>
								</select>
							</label>
						</form>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="Primary" onClick={(e) => this.createDisplay(e)}>
							Confirm
						</Button>
						<Button variant="secondary" onClick={this.handleClose}>
							Close
						</Button>
					</Modal.Footer>
				</Modal>
				<Modal show={this.state.show} onHide={this.handleClose}>
					<Modal.Header closeButton>
						<Modal.Title>Sucess</Modal.Title>
					</Modal.Header>
					<Modal.Body>Display has been added</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={this.handleClose}>
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
		actions: bindActionCreators(AssetActions, dispatch),
	};
};

export default connect(null, mapDispatch)(AddDisplay);
