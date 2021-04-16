import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as TagActions from '../../../redux/actions/tagActions';
import Table from 'react-bootstrap/Table';
import Filter from '../../CustomComponents/filter';
import AddTag from './addDevice';
import EditTag from './editTags';
import EditIcon from '../../../resources/u668.svg';

class Device extends Component {
	constructor(props) {
		super(props);
		this.state = {
			TagsData: [],
			addTag: false,
			editTag: false,
			tag_id: 0,
		};
	}

	componentDidMount() {
		this.loadData();
	}

	loadData = () => {
		const { actions } = this.props;

		return actions.getTags(this.props.user.site).then((response) => {
			this.setState({
				TagsData: response,
			});
		});
	};

	showAddTag = () => {
		this.setState({
			addTag: true,
		});
	};

	closeAddTag = () => {
		this.setState({
			addTag: false,
		});
	};

	showEditTag = (tag_id) => {
		this.setState({
			editTag: true,
			tag_id: tag_id,
		});
	};

	closeEditTag = () => {
		this.setState({
			editTag: false,
		});
	};

	render() {
		const t = this.props.t;
		return (
			<div>
				<Filter
					className="filter-user"
					buttonName={'+ Tag'}
					role={false}
					newClass={false}
					level={false}
					automatedLevel={false}
					category={false}
					type={false}
					onClick={() => this.showAddTag()}
					t={t}
				></Filter>
				{this.state.addTag === true && (
					<AddTag
						user={this.props.user}
						showForm={this.state.addTag}
						closeForm={this.closeAddTag}
						Refresh={this.loadData}
						t={t}
					/>
				)}
				{this.state.editTag === true && (
					<EditTag
						user={this.props.user}
						showForm={this.state.editTag}
						closeForm={this.closeEditTag}
						tag_id={this.state.tag_id}
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
							<th>Data Type</th>
							<th>UOM code</th>
							<th>Rollover Point</th>
							<th>Aggregation</th>
							<th>Max Change</th>
							<th>Asset</th>
							<th>Status</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{this.state.TagsData.map((tag, index) => (
							<tr key={index}>
								<td>{tag.tag_code}</td>
								<td>{tag.tag_name}</td>
								<td>{tag.tag_description}</td>
								<td>{tag.datatype}</td>
								<td>{tag.UOM_code}</td>
								<td>{tag.rollover_point}</td>
								<td>{tag.aggregation}</td>
								<td>{tag.max_change}</td>
								<td>{tag.asset_code}</td>
								<td>{tag.status}</td>
								<td>
									<img
										src={EditIcon}
										alt={`edit-icon`}
										className="icon"
										onClick={() => this.showEditTag(tag.tag_id)}
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
		actions: bindActionCreators(TagActions, dispatch),
	};
};

export default connect(null, mapDispatch)(Device);
