import React, { Component } from "react";
import { Form, Col } from "react-bootstrap";

export class Step1 extends Component {
  render() {
    return (
      <div>
        <form>
          <Form.Row>
            <Col>
              <label>
                Code:
                <input
                  className="input-tag-code asset-code"
                  type="text"
                  name="code"
                  autoComplete={"false"}
                  onChange={this.handleChange}
                />
              </label>
            </Col>
            <Col>
              <label className="label-tag-category">
                Automation Level:
                <select
                  className="select-tag-category asset-automation"
                  name="automation_level"
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
                  className="input-tag-name asset-name"
                  type="text"
                  name="name"
                  autoComplete={"false"}
                  onChange={this.handleChange}
                />
              </label>
            </Col>
            <Col>
              <label className="label-tag-category">
                Asset Display:
                <select
                  className="select-tag-type asset-asset"
                  name="asset_display"
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
                  className="input-tag-description asset-description"
                  type="text"
                  name="description"
                  autoComplete={"false"}
                  onChange={this.handleChange}
                />
              </label>
            </Col>
            <Col>
              <label className="label-tag-category">
                Workcell:
                <select
                  className="select-tag-type asset-workcell"
                  name="workcell"
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
                Level:
                <select
                  className="select-tag-type asset-level"
                  name="level"
                  onChange={this.handleChange}
                >
                  <option value="Active">Downtime</option>
                  <option value="Inactive">Cost</option>
                </select>
              </label>
            </Col>
            <Col>
              <label className="label-tag-category">
                Site Code:
                <input
                  className="input-tag-aggregation asset-site-code"
                  type="text"
                  name="site_code"
                  autoComplete={"false"}
                  onChange={this.handleChange}
                />
              </label>
            </Col>
          </Form.Row>
          <Form.Row>
            <Col>
              <label>
                Parent Code:
                <select
                  className="select-tag-type asset-parent"
                  name="parent_code"
                  onChange={this.handleChange}
                >
                  <option value="Active">Downtime</option>
                  <option value="Inactive">Cost</option>
                </select>
              </label>
            </Col>
            <Col>
              <label className="label-tag-category">
                Include Escalation:
                <input
                  className="input-tag-aggregation asset-escalation"
                  type="text"
                  name="escalation"
                  autoComplete={"false"}
                  onChange={this.handleChange}
                />
              </label>
            </Col>
          </Form.Row>
        </form>
        <button className="button-next" onClick={(e) => this.props.nextStep(e)}>
          {"Next Step>>"}
        </button>
      </div>
    );
  }
}

export default Step1;
