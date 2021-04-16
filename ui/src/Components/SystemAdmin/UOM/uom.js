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
			statusFilter: 'Active'
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

		return actions.getUOMFilter(params).then((response) => {
			this.setState({
				UOMData: response,
			});
		});
	};

	applyFilter = (statusFilter) => {
		this.setState({ statusFilter }, () => {
			this.loadData();
		})
	}

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
			editUOM: true,
			uom_id: uom_id,
		});
	};

	closeEditUOM = () => {
		this.setState({
			editUOM: false,
		});
	};

	render() {
		const t = this.props.t;
		return (
			<div>
				<Filter
					className="filter-user"
					buttonName={'+ ' + t('UOM')}
					role={false}
					newClass={false}
					level={false}
					automatedLevel={false}
					category={false}
					type={false}
					onClick={() => this.showAddUOM()}
					onClickFilter={this.applyFilter}
					view={'UOM'}
					t={t}
				/>
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
						uom_id={this.state.uom_id}
						Refresh={this.loadData}
						t={t}
					/>
				)}
				<Table responsive="sm" bordered={true}>
					<thead>
						<tr>
							<th>{t('Code')}</th>
							<th>{t('Name')}</th>
							<th>{t('Description')}</th>
							<th>{t('Decimals')}</th>
							<th>{t('Status')}</th>
							<th>{t('Actions')}</th>
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
										onClick={() => this.showEditUOM(uom.UOM_id)}
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
