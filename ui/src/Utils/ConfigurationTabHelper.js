export const dataToolTabs = [
    { value: 0, label: 'Configuration' },
    //{ value: 1, label: 'Settings' }
];

// a little function to help us with reordering the result
export const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

/**
 * Moves an item from one list to another list.
 */
export const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
};

export const grid = 8;

export const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,

    // change background colour if dragging
    background: isDragging ? '#FFE600' : '#FFE600',
    ...draggableStyle
});

export const getListStyle = isDraggingOver => ({
    background: isDraggingOver ? '#c0c0c0' : '#c0c0c0',
    padding: grid,
    width: '90%',
    height: 250,
    overflowY: "scroll",
    maxHeight: 250,
    position: "relative"

});

export const getListStyleDrop = (isDraggingOver, height) => ({
    background: isDraggingOver ? '#c0c0c0' : '#c0c0c0',
    padding: grid,
    width: '90%',
    height: height,
    overflowY: "scroll",
    maxHeight: 350,
    position: "relative"

});

export const id2List = {
    droppable: 'availableListTabs',
    droppable2: 'selectedListTabs'
};