import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { genericRequest } from '../../../Utils/Requests';
import { API } from '../../../Utils/Constants';
import * as BreakActions from '../../../redux/actions/breakActions';
import { Form, Row, Col } from 'react-bootstrap';
import ConfigurationTabGeneric from '../../Common/ConfigurationTabGeneric';
import moment from 'moment';
import _ from 'lodash';

export class Step4 extends Component {
	constructor(props) {
		super(props);
		this.state = {
			BreakData: [],
			completeListTabs: [],
			availableListTabs: [],
			selectedListTabs: []
		};
	}

	componentDidMount() {
		const { actions } = this.props;

		const params = {
			site_id: this.props.user.site,
			status: 'Active'
		};

		return actions.getBreakFilter(params).then((response) => {
			const BreakData = response;
			const availableListTabs = _.map(BreakData, breakObject => {
				breakObject.id = breakObject.unavailable_code + breakObject.unavailable_name + '(' + breakObject.start_time + '-' + breakObject.end_time + ')';
				breakObject.content = breakObject.unavailable_name + ' (' + breakObject.start_time + ' - ' + breakObject.end_time + ')';
				return breakObject;
			})
			this.setState({
				BreakData,
				availableListTabs,
				completeListTabs: availableListTabs
			});
		});
	}

	updateTabsImported = (availableListTabs, selectedListTabs) => {
		this.setState({ availableListTabs, selectedListTabs });
	}

	importAllTabs = () => {
		this.updateTabsImported([], this.state.completeListTabs);
	};

	resetTabs = () => {
		this.updateTabsImported(this.state.completeListTabs, []);
	}

	assingBreaks = (e) => {
		e.preventDefault();
		const { selectedListTabs } = this.state;

		const newArray = _.map(selectedListTabs, (item) => {
			item.asset_code = this.props.asset_code;
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
								genericTitle='Breaks'
							/>
						</Col>
					</Form.Group>
					<button className="button-next" onClick={(e) => this.assingBreaks(e)}>{t('End Steps') + '>>'}</button>
					<button className="button-back" onClick={(e) => this.props.back(e)}>{'<<' + t('Previous Step')}</button>
				</Form>
			</div >
		);
	}
}
export const mapDispatch = (dispatch) => {
	return {
		actions: bindActionCreators(BreakActions, dispatch),
	};
};

export default connect(null, mapDispatch)(Step4);
