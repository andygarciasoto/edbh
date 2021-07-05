import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as WorkcellActions from '../../../redux/actions/workcellActions';
import Table from 'react-bootstrap/Table';
import Filter from '../../CustomComponents/filter';
import WorkcellModal from './workcellModal';
import FontAwesome from 'react-fontawesome';


class Workcells extends Component {
	constructor(props) {
		super(props);
		this.state = {
			WorkcellData: [],
			statusFilter: 'Active',
			workcell: {},
			action: '',
			showWorkcellModal: false
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

		return actions.getWorkcellsFilter(params).then((response) => {
			this.setState({
				WorkcellData: response,
			});
		});
	};

	applyFilter = (statusFilter) => {
		this.setState({ statusFilter }, () => {
			this.loadData();
		})
	}

	showWorkcellModal = (workcell, action) => {
		this.setState({
			workcell,
			action,
			showWorkcellModal: true
		})
	}

	closeWorkcellModal = () => {
		this.setState({
			workcell: {},
			action: '',
			showWorkcellModal: false
		})
	}

	render() {
		const t = this.props.t;
		return (
			<div>
				<Filter
					className="filter-user"
					buttonName={'+ ' + t('Workcell')}
					role={false}
					newClass={false}
					level={false}
					automatedLevel={false}
					category={false}
					type={false}
					shifts={false}
					onClick={() => this.showWorkcellModal({}, 'Create')}
					onClickFilter={this.applyFilter}
					view={'Workcell'}
					t={t}
				/>
				<WorkcellModal
					user={this.props.user}
					isOpen={this.state.showWorkcellModal}
					workcell={this.state.workcell}
					action={this.state.action}
					Refresh={this.loadData}
					handleClose={this.closeWorkcellModal}
					t={t}
				/>
				<Table responsive="sm" bordered={true}>
					<thead>
						<tr>
							<th>{t('Name')}</th>
							<th>{t('Description')}</th>
							<th>{t('Status')}</th>
							<th>{t('Actions')}</th>
						</tr>
					</thead>
					<tbody>
						{this.state.WorkcellData.map((workcell, index) => (
							<tr key={index}>
								<td>{workcell.workcell_name}</td>
								<td>{workcell.workcell_description}</td>
								<td>{workcell.status}</td>
								<td>
									<FontAwesome name='edit fa-2x' onClick={() => this.showWorkcellModal(workcell, 'Update')} />
									<FontAwesome name='copy fa-2x' onClick={() => this.showWorkcellModal(workcell, 'Copy')} />
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
		actions: bindActionCreators(WorkcellActions, dispatch),
	};
};

export default connect(null, mapDispatch)(Workcells);
