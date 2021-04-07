import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UOMActions from '../../../redux/actions/uomActions';
import Table from 'react-bootstrap/Table';
import AddUOM from './addUOM';
import EditUOM from './editUOM';
import Filter from '../../CustomComponents/filter';
import EditIcon from '../../../resources/u668.svg';

class UOM extends Component {
	constructor(props) {
		super(props);
		this.state = {
			UOMData: [],
			addUOM: false,
			editUOM: false,
			uom_id: 0,
		};
	}

	componentDidMount() {
		this.loadData();
	}

	loadData = () => {
		const { actions } = this.props;

		return actions.getUOM(this.props.user.site).then((response) => {
			this.setState({
				UOMData: response,
			});
		});
	};

	showAddUOM = () => {
		this.setState({
			addUOM: true,
		});
	};

	closeAddUOM = () => {
		this.setState({
			addUOM: false,
		});
	};

	showEditUOM = (uom_id) => {
		this.setState({
			editShift: true,
			uom_id: uom_id,
		});
	};

	closeEditUOM = () => {
		this.setState({
			editShift: false,
		});
	};

	render() {
		const t = this.props.t;
		return (
			<div>
				<Filter
					className="filter-user"
					buttonName={'+ UOM'}
					buttonFilter={'Search'}
					role={false}
					newClass={false}
					level={false}
					automatedLevel={false}
					category={false}
					type={false}
					onClick={() => this.showAddUOM()}
					t={t}
				></Filter>
				{this.state.addUOM === true && (
					<AddUOM
						user={this.props.user}
						Refresh={this.loadData}
						showForm={this.state.addUOM}
						closeForm={this.closeAddUOM}
						t={t}
					/>
				)}
				{this.state.editUOM === true && (
					<EditUOM
						user={this.props.user}
						showForm={this.state.editUOM}
						closeForm={this.closeEditUOM}
						shift_id={this.state.uom_id}
						Refresh={this.loadData}
						t={t}
					/>
				)}
				<Table responsive="sm" bordered={true}>
					<thead>
						<tr>
							<th>Code</th>
							<th>Name</th>
							<th>Description</th>
							<th>Decimals</th>
							<th>Status</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{this.state.UOMData.map((uom, index) => (
							<tr key={index}>
								<td>{uom.UOM_code}</td>
								<td>{uom.UOM_name}</td>
								<td>{uom.UOM_description}</td>
								<td>{uom.decimals === true ? 'Yes' : 'No'}</td>
								<td>{uom.status}</td>
								<td>
									<img
										src={EditIcon}
										alt={`edit-icon`}
										className="icon"
										onClick={() => this.showEditShift(uom.UOM_id)}
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
		actions: bindActionCreators(UOMActions, dispatch),
	};
};

export default connect(null, mapDispatch)(UOM);
