import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UserActions from '../../../redux/actions/userActions';
import { API } from '../../../Utils/Constants';
import { genericRequest } from '../../../Utils/Requests';
import { Modal, Button } from 'react-bootstrap';
import '../../../sass/SystemAdmin.scss';

class AddWorkcell extends Component {
	constructor(props) {
		super(props);
		this.state = {
			name: '',
			description: '',
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

	handleClose = () => {
		this.setState({ showForm: false });
	};

	closeModalError = () => {
		this.setState({ modalError: false });
	};

	closeSuccessModal = () => {
		this.setState({ show: false });
	};

	createWorkcell = (e) => {
		e.preventDefault();
		const { name, description } = this.state;

		if (name !== '' && description !== '') {
			genericRequest('put', API, '/insert_workcell', null, null, {
				workcell_name: name,
				workcell_description: description,
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

	render() {
		return (
			<div>
				<Modal show={this.state.showForm} onHide={this.handleClose}>
					<Modal.Header closeButton>
						<Modal.Title>Add Workcell</Modal.Title>
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
								Description:
								<textarea
									className="text-workcell-description"
									name="description"
									onChange={this.handleChange}
								></textarea>
							</label>
						</form>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="Primary" onClick={(e) => this.createWorkcell(e)}>
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
					<Modal.Body>Workcell has been added</Modal.Body>
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
		actions: bindActionCreators(UserActions, dispatch),
	};
};

export default connect(null, mapDispatch)(AddWorkcell);
