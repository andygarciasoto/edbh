import React from  'react';
import Modal from 'react-modal';
import { Form, Button, Row, Col, Table } from 'react-bootstrap';
import * as _ from  'lodash';
import './TimelossModal.scss';


class TimelossModal extends React.Component {
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
            styles.content.width = '50%';
        }
        const t = this.props.t;
            return (
                <Modal
                   isOpen={this.props.isOpen}
                   onRequestClose={this.props.onRequestClose}
                   style={styles}
                   contentLabel="Example Modal">
                        <span className="close-modal-icon" onClick={this.props.onRequestClose}>X</span>
                        <span><h4 style={{marginLeft: '10px'}}>{'Timelost (Minutes)'}</h4></span>
                        <Row className="new-timeloss-data" style={{marginBottom: '5px'}}>
                            <Col sm={4} md={4} className="total-timeloss number-field timeloss-top">
                                <p>{t('Total Timelost')}</p>
                                <input type="text" disabled={true} value={35}></input>
                            </Col>
                            <Col sm={4} md={4} className="breaktime-timeloss number-field timeloss-top">
                                <p>{t('Lunch/Break Time')}</p>
                                <input type="text" disabled={true} value={20}></input>
                            </Col>
                            <Col sm={4} md={4} className="setup-timeloss number-field timeloss-top">
                                <p>{t('Planned Setup Time')}</p>
                                <input type="text" disabled={true} value={0}></input>
                            </Col>
                        </Row>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                <th style={{width: '10%'}}>{t('Time)')}</th>
                                <th style={{width: '20%'}}>{t('Timelost Code')}</th>
                                <th style={{width: '40%'}}>{t('Description')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                    <tr>
                                        <td>{'10'}</td>
                                        <td>{'401'}</td>
                                        <td>{'The machine got broken'}</td>
                                    </tr>
                                    <tr>
                                        <td>{'5'}</td>
                                        <td>{'404'}</td>
                                        <td>{'The machine is getting fixed'}</td>
                                    </tr>
                            </tbody>
                        </Table>
                            <span className={"new-timelost-label"}>{'New Timelost Entry'}</span>
                            <div className="new-timeloss">
                                <Row style={{marginBottom: '1px'}}>
                                    <Col sm={4} md={4}>
                                        <p style={{marginBottom: '1px'}}>{`${t('Unallocated Timelost')}:`}</p>
                                        <input className={'timelost-field'} type="text" disabled={true} value={25}></input>
                                    </Col>
                                    <Col sm={4} md={4}  style={{marginBottom: '5px'}}>
                                        <p style={{marginBottom: '5px'}}>{`${t('Time to allocate (minutes)')}:`}</p>
                                        <input className={'timelost-field'} type="text" value={0} onChange={(e)=>this.setState({new_tl_minutes: e.target.value})}></input>
                                    </Col>
                                    <Col sm={4} md={4}></Col>
                                </Row>
                                <div className="new-timeloss-reasoncode">
                                    <p style={{paddingBottom: '1px', marginBottom: '5px'}}>{this.props.label ? this.props.label : t('New Value')}:</p>
                                    <Form.Group controlId="formGridState">
                                    <Form.Control 
                                        as="select" 
                                        style={{width: '90%', marginTop: '5px', marginBottom: '5px', textOverflow: 'ellipsis'}} 
                                        onSelect={(e)=>this.setState({new_tl_reason: e.target.value})}
                                    >
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
                                    <div style={{marginTop: '10px'}}>
                                        <p style={{paddingBottom: '1px', marginBottom: '5px'}}>{t('Enter Description')}:</p>
                                        <Form.Control style={{paddingTop: '5px', width: '90%'}} type="text" value={this.state.description}></Form.Control>
                                    </div>
                                    </Form.Group>
                                </div>
                                <div className={'new-timeloss-button'}>
                                    <Button variant="outline-primary" style={{marginTop: '10px', marginLeft: '10px'}} onClick={this.editNumber}>{t('Submit')}</Button>
                                </div>
                            </div>
                            <div className={'new-timeloss-close'}>
                                <Button variant="outline-secondary" style={{marginTop: '10px', marginLeft: '10px'}} onClick={this.editNumber}>{t('Close')}</Button>
                            </div>
                </Modal>
            )
    }
}

Modal.setAppElement('#root');
export default TimelossModal;