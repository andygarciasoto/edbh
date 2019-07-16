import React from  'react';
import Modal from 'react-modal';
import { Form, Button, Row, Col } from 'react-bootstrap';
import * as _ from  'lodash';
import './DropdownModal.scss';


class DropdownModal extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            value : this.props.currentVal,
            newValue: '',
        } 
        this.editNumber = this.editNumber.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    editNumber(e) {
        const newVal = this.state.newValue;
        this.setState({value: newVal});
        this.props.onRequestClose();
    }

    onChange(e) {
        this.setState({newValue: e.target.value});
    }

    componentWillReceiveProps(nextProps) {
    }

    render() {
        const styles = _.cloneDeep(this.props.style);
        if (!_.isEmpty(styles)) {
            styles.content.width = '40%';
        }
        const t = this.props.t;
            return (
                <Modal
                   isOpen={this.props.isOpen}
                   onRequestClose={this.props.onRequestClose}
                   style={styles}
                   contentLabel="Example Modal">
                        <span className="close-modal-icon" onClick={this.props.onRequestClose}>X</span>
                            <p className="dashboard-modal-field-dropdown">{this.props.label ? this.props.label : t('New Value')}:</p>
                            <Form.Group as={Col} controlId="formGridState" className="dashboard-modal-field-dropdown">
                            <Form.Control as="select" style={{width: '55%', display: 'inline', marginTop: '20px', textOverflow: 'ellipsis'}}>
                                <option>{'404 - Error Number 404 Description'}</option>
                                <option>{'405 - Error Number 404 Description'}</option>
                                <option>{'406 - Error Number 404 Description'}</option>
                                <option>{'407 - Error Number 404 Description'}</option>
                                <option>{'408 - Error Number 404 Description'}</option>
                                <option>{'409 - Error Number 404 Description'}</option>
                                <option>{'410 - Error Number 404 Description'}</option>
                                <option>{'411 - Error Number 404 Description'}</option>
                                <option>{'412 - Error Number 404 Description'}</option>
                            </Form.Control>
                            </Form.Group>
                            <div>
                                <Button variant="outline-primary" style={{marginTop: '20px', marginLeft: '10px'}} onClick={this.editNumber}>{t('Submit')}</Button>
                            </div>
                </Modal>
            )
    }
}

Modal.setAppElement('#root');
export default DropdownModal;