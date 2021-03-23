import React, { Component } from "react";

export class Step4 extends Component {
  render() {
    return (
      <div>
        step4
        <button onClick={(e) => this.props.back(e)}>Back</button>
      </div>
    );
  }
}

export default Step4;
