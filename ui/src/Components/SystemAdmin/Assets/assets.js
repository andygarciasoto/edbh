import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as AssetActions from '../../../redux/actions/assetActions';
import Table from 'react-bootstrap/Table';
import Filter from '../../CustomComponents/filter';
import AddAsset from './addAsset';
import EditAsset from './editAsset/editAsset';
import EditIcon from '../../../resources/u668.svg';

class Assets extends Component {
	constructor(props) {
		super(props);
		this.state = {
			AssetsData: [],
			addAsset: false,
			editAsset: false,
			asset_id: 0,
			statusFilter: 'Active',
			levelFilter: 'Cell',
			autLevelFilter: 'All'
		};
	}

	componentDidMount() {
		this.loadData();
	}

	loadData = () => {
		const { actions } = this.props;
		const { statusFilter, levelFilter, autLevelFilter } = this.state;

		const params = {
			site_id: this.props.user.site,
			status: statusFilter,
			asset_level: levelFilter,
			automation_level: autLevelFilter
		}

		return actions.getAssetsFilter(params).then((response) => {
			this.setState({
				AssetsData: response
			});
		});
	}

	applyFilter = (statusFilter, levelFilter, autLevelFilter) => {
		this.setState({ statusFilter, levelFilter, autLevelFilter }, () => {
			this.loadData();
		})
	}

	showAddAsset = () => {
		this.setState({
			addAsset: true,
		});
	};

	closeAddAsset = () => {
		this.setState({
			addAsset: false,
		});
	};

	showEditAsset = (asset_id) => {
		this.setState({
			editAsset: true,
			asset_id: asset_id,
		});
	};

	closeEditAsset = () => {
		this.setState({
			editAsset: false,
		});
	};

	render() {
		const t = this.props.t;
		return (
			<div>
				<Filter
					className="filter-user"
					buttonName={'+ ' + t('Asset')}
					buttonFilter={'Search'}
					newClass={true}
					level={true}
					automatedLevel={true}
					onClick={() => this.showAddAsset()}
					onClickFilter={this.applyFilter}
					view={'Asset'}
					t={t}
				/>
				{this.state.addAsset === true && (
					<AddAsset
						t={t}
						user={this.props.user}
						showForm={this.state.addAsset}
						closeForm={this.closeAddAsset}
						Refresh={this.loadData}
					/>
				)}
				{this.state.editAsset === true && (
					<EditAsset
						showForm={this.state.editAsset}
						closeForm={this.closeEditAsset}
						asset_id={this.state.asset_id}
						t={t}
						Refresh={this.loadData}
						user={this.props.user}
					/>
				)}
				<Table responsive="sm" bordered={true}>
					<thead>
						<tr>
							<th>{t('Code')}</th>
							<th>{t('Name')}</th>
							<th>{t('Description')}</th>
							<th>{t('Level')}</th>
							<th>{t('Parent Code')}</th>
							<th>{t('Automation Level')}</th>
							<th>{t('Target Percent of Ideal')}</th>
							<th>{t('Include in Escalation')}</th>
							<th>{t('Workcell')}</th>
							<th>{t('Value Stream')}</th>
							<th>{t('Is Multiple')}</th>
							<th>{t('Is Dynamic')}</th>
							<th>{t('Status')}</th>
							<th>{t('Actions')}</th>
						</tr>
					</thead>
					<tbody>
						{this.state.AssetsData.map((asset, index) => (
							<tr key={index}>
								<td>{asset.asset_code}</td>
								<td>{asset.asset_name}</td>
								<td>{asset.asset_description}</td>
								<td>{asset.asset_level}</td>
								<td>{asset.parent_asset_code}</td>
								<td>{asset.automation_level}</td>
								<td>{asset.target_percent_of_ideal}</td>
								<td>{asset.include_in_escalation ? 'True' : 'False'}</td>
								<td>{asset.grouping1}</td>
								<td>{asset.value_stream}</td>
								<td>{asset.is_multiple ? 'True' : 'False'}</td>
								<td>{asset.is_dynamic ? 'True' : 'False'}</td>
								<td>{asset.status}</td>
								<td>
									<img
										src={EditIcon}
										alt={`edit-icon`}
										className="icon"
										onClick={() => this.showEditAsset(asset.asset_id)}
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
		actions: bindActionCreators(AssetActions, dispatch),
	};
};

export default connect(null, mapDispatch)(Assets);
