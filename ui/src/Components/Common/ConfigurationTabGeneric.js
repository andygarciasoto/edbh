import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { reorder, move, getItemStyle, id2List, getListStyleDrop } from '../../Utils/ConfigurationTabHelper.js';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import _ from 'lodash';

class ConfigurationTabGeneric extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            allTabsCheckBox: false,
            availableListTabs: props.availableListTabs,
            selectedListTabs: props.selectedListTabs,
            currentTab: 'configuration',
            allTabs: props.availableListTabs,
            height: props.height
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (!_.isEqual(nextProps.availableListTabs, prevState.availableListTabs) ||
            !_.isEqual(nextProps.selectedListTabs, prevState.selectedListTabs) || !_.isEqual(nextProps.selectedAction, prevState.selectedAction)) {
            return {
                availableListTabs: nextProps.availableListTabs,
                selectedListTabs: nextProps.selectedListTabs,
                height: (nextProps.height !== null ? nextProps.height : '350px')
            }
        }
        else return null
    }

    onDragEnd = (result) => {
        const { source, destination } = result;
        // dropped outside the list
        if (!destination) {
            return;
        }
        if (source.droppableId === destination.droppableId) {
            const selectedListTabs = reorder(
                this.getList(source.droppableId),
                source.index,
                destination.index
            );
            let state = { selectedListTabs };
            if (source.droppableId === 'droppable') {
                state = { availableListTabs: selectedListTabs };
            }
            this.setState(state);
        } else {
            const result = move(
                this.getList(source.droppableId),
                this.getList(destination.droppableId),
                source,
                destination
            );
            this.props.onUpdateTabsImported(result.droppable, result.droppable2);
        }
    };

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.checked;
        this.setState({ allTabsCheckBox: value }, () => {
            if (value) {
                this.props.importAllTabs();
            } else {
                this.props.resetTabs();
            }
        })
    };

    getRenderItem = (items) => (provided, snapshot, rubric) => (
        <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            className='draggable'
        >
            {items[rubric.source.index].content}
        </div>
    );

    getList = id => this.state[id2List[id]];

    render() {
        return (
            <React.Fragment>
                <DragDropContext onDragEnd={this.onDragEnd}>
                    <br />
                    <Row>
                        <Col md={6}>
                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-10 no-padding">
                                <label>
                                    {this.props.t('Available ' + this.props.genericTitle) + ':'}
                                </label>
                            </div>
                            <Droppable droppableId="droppable"
                                renderClone={this.getRenderItem(this.state.availableListTabs)}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        style={getListStyleDrop(snapshot.isDraggingOver, this.state.height)}>
                                        {this.state.availableListTabs.map((item, index) => (
                                            <Draggable
                                                key={item.id}
                                                draggableId={item.id}
                                                index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={getItemStyle(
                                                            snapshot.isDragging,
                                                            provided.draggableProps.style
                                                        )}>
                                                        {item.content}
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </Col>
                        <Col md={6}>
                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-10 no-padding">
                                <label>
                                    {this.props.t('Selected ' + this.props.genericTitle) + ':'}
                                </label>
                            </div>
                            <Droppable droppableId="droppable2"
                                renderClone={this.getRenderItem(this.state.selectedListTabs)}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        style={getListStyleDrop(snapshot.isDraggingOver, this.state.height)}>
                                        {this.state.selectedListTabs.map((item, index) => (
                                            <Draggable
                                                key={item.id}
                                                draggableId={item.id}
                                                index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={getItemStyle(
                                                            snapshot.isDragging,
                                                            provided.draggableProps.style
                                                        )}>
                                                        {item.content}
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </Col>
                    </Row>
                </DragDropContext>
            </React.Fragment>
        )
    }
};

export default ConfigurationTabGeneric;
