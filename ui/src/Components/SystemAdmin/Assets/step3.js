import React, { Component } from 'react';
import { Form, Col } from 'react-bootstrap';

export class Step3 extends Component {
	render() {
		return (
			<div>
				<form className="fix-form">
					<Form.Row>
						<Col>
							<label>Available Reasons</label>
							<textarea className="text-reasons available"></textarea>
						</Col>
						<Col className="col-fix">
							<label className="selected-reasons">Selected Reasons</label>
							<textarea className="text-reasons selected"></textarea>
						</Col>
					</Form.Row>
				</form>
				<button className="button-next" onClick={(e) => this.props.nextStep(e)}>
					{'Next Step>>'}
				</button>
				<button className="button-back" onClick={(e) => this.props.back(e)}>
					{'<<Previous Step'}
				</button>
			</div>
		);
	}
}

export default Step3;
