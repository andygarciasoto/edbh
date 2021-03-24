import React, { Component } from "react";

export class Step3 extends Component {
  render() {
    return (
      <div>
        Available Reasons
        <button className="button-next" onClick={(e) => this.props.nextStep(e)}>{"Next Step>>"}</button>
        <button className="button-back" onClick={(e) => this.props.back(e)}>{"<<Previous Step"}</button>
      </div>
    );
  }
}

export default Step3;
