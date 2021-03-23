import React, { Component } from "react";

export class Step1 extends Component {
  render() {
    return (
      <div>
        step1
        <button onClick={(e) => this.props.nextStep(e)}>Next Step</button>
      </div>
    );
  }
}

export default Step1;
