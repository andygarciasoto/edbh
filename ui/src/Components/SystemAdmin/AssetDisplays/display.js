import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as DisplayActions from '../../../redux/actions/displayActions';
import Table from 'react-bootstrap/Table';
import Filter from '../../CustomComponents/filter';
import AddDisplay from './addDisplay';
import EditIcon from '../../../resources/u668.svg';

class Display extends Component {
	constructor(props) {
		super(props);
		this.state = {
			DisplayData: [],
			addDisplay: false,
			editDisplay: false,
			shift_id: 0,
		};
	}

	componentDidMount() {
		this.loadData();
	}

	loadData = () => {
		const { actions } = this.props;

		return actions.getDisplay(this.props.user.site).then((response) => {
			this.setState({
				DisplayData: response,
			});
		});
	};

	showAddDisplay = () => {
		this.setState({
			addDisplay: true,
		});
	};

	closeAddDisplay = () => {
		this.setState({
			addDisplay: false,
		});
	};

	//   showEditShift = (shift_id) => {
	//     this.setState({
	//       editShift: true,
	//       shift_id: shift_id
	//     });
	//   };

	//   closeEditShift = () => {
	//     this.setState({
	//         editShift: false,
	//     });
	//   };

	render() {
		const t = this.props.t;

		return (
			<div>
				<Filter
					className="filter-user"
					buttonName={'+ Asset Display'}
					buttonFilter={'Search'}
					role={false}
					newClass={false}
					level={false}
					automatedLevel={false}
					category={false}
					type={false}
					shifts={false}
					onClick={() => this.showAddDisplay()}
					t={t}
				></Filter>
				{this.state.addDisplay === true && (
					<AddDisplay
						user={this.props.user}
						showForm={this.state.addDisplay}
						t={t}
						closeForm={this.closeAddDisplay}
            Refresh={this.loadData}
					/>
				)}
				{/* {this.state.editShift === true && (
          <EditShift
            user={this.props.user}
            showForm={this.state.editShift}
            closeForm={this.closeEditShift}
            shift_id={this.state.shift_id}
          />
        )} */}
				<Table responsive="sm" bordered={true}>
					<thead>
						<tr>
							<th>Name</th>
							<th>Asset</th>
							<th>Status</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{this.state.DisplayData.map((display, index) => (
							<tr key={index}>
								<td>{display.displaysystem_name}</td>
								<td>{display.asset_code}</td>
								<td>{display.status}</td>
								<td>
									<img
										src={EditIcon}
										alt={`edit-icon`}
										className="icon"
										onClick={() => this.showEditShift(display.assetdisplaysystem_id)}
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
		actions: bindActionCreators(DisplayActions, dispatch),
	};
};

export default connect(null, mapDispatch)(Display);
