import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as WorkcellActions from '../../../redux/actions/workcellActions';
import Table from 'react-bootstrap/Table';
import Filter from '../../CustomComponents/filter';
import AddWorkcell from './addWorkcell';
import EditWorkcell from './editWorkcell';
import EditIcon from '../../../resources/u668.svg';

class Workcells extends Component {
	constructor(props) {
		super(props);
		this.state = {
			WorkcellData: [],
			addWorkcell: false,
			editWorkcell: false,
			workcell_id: 0,
		};
	}

	componentDidMount() {
		this.loadData();
	}

	loadData = () => {
		const { actions } = this.props;

		return actions.getWorkcells(this.props.user.site).then((response) => {
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

	closeEditShift = () => {
		this.setState({
			editWorkcell: false,
		});
	};

	render() {
		const t = this.props.t;
		return (
			<div>
				<Filter
					className="filter-user"
					buttonName={'+ Workcell'}
					buttonFilter={'Search'}
					role={false}
					newClass={false}
					level={false}
					automatedLevel={false}
					category={false}
					type={false}
					shifts={false}
					onClick={() => this.showAddWorkcell()}
					t={t}
				></Filter>
				{this.state.addWorkcell === true && (
					<AddWorkcell
						t={t}
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
				<Table responsive="sm" bordered={true}>
					<thead>
						<tr>
							<th>Name</th>
							<th>Description</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{this.state.WorkcellData.map((workcell, index) => (
							<tr key={index}>
								<td>{workcell.workcell_name}</td>
								<td>{workcell.workcell_description}</td>
								<td>
									<img
										src={EditIcon}
										alt={`edit-icon`}
										className="icon"
										onClick={() => this.showEditShift(workcell.workcell_id)}
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
		actions: bindActionCreators(WorkcellActions, dispatch),
	};
};

export default connect(null, mapDispatch)(Workcells);
