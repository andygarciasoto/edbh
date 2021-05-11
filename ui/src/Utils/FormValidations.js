import _ from 'lodash';

function validateScrapSubmit(state, type) {

    let validation = {};

    if (!state.selectedReason) {
        validation.error = true;
        validation.modal_message = 'You need to select a ' + type + ' scrap reason';
    } else if (state.quantityValue === 0) {
        validation.error = true;
        validation.modal_message = 'You need to define a ' + type + ' scrap value';
    }

    return validation;
}

function validateTimeLostSubmit(state) {

    let validation = {};

    if (!state.selectedReason) {
        validation.error = true;
        validation.modal_message = 'You need to select a reason';
    } else if (state.quantityValue === 0) {
        validation.error = true;
        validation.modal_message = 'You need to define a reason value';
    }

    return validation;
}

function validateShiftsForm(state) {
    let validation = {};
    const sequenceShift = _.find(state.shiftsArray, { shift_sequence: parseInt(state.shift_sequence, 10) });
    const firstShift = _.find(state.shiftsArray, { is_first_shift_of_day: true });
    if (state.shift_name.trim() === '') {
        validation.shift_name = 'Name is required';
    } else if (!_.isEmpty(sequenceShift)) {
        if (!state.shift_id || (state.shift_id && sequenceShift.shift_id !== parseInt(state.shift_id, 10))) {
            validation.shift_sequence = 'The sequence already exists';
        }
    } else if (state.start_time.trim() === '') {
        validation.start_time = 'Start Time is required';
    } else if (state.end_time.trim() === '') {
        validation.end_time = 'End Time is required';
    } else if (state.is_first_shift_of_day && !_.isEmpty(firstShift)) {
        if (!state.shift_id || (state.shift_id && firstShift.shift_id !== parseInt(state.shift_id, 10))) {
            validation.is_first_shift_of_day = 'The first shift already exists';
        }
    }

    return validation;
}

export {
    validateScrapSubmit,
    validateTimeLostSubmit,
    validateShiftsForm
}