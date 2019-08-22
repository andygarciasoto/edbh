
import React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import './LanguagePicker.scss';
import i18next from 'i18next';

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
        e = e.toLowerCase();
        e = e.replace('-', '_')
        i18next.changeLanguage(e, ()=>console.log('Changed the language to ' + e)) // -> returns a Promise
        this.props.changeDateLanguage(e);
        this.props.openMenu();
        localStorage.setItem('language', e);
      }

      componentWillReceiveProps(nextProps) {
        this.setState({value: nextProps.value})
      }

    render() {
      var language = window.localStorage.getItem("language");
        return (
          <DropdownButton
            alignleft="true"
            title={language != null ? language :this.state.value}
            id="dropdown-menu-align-right"
            className="language-picker-button"
          >
          <Dropdown.Item eventKey="EN-US" onSelect={(e)=>this.onSelect(e)}>EN-US</Dropdown.Item>
          <Dropdown.Item eventKey="ES" onSelect={(e)=>this.onSelect(e)}>ES</Dropdown.Item>
        </DropdownButton>
        )
    }
};

export default LanguagePickerCustom;