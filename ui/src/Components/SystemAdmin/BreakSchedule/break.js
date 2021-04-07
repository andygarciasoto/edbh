import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as BreakActions from '../../../redux/actions/breakActions';
import moment from 'moment';
import Table from 'react-bootstrap/Table';
import Filter from '../../CustomComponents/filter';
import AddBreak from './addBreak';
import EditIcon from "../../../resources/u668.svg";

class Break extends Component {
	constructor(props) {
		super(props);
		this.state = {
			BreakData: [],
			addBreak: false,
			editBreak: false,
			shift_id: 0,
		};
	}

	  componentDidMount() {
	    const { actions } = this.props;

	    return actions.getBreakBySite(this.props.user.site).then((response) => {
	      this.setState({
	        BreakData: response,
	      });
	    });
	  }

	showAddBreak = () => {
		this.setState({
			addBreak: true,
		});
	};

	closeAddBreak = () => {
		this.setState({
			addBreak: false,
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
					buttonName={'+ ' + t('Break')}
					buttonFilter={t('Search')}
					role={false}
					newClass={false}
					level={false}
					automatedLevel={false}
					category={false}
					type={false}
					shifts={true}
					t={t}
					onClick={() => this.showAddBreak()}
				></Filter>
				{this.state.addBreak === true && (
					<AddBreak
						t={t}
						user={this.props.user}
						showForm={this.state.addBreak}
						closeForm={this.closeAddBreak}
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
							<th>Start Time</th>
							<th>End Time</th>
							<th>Duration (minutes)</th>
							<th>Asset Count</th>
							<th>Status</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{this.state.BreakData.map((unavailable, index) => (
              <tr key={index}>
								<td>{unavailable.unavailable_name}</td>
                <td>{unavailable.unavailable_description}</td>
								<td>{moment(unavailable.start_time).format("HH:mm A")}</td>
								<td>{moment(unavailable.end_time).format("HH:mm A")}</td>
								<td>{unavailable.duration_in_minutes}</td>
								<td>{unavailable.unavailable_name}</td>
								<td>{unavailable.status}</td>
                <td>
                  <img
                    src={EditIcon}
                    alt={`edit-icon`}
                    className="icon"
                    onClick={() => this.showEditShift(unavailable.unavailable_id)}
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
		actions: bindActionCreators(BreakActions, dispatch),
	};
};

export default connect(null, mapDispatch)(Break);
