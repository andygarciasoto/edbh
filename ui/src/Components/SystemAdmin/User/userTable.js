import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as UserActions from "../../../redux/actions/userActions";
import Table from "react-bootstrap/Table";
import Filter from "../../CustomComponents/filter";
import AddUser from "./addUser";
import EditUser from "./editUser";
import EditIcon from "../../../resources/u668.svg";

class UserTable extends Component {
	constructor(props) {
		super(props);
		this.state = {
			usersData: [],
			user: false,
			edit: false,
			badge: "",
			statusFilter: 'All',
			roleFilter: 'All',
			escalationFilter: 'All'
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
	
	render() {
		const t = this.props.t;
		return (
			<div>
				<Filter
					className="filter-user"
					buttonName={'+ ' + t('User')}
					role={true}
					escalation={true}
					buttonFilter={t('Search')}
					onClick={() => this.showAddUser()}
					onClickFilter={this.applyFilter}
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
									<img
										src={EditIcon}
										alt={`edit-icon`}
										className="icon"
										onClick={() => this.showEditUser(user.Badge)}
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
		actions: bindActionCreators(UserActions, dispatch),
	};
};

export default connect(null, mapDispatch)(UserTable);
