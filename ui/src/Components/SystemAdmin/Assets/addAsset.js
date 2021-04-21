//import Axios from "axios";
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UserActions from '../../../redux/actions/userActions';
import { Modal, Container, Row, Col } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import '../../../sass/SystemAdmin.scss';
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
			showFooter: true,
			showConfirm: false,
			asset_code: ''
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
		const t = this.props.t;
		return (
			<div>
				<Modal
					show={this.state.showForm}
					onHide={this.handleClose}
					className='asset-modal'
					centered
				>
					<Modal.Header closeButton>
						<Modal.Title>{t('Add Asset')}</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						{this.state.step1 === true && (
							<Step1
								nextStep={(e) => this.assetSteps(2, e)}
								user={this.props.user}
								showFooter={this.hideSteps}
								getCode={this.getAsset_code}
								levelSite={this.state.showFooter}
								closeModal={this.handleClose}
								t={t}
							/>
						)}
						{this.state.step2 === true && (
							<Step2
								nextStep={(e) => this.assetSteps(3, e)}
								back={(e) => this.assetSteps(1, e)}
								user={this.props.user}
								asset_code={this.state.asset_code}
								t={t}
							/>
						)}
						{this.state.step3 === true && (
							<Step3
								user={this.props.user}
								nextStep={(e) => this.assetSteps(4, e)}
								back={(e) => this.assetSteps(2, e)}
								asset_code={this.state.asset_code}
								t={t}
							/>
						)}
						{this.state.step4 === true && (
							<Step4
								user={this.props.user}
								back={(e) => this.assetSteps(3, e)}
								asset_code={this.state.asset_code}
								t={t}
							/>
						)}
					</Modal.Body>
					{this.state.showFooter === true && (
						<Modal.Footer>
							<Container>
								<Row className='barStepsAsset'>
									<Col md={3} className={this.state.step1 ? 'active' : ''}>
										<Row>
											<Col md={1}>
												<p className='numberPart'>1</p>
											</Col>
											<Col md={7}>
												<p>{t('Step')} 1</p>
												<p>{t('Define Asset')}</p>
											</Col>
											<Col md={2}>
												<FontAwesome name="chevron-right fa-3x" />
											</Col>
										</Row>
									</Col>
									<Col md={3} className={this.state.step2 ? 'active' : ''}>
										<Row>
											<Col md={1}>
												<p className='numberPart'>2</p>
											</Col>
											<Col md={7}>
												<p>{t('Step')} 2</p>
												<p>{t('Define Tag')}</p>
											</Col>
											<Col md={2}>
												<FontAwesome name="chevron-right fa-3x" />
											</Col>
										</Row>
									</Col>
									<Col md={3} className={this.state.step3 ? 'active' : ''}>
										<Row>
											<Col md={1}>
												<p className='numberPart'>3</p>
											</Col>
											<Col md={7}>
												<p>{t('Step')} 3</p>
												<p>{t('Assign Reason')}</p>
											</Col>
											<Col md={2}>
												<FontAwesome name="chevron-right fa-3x" />
											</Col>
										</Row>
									</Col>
									<Col md={3} className={this.state.step4 ? 'active' : ''}>
										<Row>
											<Col md={1}>
												<p className='numberPart'>4</p>
											</Col>
											<Col md={7}>
												<p>{t('Step')} 4</p>
												<p>{t('Assign Break')}</p>
											</Col>
											<Col md={2}>
												<FontAwesome name="chevron-right fa-3x" />
											</Col>
										</Row>
									</Col>
								</Row>
							</Container>
						</Modal.Footer>
					)}
				</Modal>
			</div >
		);
	}
}

export const mapDispatch = (dispatch) => {
	return {
		actions: bindActionCreators(UserActions, dispatch),
	};
};

export default connect(null, mapDispatch)(AddAsset);
