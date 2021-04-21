import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { genericRequest } from '../../../../Utils/Requests';
import { API } from '../../../../Utils/Constants';
import * as ReasonActions from '../../../../redux/actions/reasonActions';
import { Form, Row, Col } from 'react-bootstrap';
import ConfigurationTabGeneric from '../../../Common/ConfigurationTabGeneric';
import _ from 'lodash';

export class Step3 extends Component {
	constructor(props) {
		super(props);
		this.state = {
			ReasonData: [],
			type: 'Downtime',
			completeListTabs: [],
			availableListTabs: [],
			selectedListTabs: [],
		};
	}

	componentDidMount() {
		const { actions } = this.props;
		const params = {
			site_id: this.props.user.site,
			status: 'Active',
		};

		return Promise.all([
			actions.getReasonByFilter(params),
			actions.getReasonsByAsset(this.props.user.site, this.props.asset_id),
		]).then((response) => {
			const ReasonData = response[0];
			const completeListTabs = _.map(ReasonData, (reason) => {
				reason.id = reason.dtreason_code;
				reason.content = reason.dtreason_code + ' - ' + reason.dtreason_name;
				return reason;
			});
			const availableListTabs = _.filter(completeListTabs, { type: this.state.type });

			const selectedListTabs = response[1];
			selectedListTabs.map((reason) => {
				reason.id = reason.dtreason_code;
				reason.content = reason.dtreason_code + ' - ' + reason.dtreason_name;
				return reason;
			});

			this.setState({
				ReasonData,
				availableListTabs,
				completeListTabs,
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
		const availableListTabs = _.differenceWith(
			_.filter(this.state.completeListTabs, { type: event.target.value }),
			this.state.selectedListTabs,
			_.isEqual
		);
		this.setState({
			[event.target.name]: event.target.value,
			availableListTabs,
		});
	};

	assingReasons = (e) => {
		e.preventDefault();
		const { selectedListTabs } = this.state;

		const newArray = _.map(selectedListTabs, (item) => {
			item.asset_code = this.props.asset_code;
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
					this.props.nextStep(e);
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
					<button className="button-next" onClick={(e) => this.assingReasons(e)}>
						{t('Next Step') + '>>'}
					</button>
				</Form>
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
