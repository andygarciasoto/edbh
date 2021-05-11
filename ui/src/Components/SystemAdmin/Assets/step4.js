import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as BreakActions from '../../../redux/actions/breakActions';
import { Form, Col } from 'react-bootstrap';
import { reorder, move, getItemStyle, ReasonList, getListStyleDrop } from '../../../Utils/ConfigurationTabHelper';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export class Step4 extends Component {
	constructor(props) {
		super(props);
		this.state = {
			ReasonData: [],
			addReason: false,
			editReason: false,
			shift_id: 0,
			selected: [],
		};
	}

	componentDidMount() {
		const { actions } = this.props;

		return actions.getBreak(this.props.user.site).then((response) => {
			this.setState({
				ReasonData: response,
			});
		});
	}

	onDragEnd = (result) => {
		const { source, destination } = result;

		// dropped outside the list
		if (!destination) {
			return;
		}

		if (source.droppableId === destination.droppableId) {
			const selected = reorder(this.getList(source.droppableId), source.index, destination.index);

			let state = { selected };

			if (source.droppableId === 'droppable') {
				state = { ReasonData: selected };
			}

			this.setState(state);
		} else {
			const result = move(
				this.getList(source.droppableId),
				this.getList(destination.droppableId),
				source,
				destination
			);

			this.setState({
				ReasonData: result.droppable,
				selected: result.droppable2,
			});
		}
	};

	getList = (id) => this.state[ReasonList[id]];

	render() {
		return (
			<div>
				<DragDropContext onDragEnd={this.onDragEnd}>
					<form>
						<Form.Row>
							<Col>
								<label>Available Break/Lunch</label>
								<Droppable droppableId="droppable">
									{(provided, snapshot) => (
										<div ref={provided.innerRef} style={getListStyleDrop(snapshot.isDraggingOver)}>
											{this.state.ReasonData.map((item, index) => (
												<Draggable
													key={item.unavailable_code}
													draggableId={item.unavailable_code}
													index={index}
												>
													{(provided, snapshot) => (
														<div
															ref={provided.innerRef}
															{...provided.draggableProps}
															{...provided.dragHandleProps}
															style={getItemStyle(
																snapshot.isDragging,
																provided.draggableProps.style
															)}
														>
															{item.unavailable_name}
														</div>
													)}
												</Draggable>
											))}
											{provided.placeholder}
										</div>
									)}
								</Droppable>
							</Col>
							<Col >
              <label>Selected Break/Lunch</label>
								<Droppable droppableId="droppable2">
									{(provided, snapshot) => (
										<div ref={provided.innerRef} style={getListStyleDrop(snapshot.isDraggingOver)}>
											{this.state.selected.map((item, index) => (
												<Draggable key={item.unavailable_code} draggableId={item.unavailable_code} index={index}>
													{(provided, snapshot) => (
														<div
															ref={provided.innerRef}
															{...provided.draggableProps}
															{...provided.dragHandleProps}
															style={getItemStyle(
																snapshot.isDragging,
																provided.draggableProps.style
															)}
														>
															{item.unavailable_name}
														</div>
													)}
												</Draggable>
											))}
											{provided.placeholder}
										</div>
									)}
								</Droppable>
							</Col>
						</Form.Row>
					</form>
					<button className="button-back" onClick={(e) => this.props.back(e)}>
						{'<<Previous Step'}
					</button>
				</DragDropContext>
			</div>
		);
	}
}
export const mapDispatch = (dispatch) => {
	return {
		actions: bindActionCreators(BreakActions, dispatch),
	};
};

export default connect(null, mapDispatch)(Step4);