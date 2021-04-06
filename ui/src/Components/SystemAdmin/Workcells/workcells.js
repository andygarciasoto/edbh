import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as WorkcellActions from '../../../redux/actions/workcellActions';
import Table from 'react-bootstrap/Table';
import Filter from '../../CustomComponents/filter';
import AddWorkcell from './addWorkcell';

class Workcells extends Component {
	constructor(props) {
		super(props);
		this.state = {
			WorkcellData: [],
			addWorkcell: false,
			editWorkcell: false,
			workcell_id: 0,
		};
	}

	componentDidMount() {
		const { actions } = this.props;

		return actions.getWorkcells(this.props.user.site).then((response) => {
			this.setState({
				WorkcellData: response,
			});
		});
	}

	showAddWorkcell = () => {
		this.setState({
			addWorkcell: true,
		});
	};

	closeAddWorkcell = () => {
		this.setState({
			addWorkcell: false,
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
					buttonName={'+ Workcell'}
					buttonFilter={'Search'}
					role={false}
					newClass={false}
					level={false}
					automatedLevel={false}
					category={false}
					type={false}
					shifts={false}
					onClick={() => this.showAddWorkcell()}
					t={t}
				></Filter>
				{this.state.addWorkcell === true && (
					<AddWorkcell
						t={t}
						user={this.props.user}
						showForm={this.state.addWorkcell}
						closeForm={this.closeAddWorkcell}
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
							<th>Description</th>
							<th>Status</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{/* {this.state.ShiftData.map((shift, index) => (
              <tr key={index}>
                <td>{shift.shift_name}</td>
                <td>{shift.shift_description}</td>
                <td>{shift.shift_sequence}</td>
                <td>{moment(shift.start_time).format("HH:mm A")}</td>
                <td>{shift.start_time_offset_days === -1 ? "Yesterday" : shift.start_time_offset_days === 0 ? "Today" : "Tomorrow"}</td>
                <td>{moment(shift.end_time).format("HH:mm A")}</td>
                <td>{shift.end_time_offset_days === -1 ? "Yesterday" : shift.end_time_offset_days === 0 ? "Today" : "Tomorrow"}</td>
                <td>{shift.duration_in_minutes}</td>
                <td>{shift.is_first_shift_of_day === true ? "Yes" : "No"}</td>
                <td>{shift.status}</td>
                <td>
                  <img
                    src={EditIcon}
                    alt={`edit-icon`}
                    className="icon"
                    onClick={() => this.showEditShift(shift.shift_id)}
                  />
                </td>
              </tr>
            ))} */}
					</tbody>
				</Table>
			</div>
		);
	}
}

export const mapDispatch = (dispatch) => {
	return {
		actions: bindActionCreators(WorkcellActions, dispatch),
	};
};

export default connect(null, mapDispatch)(Workcells);
