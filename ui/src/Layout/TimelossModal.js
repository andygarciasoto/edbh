import React from  'react';
import Modal from 'react-modal';
import { Form, Button, Row, Col, Table } from 'react-bootstrap';
import * as _ from  'lodash';
import './TimelossModal.scss';
import ReactSelect from 'react-select';
import { timelossGetReasons as getReasons } from '../Utils/Requests';



class TimelossModal extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
            value : this.props.currentVal,
            newValue: '',
            break_time: 0,
            setup_time: 0,
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
    

    componentWillMount() {
        const reasons = getReasons(this.props.machine);
        reasons.then((res) => this.setState({
            reasons: res,
            timelost: this.props.timelost,
        }))
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.hour){
        const total =  this.calculateTotal(
            nextProps, 
            nextProps.hour.summary_setup_minutes, 
            nextProps.hour.summary_breakandlunch_minutes);
        this.setState({
            timelost: nextProps.timelost,
            allocated_time: total,
            unallocated_time: 60 - total,
        })
        if (nextProps.hour) {
            this.setState({
                setup_time: nextProps.hour.summary_setup_minutes || 0,
                break_time: nextProps.hour.summary_breakandlunch_minutes || 0
            })
        }
        }
    }

    calculateTotal(nextProps, setupTime, breakTime) {
        let allocated_time = setupTime + breakTime;
        if (nextProps.timelost) {
            for (let i of nextProps.timelost) {
                allocated_time = allocated_time + i.dtminutes;
            }
        }
        return allocated_time;
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
                        style={{marginTop: '20px', textAlign: 'center'}}
                        <Row className="new-timeloss-data" style={{marginBottom: '5px'}}>
                            <Col sm={4} md={4} className="total-timeloss number-field timeloss-top">
                                <p>{t('Total Timelost')}</p>
                                <input type="text" disabled={true} value={this.state.allocated_time}></input>
                            </Col>
                            <Col sm={4} md={4} className="breaktime-timeloss number-field timeloss-top">
                                <p>{t('Lunch/Break Time')}</p>
                                <input type="text" disabled={true} value={this.state.break_time}></input>
                            </Col>
                            <Col sm={4} md={4} className="setup-timeloss number-field timeloss-top">
                                <p>{t('Planned Setup Time')}</p>
                                <input type="text" disabled={true} value={this.state.setup_time}></input>
                            </Col>
                        </Row>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                <th style={{width: '10%'}}>{t('Time')}</th>
                                <th style={{width: '20%'}}>{t('Timelost Code')}</th>
                                <th style={{width: '40%'}}>{t('Reason')}</th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                this.state.timelost ? this.state.timelost.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{item.dtminutes}</td>
                                            <td>{item.dtreason_code}</td>
                                            <td>{item.dtreason_name}</td>
                                        </tr>) 
                                }): <tr>
                                    <td colSpan={3}>{'No Timelost entries yet.'}</td>
                                </tr>
                             }
                            </tbody>
                        </Table>
                            <span className={"new-timelost-label"}>{t('New Timelost Entry')}</span>
                            <div className="new-timeloss">
                                <Row style={{marginBottom: '1px'}}>
                                    <Col sm={4} md={4}>
                                        <p style={{marginBottom: '1px'}}>{`${t('Unallocated Timelost')}:`}</p>
                                        <input className={'timelost-field'} type="text" disabled={true} value={this.state.unallocated_time}></input>
                                    </Col>
                                    <Col sm={4} md={4}  style={{marginBottom: '5px'}}>
                                        <p style={{marginBottom: '1px'}}>{`${t('Time to allocate (minutes)')}:`}</p>
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
                                            {
                                            this.state.reasons ? this.state.reasons.map((reason, index) => {
                                                const item = reason.DTReason;
                                                return (<option key={index}>{`${item.reason_code} - ${item.dtreason_name}`}</option>)

                                            })
                                        : null}
                                    </Form.Control>
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