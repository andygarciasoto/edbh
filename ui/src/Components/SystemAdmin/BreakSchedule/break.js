import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as BreakActions from '../../../redux/actions/breakActions';
import Table from 'react-bootstrap/Table';
import Filter from '../../CustomComponents/filter';
import AddBreak from './breakForm';
import EditIcon from "../../../resources/u668.svg";

class Break extends Component {
	constructor(props) {
		super(props);
		this.state = {
			BreakData: [],
			shifts: [],
			showBreakForm: false,
			action: '',
			unavailable: {},
			statusFilter: 'Active',
			shiftsFilter: 'All'
		};
	}

	componentDidMount() {
		this.loadData();
	}

	loadData = () => {
		const { actions } = this.props;
		const { statusFilter, shiftsFilter } = this.state;

		const params = {
			site_id: this.props.user.site,
			status: statusFilter,
			shift_id: shiftsFilter
		};

		const params1 = {
			site_id: this.props.user.site
		};

		Promise.all([
			actions.getBreakFilter(params),
			actions.getShiftsFilter(params1)
		]).then((responses) => {
			this.setState({
				BreakData: responses[0],
				shifts: responses[1]
			});
		});
	}

	openBreakModal = (action, unavailable) => {
		this.setState({
			showBreakForm: true,
			action,
			unavailable
		});
	};

	closeBreakModal = () => {
		this.setState({
			showBreakForm: false,
			action: '',
			unavailable: {}
		});
	};

	applyFilter = (statusFilter, shiftsFilter) => {
		this.setState({ statusFilter, shiftsFilter }, () => {
			this.loadData();
		})
	}

	render() {
		const t = this.props.t;
		return (
			<div>
				<Filter
					className="filter-user"
					buttonName={'+ ' + t('Break')}
					buttonFilter={t('Search')}
					shiftsOptions={this.state.shifts}
					shifts={false}
					onClick={() => this.openBreakModal('create')}
					onClickFilter={this.applyFilter}
					view={'Break'}
					t={t}
				/>
				<AddBreak
					t={t}
					user={this.props.user}
					isOpen={this.state.showBreakForm}
					action={this.state.action}
					unavailable={this.state.unavailable}
					Refresh={this.loadData}
					onRequestClose={this.closeBreakModal}
				/>
				<Table responsive="sm" bordered={true}>
					<thead>
						<tr>
							<th>{t('Name')}</th>
							<th>{t('Description')}</th>
							<th>{t('Start Time')}</th>
							<th>{t('End Time')}</th>
							<th>{t('Duration (minutes)')}</th>
							<th>{t('Asset Count')}</th>
							<th>{t('Status')}</th>
							<th>{t('Actions')}</th>
						</tr>
					</thead>
					<tbody>
						{this.state.BreakData.map((unavailable, index) => (
							<tr key={index}>
								<td>{unavailable.unavailable_name}</td>
								<td>{unavailable.unavailable_description}</td>
								<td>{unavailable.start_time}</td>
								<td>{unavailable.end_time}</td>
								<td>{unavailable.duration_in_minutes}</td>
								<td>{unavailable.asset_count}</td>
								<td>{unavailable.status}</td>
								<td>
									<img
										src={EditIcon}
										alt={`edit-icon`}
										className="icon"
										onClick={() => this.openBreakModal('update', unavailable)}
									/>
								</td>
							</tr>
						))}
					</tbody>
				</Table>
			</div>
		);
	}
}

export const mapDispatch = (dispatch) => {
	return {
		actions: bindActionCreators(BreakActions, dispatch),
	};
};

export default connect(null, mapDispatch)(Break);
