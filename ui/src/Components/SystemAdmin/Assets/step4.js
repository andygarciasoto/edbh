import React, { Component } from "react";

export class Step4 extends Component {
  render() {
    return (
      <div>
        Available Break/Lunch
        <button className="button-back" onClick={(e) => this.props.back(e)}>{"<<Previous Step"}</button>
      </div>
    );
  }
}

export default Step4;
