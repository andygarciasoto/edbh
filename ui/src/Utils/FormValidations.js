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
    }
    if (!_.isEmpty(sequenceShift)) {
        if (!state.shift_id || (state.shift_id && sequenceShift.shift_id !== parseInt(state.shift_id, 10))) {
            validation.shift_sequence = 'The sequence already exists';
        }
    }
    if (state.start_time.trim() === '') {
        validation.start_time = 'Start Time is required';
    }
    if (state.end_time.trim() === '') {
        validation.end_time = 'End Time is required';
    }
    if (state.is_first_shift_of_day && !_.isEmpty(firstShift)) {
        if (!state.shift_id || (state.shift_id && firstShift.shift_id !== parseInt(state.shift_id, 10))) {
            validation.is_first_shift_of_day = 'The first shift already exists';
        }
    }

    return validation;
}

function validateCommonParametersForm(state) {
    let validation = {};
    if (state.siteCode.trim() === '') {
        validation.siteCode = 'Site Identifier is required';
    } else if (parseInt(state.language_id, 10) === 0) {
        validation.language_id = 'You need to select a Lenguage';
    } else if (parseInt(state.timezone_id, 10) === 0) {
        validation.timezone_id = 'You need to select a Timezone';
    }

    return validation;
}

function validateUserForm(state) {
    let validation = {};
    if (state.badge.trim() === '') {
        validation.badge = 'Badge is required';
    }
    if (state.username.trim() === '') {
        validation.username = 'Username is required';
    }
    if (state.firstname.trim() === '') {
        validation.firstname = 'First Name is required';
    }
    if (state.lastname.trim() === '') {
        validation.lastname = 'Last Name is required';
    }

    return validation;
}

export {
    validateScrapSubmit,
    validateTimeLostSubmit,
    validateShiftsForm,
    validateCommonParametersForm,
    validateUserForm
}