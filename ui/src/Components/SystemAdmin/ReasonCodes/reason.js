import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as ReasonActions from "../../../redux/actions/reasonActions";
import Table from "react-bootstrap/Table";
import Filter from "../../CustomComponents/filter";
import AddReason from "./addReason";
import EditIcon from "../../../resources/u668.svg";
import UpdateReason from "./updateReason";

class Reason extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ReasonData: [],
      showCreateReason: false,
      showUpdateReaon: false,
      reason: {},
      statusFilter: 'Active',
      categoryFilter: 'All',
      typeFilter: 'Downtime'
    };
  }

  componentDidMount() {
    this.loadData();
  }

  loadData = () => {
    const { actions } = this.props;
    const { statusFilter, categoryFilter, typeFilter } = this.state;

    const params = {
      site_id: this.props.user.site,
      status: statusFilter,
      category: categoryFilter,
      type: typeFilter
    };

    return actions.getReasonByFilter(params).then((response) => {
      this.setState({
        ReasonData: response,
      });
    });
  }

  applyFilter = (statusFilter, categoryFilter, typeFilter) => {
    this.setState({ statusFilter, categoryFilter, typeFilter }, () => {
      this.loadData();
    })
  }

  openCreateReason = () => {
    this.setState({
      showCreateReason: true
    });
  };

  openUpdateReason = (reason) => {
    this.setState({
      showUpdateReason: true,
      reason
    });
  };

  closeModal = () => {
    this.setState({
      showCreateReason: false,
      showUpdateReason: false,
      reason: {}
    });
  };

  render() {
    const t = this.props.t;
    return (
      <div>
        <Filter
          className="filter-user"
          buttonName={'+ ' + t('Reason')}
          category={true}
          type={true}
          onClick={() => this.openCreateReason()}
          onClickFilter={this.applyFilter}
          view={'Reason'}
          t={t}
        />
        <AddReason
          t={t}
          user={this.props.user}
          isOpen={this.state.showCreateReason}
          Refresh={this.loadData}
          onRequestClose={this.closeModal}
        />
        <UpdateReason
          t={t}
          user={this.props.user}
          isOpen={this.state.showUpdateReason}
          reason={this.state.reason}
          Refresh={this.loadData}
          onRequestClose={this.closeModal}
        />
        <Table responsive="sm" bordered={true}>
          <thead>
            <tr>
              <th>{t('Code')}</th>
              <th>{t('Name')}</th>
              <th>{t('Description')}</th>
              <th>{t('Category')}</th>
              <th>{t('Type')}</th>
              <th>{t('Asset Count')}</th>
              <th>{t('Status')}</th>
              <th>{t('Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {this.state.ReasonData.map((reason, index) => (
              <tr key={index}>
                <td>{reason.dtreason_code}</td>
                <td>{reason.dtreason_name}</td>
                <td>{reason.dtreason_description}</td>
                <td>{reason.dtreason_category}</td>
                <td>{reason.type}</td>
                <td>{reason.asset_count}</td>
                <td>{reason.status}</td>
                <td>
                  <img
                    src={EditIcon}
                    alt={`edit-icon`}
                    className="icon"
                    onClick={() => this.openUpdateReason(reason)}
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
    actions: bindActionCreators(ReasonActions, dispatch),
  };
};

export default connect(null, mapDispatch)(Reason);

