import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as DisplayActions from '../../../redux/actions/displayActions';
import Table from 'react-bootstrap/Table';
import Filter from '../../CustomComponents/filter';
import DisplayModal from './displayModal';
import FontAwesome from 'react-fontawesome';

class Display extends Component {
	constructor(props) {
		super(props);
		this.state = {
			DisplayData: [],
			statusFilter: 'Active',
			display: {},
			action: '',
			showDisplayModal: false
		};
	}

	componentDidMount() {
		this.loadData();
	}

	loadData = () => {
		const { actions } = this.props;
		const { statusFilter } = this.state;

		const params = {
			site_id: this.props.user.site,
			status: statusFilter
		}

		return actions.getDisplayFilter(params).then((response) => {
			this.setState({
				DisplayData: response,
			});
		});
	};

	applyFilter = (statusFilter) => {
		this.setState({ statusFilter }, () => {
			this.loadData();
		})
	}

	showDisplayModal = (display, action) => {
		this.setState({
			display,
			action,
			showDisplayModal: true
		})
	}

	closeDisplayModal = () => {
		this.setState({
			display: {},
			action: '',
			showDisplayModal: false
		})
	}

	render() {
		const t = this.props.t;
		return (
			<div>
				<Filter
					className="filter-user"
					buttonName={'+ ' + t('Asset Display')}
					role={false}
					newClass={false}
					level={false}
					automatedLevel={false}
					category={false}
					type={false}
					shifts={false}
					onClick={() => this.showDisplayModal({}, 'Create')}
					onClickFilter={this.applyFilter}
					view={'Display'}
					t={t}
				/>
				<DisplayModal
					user={this.props.user}
					isOpen={this.state.showDisplayModal}
					display={this.state.display}
					action={this.state.action}
					Refresh={this.loadData}
					handleClose={this.closeDisplayModal}
					t={t}
				/>
				<Table responsive="sm" bordered={true}>
					<thead>
						<tr>
							<th>{t('Name')}</th>
							<th>{t('Asset')}</th>
							<th>{t('Status')}</th>
							<th>{t('Actions')}</th>
						</tr>
					</thead>
					<tbody>
						{this.state.DisplayData.map((display, index) => (
							<tr key={index}>
								<td>{display.displaysystem_name}</td>
								<td>{display.asset_code}</td>
								<td>{display.status}</td>
								<td>
									<FontAwesome name='edit fa-2x' onClick={() => this.showDisplayModal(display, 'Update')} />
									<FontAwesome name='copy fa-2x' onClick={() => this.showDisplayModal(display, 'Copy')} />
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
		actions: bindActionCreators(DisplayActions, dispatch),
	};
};

export default connect(null, mapDispatch)(Display);
