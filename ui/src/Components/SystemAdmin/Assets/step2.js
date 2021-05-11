import React, { Component } from "react";
import {Form, Col} from "react-bootstrap";

export class Step2 extends Component {
  render() {
    return (
      <div>
        <form>
              <Form.Row>
                <Col>
                  <label>
                    Code:
                    <input
                      className="input-tag-code"
                      type="text"
                      name="code"
                      autoComplete={"false"}
                      onChange={this.handleChange}
                    />
                  </label>
                </Col>
                <Col>
                  <label className="label-tag-category">
                    Tag Type:
                    <select
                      className="select-tag-category"
                      name="decimals"
                      onChange={this.handleChange}
                    >
                      <option value="Active">Cost</option>
                      <option value="Inactive">Cost</option>
                    </select>
                  </label>
                </Col>
              </Form.Row>
              <Form.Row>
                <Col>
                  <label>
                    Name:
                    <input
                      className="input-tag-name"
                      type="text"
                      name="name"
                      autoComplete={"false"}
                      onChange={this.handleChange}
                    />
                  </label>
                </Col>
                <Col>
                  <label className="label-tag-category">
                    UOM Code:
                    <select
                      className="select-tag-type uom-code"
                      name="type"
                      onChange={this.handleChange}
                    >
                      <option value="Active">Downtime</option>
                      <option value="Inactive">Cost</option>
                    </select>
                  </label>
                </Col>
              </Form.Row>
              <Form.Row>
                <Col>
                  <label>
                    Description:
                    <textarea
                      className="input-tag-description"
                      type="text"
                      name="name"
                      autoComplete={"false"}
                      onChange={this.handleChange}
                    />
                  </label>
                </Col>
                <Col>
                  <label className="label-tag-category">
                    Rollover Point:
                    <input
                      className="input-reason-name"
                      type="text"
                      name="name"
                      autoComplete={"false"}
                      onChange={this.handleChange}
                    />
                  </label>
                </Col>
              </Form.Row>
              <Form.Row>
                <Col>
                  <label>
                    Tag Group:
                    <input
                      className="input-tag-tag"
                      type="text"
                      name="name"
                      autoComplete={"false"}
                      onChange={this.handleChange}
                    />
                  </label>
                </Col>
                <Col>
                  <label className="label-tag-category">
                    Aggregation:
                    <input
                      className="input-tag-aggregation"
                      type="text"
                      name="name"
                      autoComplete={"false"}
                      onChange={this.handleChange}
                    />
                  </label>
                </Col>
              </Form.Row>
              <Form.Row>
                <Col>
                  <label>
                    Data Type:
                    <select
                      className="select-tag-type "
                      name="type"
                      onChange={this.handleChange}
                    >
                      <option value="Active">Downtime</option>
                      <option value="Inactive">Cost</option>
                    </select>
                  </label>
                </Col>
                <Col>
                  <label className="label-tag-category">
                    Max Change:
                    <input
                      className="input-tag-aggregation"
                      type="text"
                      name="name"
                      autoComplete={"false"}
                      onChange={this.handleChange}
                    />
                  </label>
                </Col>
              </Form.Row>
            </form>
        <button className="button-next" onClick={(e) => this.props.nextStep(e)}>{"Next Step>>"}</button>
        <button className="button-back" onClick={(e) => this.props.back(e)}>{"<<Previous Step"}</button>
      </div>
    );
  }
}

export default Step2;
