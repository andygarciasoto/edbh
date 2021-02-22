import React, { Component } from "react";

class AddUser extends Component {
  render() {
    if (!this.props.show) {
      return null;
    }
    return <div>aqui se agrega user</div>;
  }
}

export default AddUser;
