import React from "react";
import "../../sass/SystemAdmin.scss";
import Form from "react-bootstrap/Form";

const Filter = ({ className, buttonName, role, onClick, escalation, buttonFilter }) => (
  <div className={className}>
    <p className="p-filter">Filters:</p>
    <div>
      <p className="p-status">Status:</p>
      <Form>
        <Form.Group
          controlId="exampleForm.SelectCustomSizeSm"
          className="drop-status"
        >
          <Form.Control as="select" size="sm" custom>
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
          </Form.Control>
        </Form.Group>
      </Form>
    </div>
    {role === true && (
      <div>
        <p className="p-status role">Role:</p>
        <Form>
          <Form.Group
            controlId="role"
            className="drop-status"
          >
            <Form.Control as="select" size="sm" custom>
              <option>All</option>
              <option>Administrator</option>
              <option>Operator</option>
              <option>Supervisor</option>
            </Form.Control>
          </Form.Group>
        </Form>
      </div>
    )}
    {escalation === true && (
      <div>
        <p className="p-status role">Escalation:</p>
        <Form>
          <Form.Group
            controlId="role"
            className="drop-status"
          >
            <Form.Control as="select" size="sm" custom>
              <option>All</option>
              <option>Site Manager</option>
              <option>Plant Manager</option>
              <option>Value Stream Manager</option>
              <option>Plant Manager</option>
            </Form.Control>
          </Form.Group>
        </Form>
      </div>
    )}
     <button className="filter-button filter" onClick={onClick}>
      {buttonFilter}
    </button>
    <button className="filter-button" onClick={onClick}>
      {buttonName}
    </button>
  </div>
);

export default Filter;
