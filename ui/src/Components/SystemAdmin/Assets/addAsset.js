//import Axios from "axios";
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UserActions from '../../../redux/actions/userActions';
//import { API } from "../../../Utils/Constants";
import { Modal, Button } from 'react-bootstrap';
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

	//   componentDidMount() {
	//     const { actions } = this.props;

	//     return Promise.all([
	//       actions.getRoles(),
	//       actions.getEscalation(),
	//       actions.getSites(),
	//     ]).then((response) => {
	//       this.setState({
	//         roles: response[0],
	//         escalation: response[1],
	//         sites: response[2],
	//       });
	//     });
	//   }

	handleChange = (event) => {
		const target = event.target;
		const value = target.value;
		const name = target.name;

		this.setState({
			[name]: value,
		});
	};

	//   createUser = (e) => {
	//     e.preventDefault();
	//     const {
	//       badge,
	//       username,
	//       firstname,
	//       lastname,
	//       role,
	//       status,
	//       escalation_id,
	//       site,
	//     } = this.state;

	//     var url = `${API}/insert_user`;
	//     if (
	//       badge !== "" &&
	//       username !== "" &&
	//       firstname !== "" &&
	//       lastname !== ""
	//     ) {
	//       Axios.put(url, {
	//         badge: badge,
	//         username: username,
	//         first_name: firstname,
	//         last_name: lastname,
	//         role_id: role,
	//         site_id: this.props.user.site,
	//         escalation_id: parseInt(escalation_id, 10),
	//         site: site,
	//         status: status,
	//       }).then(
	//         () => {
	//           this.setState({
	//             show: true,
	//           });
	//         },
	//         (error) => {
	//           console.log(error);
	//         }
	//       );
	//     } else {
	//       this.setState({
	//         modalError: true,
	//       });
	//     }
	//   };

	//   renderRoles(roles, index) {
	//     return (
	//       <option value={roles.role_id} key={index}>
	//         {roles.name}
	//       </option>
	//     );
	//   }

	//   renderEscalation(escalation, index) {
	//     return (
	//       <option value={escalation.escalation_id} key={index}>
	//         {escalation.escalation_name}
	//       </option>
	//     );
	//   }

	//   renderSites(sites, index) {
	//     return (
	//       <option value={sites.asset_id} key={index}>
	//         {sites.asset_name}
	//       </option>
	//     );
	//   }

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
						<Modal.Title>Add Asset</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						{this.state.step1 === true && <Step1 nextStep={(e) => this.assetSteps(2, e)} user={this.props.user}/>}
						{this.state.step2 === true && (
							<Step2 nextStep={(e) => this.assetSteps(3, e)} back={(e) => this.assetSteps(1, e)} user={this.props.user}/>
						)}
						{this.state.step3 === true && (
							<Step3
								user={this.props.user}
								nextStep={(e) => this.assetSteps(4, e)}
								back={(e) => this.assetSteps(2, e)}
							/>
						)}
						{this.state.step4 === true && (
							<Step4 user={this.props.user} back={(e) => this.assetSteps(3, e)} />
						)}
					</Modal.Body>
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
						<Button variant="Primary" onClick={(e) => this.createUser(e)}>
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
					<Modal.Body>Asset has been added</Modal.Body>
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
		actions: bindActionCreators(UserActions, dispatch),
	};
};

export default connect(null, mapDispatch)(AddAsset);
