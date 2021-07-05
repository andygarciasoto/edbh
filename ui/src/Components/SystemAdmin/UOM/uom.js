import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UOMActions from '../../../redux/actions/uomActions';
import Table from 'react-bootstrap/Table';
import UOMModal from './uomModal';
import Filter from '../../CustomComponents/filter';
import FontAwesome from 'react-fontawesome';

class UOM extends Component {
	constructor(props) {
		super(props);
		this.state = {
			UOMData: [],
			statusFilter: 'Active',
			uom: {},
			action: '',
			showUOMModal: false
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

	showUOMModal = (uom, action) => {
		this.setState({
			uom,
			action,
			showUOMModal: true
		})
	}

	closeUOMModal = () => {
		this.setState({
			uom: {},
			action: '',
			showUOMModal: false
		})
	}

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
					onClick={() => this.showUOMModal({}, 'Create')}
					onClickFilter={this.applyFilter}
					view={'UOM'}
					t={t}
				/>
				<UOMModal
					user={this.props.user}
					isOpen={this.state.showUOMModal}
					uom={this.state.uom}
					action={this.state.action}
					Refresh={this.loadData}
					handleClose={this.closeUOMModal}
					t={t}
				/>
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
									<FontAwesome name='edit fa-2x' onClick={() => this.showUOMModal(uom, 'Update')} />
									<FontAwesome name='copy fa-2x' onClick={() => this.showUOMModal(uom, 'Copy')} />
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
