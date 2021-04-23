import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { genericRequest } from '../../../../Utils/Requests';
import { API } from '../../../../Utils/Constants';
import * as ReasonActions from '../../../../redux/actions/reasonActions';
import { Form, Row, Col, Button, Modal } from 'react-bootstrap';
import ConfigurationTabGeneric from '../../../Common/ConfigurationTabGeneric';
import _ from 'lodash';

export class Step3 extends Component {
	constructor(props) {
		super(props);
		this.state = {
			asset: props.asset,
			asset2: props.asset2,
			ReasonData: [],
			type: 'Downtime',
			completeListTabs: [],
			associateReasons: [],
			dynamicCompleteList: [],
			availableListTabs: [],
			selectedListTabs: [],
		};
	}

	componentDidMount() {
		this.fetchData();
	}

	fetchData = () => {
		const { actions } = this.props;
		const params = {
			site_id: this.props.user.site,
			status: 'Active'
		};

		const params2 = {
			site_id: this.props.user.site,
			asset_id: this.state.asset.asset_id,
			status: 'Active'
		};

		return Promise.all([
			actions.getReasonByFilter(params),
			actions.getReasonByFilter(params2)
		]).then((response) => {
			const ReasonData = response[0];
			const completeListTabs = _.map(ReasonData, (reason) => {
				reason.asset_count = 0;
				reason.id = reason.dtreason_code + '-' + reason.dtreason_name + '-' + reason.dtreason_description + '-' + reason.dtreason_category + '-' +
					reason.reason1 + '-' + reason.reason2 + '-' + reason.status + '-' + reason.type + '-' + reason.level;
				reason.content = reason.dtreason_code + ' - ' + reason.dtreason_name;
				return reason;
			});

			const associateReasons = _.map(response[1], (reason) => {
				delete reason.COUNT;
				reason.asset_count = 0;
				reason.id = reason.dtreason_code + '-' + reason.dtreason_name + '-' + reason.dtreason_description + '-' + reason.dtreason_category + '-' +
					reason.reason1 + '-' + reason.reason2 + '-' + reason.status + '-' + reason.type + '-' + reason.level;
				reason.content = reason.dtreason_code + ' - ' + reason.dtreason_name;
				return reason;
			});

			const availableListTabs = _.filter(_.differenceWith(completeListTabs, associateReasons, _.isEqual), { type: this.state.type });
			const selectedListTabs = _.filter(associateReasons, { type: this.state.type });

			this.setState({
				ReasonData,
				completeListTabs,
				associateReasons,
				availableListTabs,
				selectedListTabs,
			});
		});
	}

	updateTabsImported = (availableListTabs, selectedListTabs) => {
		this.setState({ availableListTabs, selectedListTabs });
	};

	importAllTabs = () => {
		this.updateTabsImported([], this.state.completeListTabs);
	};

	resetTabs = () => {
		this.updateTabsImported(this.state.completeListTabs, []);
	};

	handleChangeType = (event) => {
		const availableListTabs = _.filter(_.differenceWith(this.state.completeListTabs, this.state.associateReasons, _.isEqual), { type: event.target.value });
		const selectedListTabs = _.filter(this.state.associateReasons, { type: event.target.value });
		this.setState({
			type: event.target.value,
			availableListTabs,
			selectedListTabs
		});
	};

	closeModalMessage = () => {
		this.setState({ modalError: false, show: false });
	};

	assingReasons = (e) => {
		e.preventDefault();
		const { selectedListTabs } = this.state;

		const newArray = _.map(selectedListTabs, (item) => {
			item.asset_code = this.state.asset.asset_code;
			item.site_code = this.props.user.site_code;
			return item;
		});

		if (selectedListTabs !== []) {
			genericRequest('put', API, '/dragndrop', null, null, {
				site_id: this.props.user.site,
				table: 'DTReason',
				data: newArray,
			}).then(
				() => {
					this.setState({
						show: true,
					});
					this.fetchData();
				},
				(error) => {
					this.setState({
						modalError: true
					});
				}
			);
		} else {
			console.log('Selected Array Empty');
		}
	};

	render() {
		const t = this.props.t;
		return (
			<div>
				<Form>
					<Form.Group as={Row}>
						<Form.Label column sm={1}>
							{t('Type')}:
						</Form.Label>
						<Col sm={2}>
							<Form.Control
								as="select"
								name="type"
								onChange={this.handleChangeType}
								value={this.state.type}
							>
								<option value="Downtime">Downtime</option>
								<option value="Scrap">Scrap</option>
							</Form.Control>
						</Col>
					</Form.Group>
					<Form.Group as={Row}>
						<Col sm={12}>
							<ConfigurationTabGeneric
								availableListTabs={this.state.availableListTabs}
								selectedListTabs={this.state.selectedListTabs}
								selectedAction={this.state.selectedAction}
								onUpdateTabsImported={this.updateTabsImported}
								importAllTabs={this.importAllTabs}
								resetTabs={this.resetTabs}
								height={'350px'}
								t={t}
								genericTitle="Reasons"
							/>
						</Col>
					</Form.Group>
					<Form.Group as={Row}>
						<Col sm={4}>
							<Button variant='success' onClick={(e) => this.assingReasons(e)}>
								{t('Apply')}
							</Button>
						</Col>
					</Form.Group>
					<button className="button-next" onClick={(e) => this.props.nextStep(e)}>{t('Next Step') + '>>'}</button>
					<button className='button-back' onClick={(e) => this.props.back(e)}>{'<<' + t('Previous Step')}</button>
				</Form>
				<Modal show={this.state.show} onHide={this.closeModalMessage}>
					<Modal.Header closeButton>
						<Modal.Title>Sucess</Modal.Title>
					</Modal.Header>
					<Modal.Body>Reason has been {this.props.action === 'Create' ? 'created' : (this.props.action === 'Edit' ? 'updated' : 'copied')}</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={this.closeModalMessage}>
							Close
				</Button>
					</Modal.Footer>
				</Modal>
				<Modal show={this.state.modalError} onHide={this.closeModalMessage}>
					<Modal.Header closeButton>
						<Modal.Title>Error</Modal.Title>
					</Modal.Header>
					<Modal.Body>Reason has not been {this.props.action === 'Create' ? 'created' : (this.props.action === 'Edit' ? 'updated' : 'copied')}</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={this.closeModalMessage}>
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
		actions: bindActionCreators(ReasonActions, dispatch),
	};
};

export default connect(null, mapDispatch)(Step3);
