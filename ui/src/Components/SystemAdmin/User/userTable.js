import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as UserActions from "../../../redux/actions/userActions";
import Table from "react-bootstrap/Table";
import Filter from "../../CustomComponents/filter";
import AddUser from "./addUser";
import EditUser from "./editUser";
import UserModal from "./userModal";
import FontAwesome from 'react-fontawesome';

class UserTable extends Component {
	constructor(props) {
		super(props);
		this.state = {
			usersData: [],
			user: false,
			edit: false,
			badge: "",
			statusFilter: 'Active',
			roleFilter: 'All',
			escalationFilter: 'All',
			selectedUser: {},
			action: '',
			showUserModal: false
		};
	}

	componentDidMount() {
		this.loadData();
	}

	loadData = () => {
		const { actions } = this.props;
		const { statusFilter, roleFilter, escalationFilter } = this.state;

		const params = {
			site_id: this.props.user.site,
			status: statusFilter,
			role: roleFilter,
			escalation: escalationFilter
		}

		actions.getUsersFilter(params).then((response) => {
			this.setState({
				usersData: response,
			});
		});
	}

	applyFilter = (statusFilter, roleFilter, escalationFilter) => {
		this.setState({ statusFilter, roleFilter, escalationFilter }, () => {
			this.loadData();
		})
	}

	showAddUser = () => {
		this.setState({
			user: true,
		});
	};

	showEditUser = (badge) => {
		this.setState({
			edit: true,
			badge: badge,
		});
	};

	showUserModal = (selectedUser, action) => {
		this.setState({
			selectedUser,
			action,
			showUserModal: true
		})
	}

	closeAddUser = () => {
		this.setState({
			user: false,
		});
	};

	closeEditUser = () => {
		this.setState({
			edit: false,
		});
	};

	closeUserModal = () => {
		this.setState({
			selectedUser: {},
			action: '',
			showUserModal: false
		})
	}

	render() {
		const t = this.props.t;
		return (
			<div>
				<Filter
					className="filter-user"
					buttonName={'+ ' + t('User')}
					role={true}
					escalation={true}
					onClick={() => this.showAddUser()}
					onClickFilter={this.applyFilter}
					view={'User'}
					t={t}
				></Filter>
				{this.state.user === true && (
					<AddUser
						user={this.props.user}
						showForm={this.state.user}
						closeForm={this.closeAddUser}
						Refresh={this.loadData}
						t={t}
					/>
				)}
				{this.state.edit === true && (
					<EditUser
						user={this.props.user}
						showForm={this.state.edit}
						closeForm={this.closeEditUser}
						badge={this.state.badge}
						Refresh={this.loadData}
						t={t}
					/>
				)}
				<UserModal
					user={this.props.user}
					isOpen={this.state.showUserModal}
					selectedUser={this.state.selectedUser}
					action={this.state.action}
					Refresh={this.loadData}
					handleClose={this.closeUserModal}
					t={t}
				/>
				<Table responsive="sm" bordered={true}>
					<thead>
						<tr>
							<th>{t('Badge')}</th>
							<th>{t('Username')}</th>
							<th>{t('First Name')}</th>
							<th>{t('Last Name')}</th>
							<th>{t('Role')}</th>
							<th>{t('Status')}</th>
							<th>{t('Escalation')}</th>
							<th>{t('Actions')}</th>
						</tr>
					</thead>
					<tbody>
						{this.state.usersData.map((user, index) => (
							<tr key={index}>
								<td>{user.Badge}</td>
								<td>{user.Username}</td>
								<td>{user.First_Name}</td>
								<td>{user.Last_Name}</td>
								<td>{user.Role}</td>
								<td>{user.status}</td>
								<td>{user.escalation_name}</td>
								<td>
									<FontAwesome name='edit fa-2x' onClick={() => this.showEditUser(user.Badge)} />
									<FontAwesome name='copy fa-2x' onClick={() => this.showUserModal(user, 'Copy')} />
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
		actions: bindActionCreators(UserActions, dispatch),
	};
};

export default connect(null, mapDispatch)(UserTable);
