import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as TagActions from '../../../redux/actions/tagActions';
import Table from 'react-bootstrap/Table';
import Filter from '../../CustomComponents/filter';
import TagModal from './tagModal';
import FontAwesome from 'react-fontawesome';

class Device extends Component {
	constructor(props) {
		super(props);
		this.state = {
			TagsData: [],
			addTag: false,
			editTag: false,
			tag_id: 0,
			statusFilter: 'Active',
			tag: {},
			action: '',
			showTagModal: false
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

		return actions.getTagsFilter(params).then((response) => {
			this.setState({
				TagsData: response,
			});
		});
	};

	applyFilter = (statusFilter) => {
		this.setState({ statusFilter }, () => {
			this.loadData();
		})
	}

	showTagModal = (tag, action) => {
		this.setState({
			tag,
			action,
			showTagModal: true
		})
	}

	closeTagModal = () => {
		this.setState({
			tag: {},
			action: '',
			showTagModal: false
		})
	}

	render() {
		const t = this.props.t;
		return (
			<div>
				<Filter
					className="filter-user"
					buttonName={'+ ' + t('Tag')}
					role={false}
					newClass={false}
					level={false}
					automatedLevel={false}
					category={false}
					type={false}
					onClick={() => this.showTagModal({}, 'Create')}
					onClickFilter={this.applyFilter}
					view={'Tag'}
					t={t}
				/>
				<TagModal
					user={this.props.user}
					isOpen={this.state.showTagModal}
					tag={this.state.tag}
					action={this.state.action}
					Refresh={this.loadData}
					handleClose={this.closeTagModal}
					t={t}
				/>
				<Table responsive="sm" bordered={true}>
					<thead>
						<tr>
							<th style={{ maxWidth: '300px' }}>{t('Tag Name')}</th>
							<th>{t('Description')}</th>
							<th>{t('UOM Code')}</th>
							<th>{t('Asset')}</th>
							<th>{t('Status')}</th>
							<th>{t('Actions')}</th>
						</tr>
					</thead>
					<tbody>
						{this.state.TagsData.map((tag, index) => (
							<tr key={index}>
								<td style={{ maxWidth: '300px', wordWrap: 'break-word' }}>{tag.tag_name}</td>
								<td>{tag.tag_description}</td>
								<td>{tag.UOM_code}</td>
								<td>{tag.asset_code}</td>
								<td>{tag.status}</td>
								<td>
									<FontAwesome name='edit fa-2x' onClick={() => this.showTagModal(tag, 'Update')} />
									<FontAwesome name='copy fa-2x' onClick={() => this.showTagModal(tag, 'Copy')} />
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
