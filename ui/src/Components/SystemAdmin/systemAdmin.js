import React, { Component } from "react";
import CardComponent from "../CustomComponents/card";
import "../../sass/SystemAdmin.scss";
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

class Administrator extends Component {
  print = () => {
    console.log("funciona");
  };
  render() {
    return (
      <div id="administrator">
        <div className="hover">
          <CardComponent
            className={"card-component"}
            icon={UserIcon}
            number={25}
            name={"Users"}
            onClick={() => this.print()}
          />
        </div>
        <div>
          <CardComponent
            className={"card-component common"}
            icon={CommonIcon}
            number={null}
            name={"Common Parameters"}
            onClick={() => this.print()}
          />
        </div>
        <div>
          <CardComponent
            className={"card-component assets"}
            icon={AssetsIcon}
            number={150}
            name={"Assets"}
            onClick={() => this.print()}
          />
        </div>
        <div>
          <CardComponent
            className={"card-component reason"}
            icon={ReasonIcon}
            number={1500}
            name={"Reason Codes"}
            onClick={() => this.print()}
          />
        </div>
        <div>
          <CardComponent
            className={"card-component device"}
            icon={DeviceIcon}
            number={40}
            name={"Device Tags"}
            onClick={() => this.print()}
          />
        </div>
        <div>
          <CardComponent
            className={"card-component shifts"}
            icon={ShiftsIcon}
            number={3}
            name={"Shifts"}
            onClick={() => this.print()}
          />
        </div>
        <div>
          <CardComponent
            className={"card-component uom"}
            icon={UOMIcon}
            number={2}
            name={"UOM"}
            onClick={() => this.print()}
          />
        </div>
        <div>
          <CardComponent
            className={"card-component break"}
            icon={BreakIcon}
            number={725}
            name={"Break Schedule"}
            onClick={() => this.print()}
          />
        </div>
        <div>
          <CardComponent
            className={"card-component display"}
            icon={DisplayIcon}
            number={33}
            name={"Asset Displays"}
            onClick={() => this.print()}
          />
        </div>
        <div>
          <CardComponent
            className={"card-component work"}
            icon={WorkIcon}
            number={9}
            name={"Workcells"}
            onClick={() => this.print()}
          />
        </div>
      </div>
    );
  }
}

export default Administrator;
