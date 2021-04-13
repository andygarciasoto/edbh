import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UserActions from '../../../redux/actions/userActions';
import { API } from '../../../Utils/Constants';
import { genericRequest } from '../../../Utils/Requests';
import { Modal, Button } from 'react-bootstrap';
import '../../../sass/SystemAdmin.scss';

class AddUOM extends Component {
	constructor(props) {
		super(props);
		this.state = {
			name: '',
			description: '',
			decimals: false,
			status: 'Active',
			show: false,
			showForm: true,
			modalError: false,
		};
	}

	handleChange = (event) => {
		const target = event.target;
		const value = target.value;
		const name = target.name;

		this.setState({
			[name]: value,
		});
	};

	createUOM = (e) => {
		e.preventDefault();
		const { name, description, status, decimals } = this.state;

		if (name !== '' && this.props.user.site_prefix !== null) {
			genericRequest('put', API, '/insert_uom', null, null, {
				uom_code: `${this.props.user.site_prefix}-${name}`,
				uom_name: name,
				uom_description: description === '' ? null : description,
				status: status,
				decimals: parseInt(decimals, 10),
				site_id: this.props.user.site,
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
		const t = this.props.t;
		return (
			<div>
				<Modal show={this.state.showForm} onHide={this.handleClose}  centered>
					<Modal.Header closeButton>
						<Modal.Title>{t('Add UOM')}</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<form>
							<label>
								{t('Name')}:
								<input
									type="text"
									name="name"
									className="input-uom-name"
									value={this.state.username}
									autoComplete={'false'}
									onChange={this.handleChange}
								/>
							</label>
							<label>
								{t('Description')}:
								<textarea
									className="text-uom-description"
									name="description"
									onChange={this.handleChange}
								></textarea>
							</label>
							<label>
								{t('Decimals')}:
								<select className="select-uom-decimals" name="decimals" onChange={this.handleChange}>
									<option value={0}>No</option>
									<option value={1}>Yes</option>
								</select>
							</label>
							<label>
								{t('Status')}:
								<select
									className="select-display-status uom-status"
									name="status"
									onChange={this.handleChange}
								>
									<option value="Active">Active</option>
									<option value="Inactive">Inactive</option>
								</select>
							</label>
						</form>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="Primary" onClick={(e) => this.createUOM(e)}>
							{t('Confirm')}
						</Button>
						<Button variant="secondary" onClick={this.handleClose}>
							{t('Close')}
						</Button>
					</Modal.Footer>
				</Modal>
				<Modal show={this.state.show} onHide={this.closeSuccessModal}>
					<Modal.Header closeButton>
						<Modal.Title>Sucess</Modal.Title>
					</Modal.Header>
					<Modal.Body>UOM has been added</Modal.Body>
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
					<Modal.Body>
						{this.props.user.site_prefix === null
							? 'Please add a prefix for your site in the Common Parameters module'
							: 'All inputs must be filled'}
					</Modal.Body>
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
		actions: bindActionCreators(UserActions, dispatch),
	};
};

export default connect(null, mapDispatch)(AddUOM);
