
import React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import './LanguagePicker.scss';

class LanguagePickerCustom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: new Date(),
      value: this.props.value
    }
    this.onSelect = this.onSelect.bind(this);
  }

  componentDidMount() {
  }

  onSelect(e) {
    this.props.collectInput(e, 'ln');
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value })
  }

  render() {
    return (
      <DropdownButton
        alignleft="true"
        title={this.state.value}
        id="dropdown-menu-align-right"
        className="language-picker-button"
      >
        <Dropdown.Item eventKey="EN-US" onSelect={(e) => this.onSelect(e)}>EN-US</Dropdown.Item>
        <Dropdown.Item eventKey="ES" onSelect={(e) => this.onSelect(e)}>ES</Dropdown.Item>
        <Dropdown.Item eventKey="IT" onSelect={(e) => this.onSelect(e)}>IT</Dropdown.Item>
        <Dropdown.Item eventKey="DE" onSelect={(e) => this.onSelect(e)}>DE</Dropdown.Item>
        <Dropdown.Item eventKey="KO" onSelect={(e) => this.onSelect(e)}>KO</Dropdown.Item>
      </DropdownButton>
    )
  }
};

export default LanguagePickerCustom;