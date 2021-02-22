import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as UserActions from "../../redux/actions/userActions";
import CardComponent from "../CustomComponents/card";
import "../../sass/SystemAdmin.scss";
import UserTable from "./userTable";
import CommonParams from "./commonParams";
import Assets from "./AdminTables/assets";
import Reason from "./AdminTables/reason";
import Device from "./AdminTables/device";
import Shifts from "./AdminTables/shifts";
import UOM from "./AdminTables/uom";
import Break from "./AdminTables/break";
import Display from "./AdminTables/display";
import Workcells from "./AdminTables/workcells";

import UserIcon from "../../resources/u469.svg";
import CommonIcon from "../../resources/u470.svg";
import AssetsIcon from "../../resources/u471.svg";
import ReasonIcon from "../../resources/u474.svg";
import DeviceIcon from "../../resources/u472.svg";
import ShiftsIcon from "../../resources/u473.svg";
import BreakIcon from "../../resources/u475.svg";
import UOMIcon from "../../resources/u476.svg";
import DisplayIcon from "../../resources/u477.svg";
import WorkIcon from "../../resources/u478.svg";

export class Administrator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userTable: true,
      commonParams: false,
      assets: false,
      reason: false,
      device: false,
      shifts: false,
      uom: false,
      break: false,
      display: false,
      workcells: false,
      panelData: {},
    };
  }

  componentDidMount() {
    const { actions } = this.props;

    return actions.getDashboardInfo(this.props.user.site).then((response) => {
      this.setState({
        panelData: response,
      });
    });
  }

  toggleData = (param) => {
    switch (param) {
      case "userTable":
        this.setState({
          userTable: true,
          commonParams: false,
          assets: false,
          reason: false,
          device: false,
          shifts: false,
          uom: false,
          break: false,
          display: false,
          workcells: false,
        });
        break;

      case "commonParams":
        this.setState({
          userTable: false,
          commonParams: true,
          assets: false,
          reason: false,
          device: false,
          shifts: false,
          uom: false,
          break: false,
          display: false,
          workcells: false,
        });
        break;
      case "assets":
        this.setState({
          userTable: false,
          commonParams: false,
          assets: true,
          reason: false,
          device: false,
          shifts: false,
          uom: false,
          break: false,
          display: false,
          workcells: false,
        });
        break;
      case "reason":
        this.setState({
          userTable: false,
          commonParams: false,
          assets: false,
          reason: true,
          device: false,
          shifts: false,
          uom: false,
          break: false,
          display: false,
          workcells: false,
        });
        break;
      case "device":
        this.setState({
          userTable: false,
          commonParams: false,
          assets: false,
          reason: false,
          device: true,
          shifts: false,
          uom: false,
          break: false,
          display: false,
          workcells: false,
        });
        break;
      case "shifts":
        this.setState({
          userTable: false,
          commonParams: false,
          assets: false,
          reason: false,
          device: false,
          shifts: true,
          uom: false,
          break: false,
          display: false,
          workcells: false,
        });
        break;
      case "uom":
        this.setState({
          userTable: false,
          commonParams: false,
          assets: false,
          reason: false,
          device: false,
          shifts: false,
          uom: true,
          break: false,
          display: false,
          workcells: false,
        });
        break;
      case "break":
        this.setState({
          userTable: false,
          commonParams: false,
          assets: false,
          reason: false,
          device: false,
          shifts: false,
          uom: false,
          break: true,
          display: false,
          workcells: false,
        });
        break;
      case "display":
        this.setState({
          userTable: false,
          commonParams: false,
          assets: false,
          reason: false,
          device: false,
          shifts: false,
          uom: false,
          break: false,
          display: true,
          workcells: false,
        });
        break;
      case "workcells":
        this.setState({
          userTable: false,
          commonParams: false,
          assets: false,
          reason: false,
          device: false,
          shifts: false,
          uom: false,
          break: false,
          display: false,
          workcells: true,
        });
        break;

      default:
        return false;
    }
  };

  render() {
    const { panelData } = this.state;
    return (
      <div id="administrator">
        <CardComponent
          className={"card-component"}
          icon={UserIcon}
          number={panelData.Users}
          name={"Users"}
          onClick={() => this.toggleData("userTable")}
        />
        <CardComponent
          className={"card-component common"}
          icon={CommonIcon}
          number={null}
          name={"Common Parameters"}
          onClick={() => this.toggleData("commonParams")}
        />
        <CardComponent
          className={"card-component assets"}
          icon={AssetsIcon}
          number={panelData.Assets}
          name={"Assets"}
          onClick={() => this.toggleData("assets")}
        />
        <CardComponent
          className={"card-component reason"}
          icon={ReasonIcon}
          number={panelData.DTReasons}
          name={"Reason Codes"}
          onClick={() => this.toggleData("reason")}
        />
        <CardComponent
          className={"card-component device"}
          icon={DeviceIcon}
          number={panelData.Tags}
          name={"Device Tags"}
          onClick={() => this.toggleData("device")}
        />
        <CardComponent
          className={"card-component shifts"}
          icon={ShiftsIcon}
          number={panelData.Shifts}
          name={"Shifts"}
          onClick={() => this.toggleData("shifts")}
        />
        <CardComponent
          className={"card-component uom"}
          icon={UOMIcon}
          number={panelData.UOM}
          name={"UOM"}
          onClick={() => this.toggleData("uom")}
        />
        <CardComponent
          className={"card-component break"}
          icon={BreakIcon}
          number={panelData.Unavailable}
          name={"Break Schedule"}
          onClick={() => this.toggleData("break")}
        />
        <CardComponent
          className={"card-component display"}
          icon={DisplayIcon}
          number={panelData.AssetDisplaySystems}
          name={"Asset Displays"}
          onClick={() => this.toggleData("display")}
        />
        <CardComponent
          className={"card-component work"}
          icon={WorkIcon}
          number={panelData.Workcells}
          name={"Workcells"}
          onClick={() => this.toggleData("workcells")}
        />

        {this.state.userTable === true && <UserTable user={this.props.user}/>}
        {this.state.commonParams === true && <CommonParams />}
        {this.state.assets === true && <Assets />}
        {this.state.reason === true && <Reason />}
        {this.state.device === true && <Device />}
        {this.state.shifts === true && <Shifts />}
        {this.state.uom === true && <UOM />}
        {this.state.break === true && <Break />}
        {this.state.display === true && <Display />}
        {this.state.workcells === true && <Workcells />}
      </div>
    );
  }
}

export const mapDispatch = (dispatch) => {
  return {
    actions: bindActionCreators(UserActions, dispatch),
  };
};

export default connect(null, mapDispatch)(Administrator);
