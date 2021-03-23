import React, { Component } from "react";

export class Step3 extends Component {
  render() {
    return (
      <div>
        step3
        <button onClick={(e) => this.props.nextStep(e)}>Next Step</button>
        <button onClick={(e) => this.props.back(e)}>Back</button>
      </div>
    );
  }
}

export default Step3;
