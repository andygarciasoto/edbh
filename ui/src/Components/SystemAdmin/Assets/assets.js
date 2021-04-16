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
		};
	}

	componentDidMount() {
		const { actions } = this.props;

		return actions.getAssets(this.props.user.site).then((response) => {
			this.setState({
				AssetsData: response,
			});
		});
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
					buttonName={'+ Asset'}
					buttonFilter={'Search'}
					role={false}
					newClass={true}
					level={true}
					automatedLevel={true}
					onClick={() => this.showAddAsset()}
					t={t}
				></Filter>
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
							<th>Code</th>
							<th>Name</th>
							<th>Description</th>
							<th>Level</th>
							<th>Parent Code</th>
							<th>Automation Level</th>
							<th>Target Percent of Ideal</th>
							<th>Include in Escalation</th>
							<th>Status</th>
							<th>Actions</th>
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
								<td>{asset.include_in_escalation}</td>
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
