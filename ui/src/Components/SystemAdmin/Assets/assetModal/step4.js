import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { genericRequest } from '../../../../Utils/Requests';
import { API } from '../../../../Utils/Constants';
import * as BreakActions from '../../../../redux/actions/breakActions';
import { Form, Row, Col, Button, Modal } from 'react-bootstrap';
import ConfigurationTabGeneric from '../../../Common/ConfigurationTabGeneric';
import moment from 'moment';
import _ from 'lodash';

export class Step4 extends Component {
	constructor(props) {
		super(props);
		this.state = {
			BreakData: [],
			asset: props.asset,
			asset2: props.asset2,
			completeListTabs: [],
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
			status: 'Active',
		};

		const params1 = {
			site_id: this.props.user.site,
			asset_id: this.state.asset.asset_id,
			status: 'Active'
		};

		return Promise.all([
			actions.getBreakFilter(params),
			actions.getBreakFilter(params1)
		]).then((response) => {
			const BreakData = response[0];
			const completeListTabs = _.map(BreakData, (breakObject) => {
				delete breakObject.asset_count;
				breakObject.id =
					breakObject.unavailable_code + '-' + breakObject.unavailable_name + '-' + breakObject.unavailable_description + '-' + breakObject.start_time + '-' +
					breakObject.end_time + '-' + breakObject.duration_in_minutes + '-' + breakObject.status;
				breakObject.content =
					breakObject.unavailable_name + ' (' + breakObject.start_time + ' - ' + breakObject.end_time + ')';
				return breakObject;
			});

			const selectedListTabs = _.map(response[1], (breakObject) => {
				delete breakObject.asset_count;
				breakObject.id = breakObject.unavailable_code + '-' + breakObject.unavailable_name + '-' + breakObject.unavailable_description + '-' + breakObject.start_time + '-' +
					breakObject.end_time + '-' + breakObject.duration_in_minutes + '-' + breakObject.status;
				breakObject.content =
					breakObject.unavailable_name + ' (' + breakObject.start_time + ' - ' + breakObject.end_time + ')';
				return breakObject;
			});

			const availableListTabs = _.differenceWith(completeListTabs, selectedListTabs, _.isEqual);

			this.setState({
				BreakData,
				completeListTabs,
				availableListTabs,
				selectedListTabs
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

	closeModalMessage = () => {
		this.setState({ modalError: false, show: false });
	};

	assingBreaks = (e) => {
		e.preventDefault();
		const { selectedListTabs } = this.state;

		const newArray = _.map(selectedListTabs, (item) => {
			item.asset_code = this.state.asset.asset_code;
			item.site_code = this.props.user.site_code;
			item.valid_from = moment().tz(this.props.user.timezone);
			item.valid_to = null;
			return item;
		});

		if (selectedListTabs !== []) {
			genericRequest('put', API, '/dragndrop', null, null, {
				site_id: this.props.user.site,
				table: 'Unavailable',
				data: newArray,
			}).then(
				() => {
					this.setState({
						show: true
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
			console.log('selected list is empty');
		}
	};

	render() {
		const t = this.props.t;
		return (
			<div>
				<Form>
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
								genericTitle="Breaks"
							/>
						</Col>
					</Form.Group>
					<Form.Group as={Row}>
						<Col sm={4}>
							<Button variant='success' onClick={(e) => this.assingBreaks(e)}>
								{t('Apply')}
							</Button>
						</Col>
					</Form.Group>
					<button className='button-back' onClick={(e) => this.props.back(e)}>{'<<' + t('Previous Step')}</button>
				</Form>
				<Modal show={this.state.show} onHide={this.closeModalMessage}>
					<Modal.Header closeButton>
						<Modal.Title>Sucess</Modal.Title>
					</Modal.Header>
					<Modal.Body>Break has been {this.props.action === 'Create' ? 'created' : (this.props.action === 'Edit' ? 'updated' : 'copied')}</Modal.Body>
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
					<Modal.Body>Break has not been {this.props.action === 'Create' ? 'created' : (this.props.action === 'Edit' ? 'updated' : 'copied')}</Modal.Body>
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
		actions: bindActionCreators(BreakActions, dispatch),
	};
};

export default connect(null, mapDispatch)(Step4);
