import React, { useState } from "react";
import "../../sass/SystemAdmin.scss";
import Form from "react-bootstrap/Form";
import _ from 'lodash';

const Filter = ({
  className,
  buttonName,
  role,
  onClick,
  onClickFilter,
  escalation,
  newClass,
  level,
  automatedLevel,
  category,
  type,
  shiftsOptions,
  shifts,
  view,
  t
}) => {
  // Declare multiple state variables
  const [statusFilter, setStatus] = useState('Active');
  const [roleFilter, setRole] = useState('All');
  const [escalationFilter, setEscalation] = useState('All');
  const [shiftFilter, setShift] = useState('All');
  const [categoryFilter, setCategory] = useState('All');
  const [typeFilter, setType] = useState('Downtime');
  const [levelFilter, setLevel] = useState('Cell');
  const [autLevelFilter, setAutLevel] = useState('All');


  return (
    <div className={className}>
      <p className="p-filter">{t('Filters')}:</p>
      <div>
        <p className="p-status">{t('Status')}:</p>
        <Form>
          <Form.Group
            controlId="exampleForm.SelectCustomSizeSm"
            className="drop-status"
          >
            <Form.Control as="select" size="sm" value={statusFilter} onChange={(event) => setStatus(event.target.value)} custom>
              <option value='All'>All</option>
              <option value='Active'>Active</option>
              <option value='Inactive'>Inactive</option>
            </Form.Control>
          </Form.Group>
        </Form>
      </div>
      {role === true && (
        <div>
          <p className="p-status role">{t('Role')}:</p>
          <Form>
            <Form.Group controlId="role" className="drop-status">
              <Form.Control as="select" size="sm" onChange={(event) => setRole(event.target.value)} custom>
                <option>All</option>
                <option>Administrator</option>
                <option>Supervisor</option>
                <option>Operator</option>
                <option>Summary</option>
                <option>Read-Only</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </div>
      )}
      {shifts === true && (
        <div>
          <p className="p-status role">{t('Shifts')}:</p>
          <Form>
            <Form.Group controlId="shift" className="drop-status">
              <Form.Control as="select" size="sm" custom value={shiftFilter} onChange={(e) => setShift(e.target.value)}>
                <option value='All'>All</option>
                {_.map(shiftsOptions, shift => { return (<option value={shift.shift_id} key={shift.shift_id + '_key'}>{shift.shift_name}</option>) })}
              </Form.Control>
            </Form.Group>
          </Form>
        </div>
      )}
      {category === true && (
        <div>
          <p className="p-status role">{t('Category')}:</p>
          <Form>
            <Form.Group controlId="category" className="drop-status">
              <Form.Control as="select" size="sm" custom value={categoryFilter} onChange={(e) => setCategory(e.target.value)}>
                <option value='All'>All</option>
                <option value=" ">None</option>
                <option value='Cost'>Cost</option>
                <option value='Quality'>Quality</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </div>
      )}
      {type === true && (
        <div>
          <p className="p-status role">{t('Type')}:</p>
          <Form>
            <Form.Group controlId="type" className="drop-status">
              <Form.Control as="select" size="sm" custom value={typeFilter} onChange={(e) => setType(e.target.value)}>
                <option value='All'>All</option>
                <option value='Downtime'>Downtime</option>
                <option value='Scrap'>Scrap</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </div>
      )}
      {level === true && (
        <div>
          <p className="p-status level">{t('Level')}:</p>
          <Form>
            <Form.Group controlId="role" className="drop-status">
              <Form.Control as="select" size="sm" custom value={levelFilter} onChange={(e) => setLevel(e.target.value)}>
                <option value='All'>All</option>
                <option value='Site'>Site</option>
                <option value='Area'>Area</option>
                <option value='Cell'>Cell</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </div>
      )}
      {automatedLevel === true && (
        <div>
          <p className="p-status automated">{t('Automated Level')}:</p>
          <Form>
            <Form.Group controlId="role" className="drop-autLevel">
              <Form.Control as="select" size="sm" custom value={autLevelFilter} onChange={(e) => setAutLevel(e.target.value)}>
                <option value='All'>All</option>
                <option value='Automated'>Automated</option>
                <option value='Manual'>Manual</option>
                <option value='Partially_Automatic_Order'>Partially Automatic Order</option>
                <option value='Partially_Manual_Scan_Order'>Partially Manual Scan Order</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </div>
      )}
      {escalation === true && (
        <div>
          <p className="p-status role">{t('Escalation')}:</p>
          <Form>
            <Form.Group controlId="role" className="drop-status">
              <Form.Control as="select" size="sm" onChange={(event) => setEscalation(event.target.value)} custom>
                <option>All</option>
                <option>Front Line Manager</option>
                <option>Value Stream Manager</option>
                <option>Plant Manager</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </div>
      )}
      <button
        className={
          newClass === true
            ? "filter-button filter assets"
            : "filter-button filter"
        }
        onClick={() => {
          if (view === 'User')
            onClickFilter(statusFilter, roleFilter, escalationFilter);
          if (view === 'Shift' || view === 'Workcell' || view === 'UOM' || view === 'Display' || view === 'Tag')
            onClickFilter(statusFilter);
          if (view === 'Break')
            onClickFilter(statusFilter, shiftFilter);
          if (view === 'Reason')
            onClickFilter(statusFilter, categoryFilter, typeFilter)
          if (view === 'Asset')
            onClickFilter(statusFilter, levelFilter, autLevelFilter)
        }}
      >
        {t('Apply Filter')}
      </button>
      <button className="filter-button" onClick={onClick}>
        {buttonName}
      </button>
    </div>
  )
};

export default Filter;
