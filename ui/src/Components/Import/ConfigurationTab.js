import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { reorder, move, getItemStyle, id2List, getListStyleDrop } from '../../Utils/ConfigurationTabHelper.js';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import _ from 'lodash';

class ConfigurationTab extends React.Component {

    constructor(props) {
        super(props);
        this["_isMounted"] = false;
        this.state = {
            allTabsCheckBox: false,
            availableListTabs: props.availableListTabs,
            selectedListTabs: props.selectedListTabs,
            currentTab: 'configuration',
            allTabs: props.availableListTabs,
            selectedAction: props.selectedAction,
            height: props.height
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            availableListTabs: nextProps.availableListTabs,
            selectedListTabs: nextProps.selectedListTabs,
            selectedAction: nextProps.selectedAction,
            allTabsCheckBox: nextProps.selectedAction === 'Export' ? true : (nextProps.selectedAction === 'Import' && _.isEmpty(nextProps.selectedListTabs) ? false : this.state.allTabsCheckBox),
            height: (nextProps.height !== null ? nextProps.height : '350px')
        });
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

    getList = id => this.state[id2List[id]];

    render() {
        return (
            <React.Fragment>
                <Row className='show-grid'>
                    <Col md={12}>
                        <label>{this.props.t('Please choose the Configuration Items to') + ' ' + this.props.t(this.state.selectedAction)}</label>
                    </Col>
                    <Col>
                        <label>{this.props.t('All Configuration Items') + ': '}
                            <input id="allTabs" type="checkbox" checked={this.state.allTabsCheckBox} onChange={this.handleInputChange} disabled={this.state.selectedAction === 'Export'} style={{ marginLeft: "5px" }} />
                        </label>
                    </Col>
                </Row>
                <DragDropContext onDragEnd={this.onDragEnd}>
                    <br />
                    <Row>
                        <Col md={6}>
                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-10 no-padding">
                                <label>
                                    {this.props.t('Available Configuration Items') + ':'}
                                </label>
                            </div>
                            <Droppable droppableId="droppable" isDropDisabled={this.state.selectedAction === 'Export'}>
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
                                    {this.props.t('Selected Configuration Items to') + ' ' + this.props.t(this.state.selectedAction) + ':'}
                                </label>
                            </div>
                            <Droppable droppableId="droppable2" isDropDisabled={this.state.selectedAction === 'Export'}>
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

export default ConfigurationTab;
