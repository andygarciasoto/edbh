import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as WorkcellActions from '../../../redux/actions/workcellActions';
import Table from 'react-bootstrap/Table';
import Filter from '../../CustomComponents/filter';
import AddWorkcell from './addWorkcell';
import EditWorkcell from './editWorkcell';
import WorkcellModal from './workcellModal';
import FontAwesome from 'react-fontawesome';


class Workcells extends Component {
	constructor(props) {
		super(props);
		this.state = {
			WorkcellData: [],
			addWorkcell: false,
			editWorkcell: false,
			workcell_id: 0,
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

	showAddWorkcell = () => {
		this.setState({
			addWorkcell: true,
		});
	};

	closeAddWorkcell = () => {
		this.setState({
			addWorkcell: false,
		});
	};

	showEditShift = (workcell_id) => {
		this.setState({
			editWorkcell: true,
			workcell_id: workcell_id,
		});
	};

	showWorkcellModal = (workcell, action) => {
		this.setState({
			workcell,
			action,
			showWorkcellModal: true
		})
	}

	closeEditShift = () => {
		this.setState({
			editWorkcell: false,
		});
	};

	applyFilter = (statusFilter) => {
		this.setState({ statusFilter }, () => {
			this.loadData();
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
					onClick={() => this.showAddWorkcell()}
					onClickFilter={this.applyFilter}
					view={'Workcell'}
					t={t}
				></Filter>
				{this.state.addWorkcell === true && (
					<AddWorkcell
						user={this.props.user}
						showForm={this.state.addWorkcell}
						closeForm={this.closeAddWorkcell}
						Refresh={this.loadData}
						t={t}
					/>
				)}
				{this.state.editWorkcell === true && (
					<EditWorkcell
						user={this.props.user}
						showForm={this.state.editWorkcell}
						closeForm={this.closeEditShift}
						workcell_id={this.state.workcell_id}
						Refresh={this.loadData}
						t={t}
					/>
				)}
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
									<FontAwesome name='edit fa-2x' onClick={() => this.showEditShift(workcell.workcell_id)} />
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
