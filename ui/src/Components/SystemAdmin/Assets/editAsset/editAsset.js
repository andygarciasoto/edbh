import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UserActions from '../../../../redux/actions/userActions';
import { Modal, Button } from 'react-bootstrap';
import '../../../../sass/SystemAdmin.scss';
import Step1 from './step1';
import Step2 from './step2';
import Step3 from './step3';
import Step4 from './step4';

class AddAsset extends Component {
	constructor(props) {
		super(props);
		this.state = {
			step1: true,
			step2: false,
			step3: false,
			step4: false,
			showForm: true,
			showFooter: false,
			showConfirm: true,
			asset_code: '',
		};
	}

	assetSteps = (step, e) => {
		e.preventDefault();
		switch (step) {
			case 1:
				this.setState({
					step1: true,
					step2: false,
					step3: false,
					step4: false,
				});
				break;
			case 2:
				this.setState({
					step1: false,
					step2: true,
					step3: false,
					step4: false,
				});
				break;
			case 3:
				this.setState({
					step1: false,
					step2: false,
					step3: true,
					step4: false,
				});
				break;
			case 4:
				this.setState({
					step1: false,
					step2: false,
					step3: false,
					step4: true,
				});
				break;
			default:
				break;
		}
	};

	hideSteps = (showFooter, showConfirm) => {
		this.setState({
			showFooter,
			showConfirm,
		});
	};

	getAsset_code = (asset_code) => {
		this.setState({
			asset_code,
		});
	};

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

	render() {
		return (
			<div>
				<Modal
					show={this.state.showForm}
					onHide={this.handleClose}
					contentClassName={
						this.state.step3 === true
							? 'modal-reason reasons'
							: this.state.step4 === true
							? 'modal-reason reasons'
							: 'modal-reason'
					}
				>
					<Modal.Header closeButton>
						<Modal.Title>Edit Asset</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						{this.state.step1 === true && (
							<Step1
								nextStep={(e) => this.assetSteps(2, e)}
								user={this.props.user}
								showFooter={this.hideSteps}
								getCode={this.getAsset_code}
								asset_id={this.props.asset_id}
								levelSite={this.state.showFooter}
							/>
						)}
						{this.state.step2 === true && (
							<Step2
								nextStep={(e) => this.assetSteps(3, e)}
								back={(e) => this.assetSteps(1, e)}
								user={this.props.user}
								asset_code={this.state.asset_code}
							/>
						)}
						{this.state.step3 === true && (
							<Step3
								user={this.props.user}
								nextStep={(e) => this.assetSteps(4, e)}
								back={(e) => this.assetSteps(2, e)}
								asset_code={this.state.asset_code}
							/>
						)}
						{this.state.step4 === true && (
							<Step4
								user={this.props.user}
								back={(e) => this.assetSteps(3, e)}
								asset_code={this.state.asset_code}
							/>
						)}
					</Modal.Body>
					{this.state.showFooter === true && (
						<Modal.Footer>
							<div className="step-bar">
								<div className={this.state.step1 === true ? 'step1 active' : 'step1'}>
									<p className="step-number">1</p>
									<p className="step-name">Step 1</p>
									<p className="step-description">Define Asset</p>
									<i className="arrow right step-1"></i>
								</div>
								<div className={this.state.step2 === true ? 'step2 active' : 'step2'}>
									<p className="step-number-2">2</p>
									<p className="step-name-2">Step 2</p>
									<p className="step-description-2">Define Tag</p>
									<i className="arrow right step-2"></i>
								</div>
								<div className={this.state.step3 === true ? 'step3 active' : 'step3'}>
									<p className="step-number-3">3</p>
									<p className="step-name-3">Step 3</p>
									<p className="step-description-3">Define Reason</p>
									<i className="arrow right step-3"></i>
								</div>
								<div className={this.state.step4 === true ? 'step4 active' : 'step4'}>
									<p className="step-number-4">4</p>
									<p className="step-name-4">Step 4</p>
									<p className="step-description-4">Define Break</p>
									<i className="arrow right step-4"></i>
								</div>
							</div>
						</Modal.Footer>
					)}
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

export default connect(null, mapDispatch)(AddAsset);
