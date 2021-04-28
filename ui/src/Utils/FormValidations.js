import _ from 'lodash';
import moment from 'moment-timezone';

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
        validation.siteCode = 'This value is required. Generally this is the Parker Hannifin 3 or 4 digit location identifier';
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

function validateBreakForm(state, props) {
    let validation = {};
    if (state.unavailable_name.trim() === '') {
        validation.unavailable_name = 'Name is required';
    }
    if (state.start_time.trim() === '') {
        validation.start_time = 'Start Time is required';
    }
    if (state.end_time.trim() === '') {
        validation.end_time = 'End Time is required';
    }
    if (_.isEmpty(state.selectedListTabs)) {
        validation.selectedListTabs = 'Asset is required';
    }
    let startTime = moment('1970-01-01 ' + state.start_time);
    let endTime = moment('1970-01-01 ' + state.end_time);
    if (startTime.isAfter(endTime)) {
        validation.start_time = 'Start Time needs to be greater than End Time';
    }
    if (props.action === 'Create' && _.isEmpty(state.selectedListTabs)) {
        validation.selectedListTabs = 'Asset is required';
    }
    return validation;
}

function validateTagForm(state, props) {
    let validation = {};
    if (state.name.trim() === '') {
        validation.name = 'Name is required';
    }
    if (state.rollover === '') {
        validation.rollover = 'Rollover Point is required';
    } else if (parseInt(state.rollover, 10) < 1) {
        validation.rollover = 'Rollover Point needs to be greater than 0';
    }
    if (state.max_change === '') {
        validation.max_change = 'Max Change Point is required';
    } else if (parseInt(state.max_change, 10) < 1) {
        validation.max_change = 'Max Change Point needs to be greater than 0';
    }
    if (props.action === 'Create' && state.asset === 0) {
        validation.asset = 'Asset is required';
    }
    return validation;
}

function validateReasonForm(state, props) {
    let validation = {};
    if (state.name.trim() === '') {
        validation.name = 'Name is required';
    }
    if (state.type === 'Scrap' && state.level.trim() === '') {
        validation.level = 'Level is required for Scrap Type';
    }
    if (props.action === 'Create' && _.isEmpty(state.selectedListTabs)) {
        validation.selectedListTabs = 'Asset is required';
    }
    return validation;
}

function generalValidationForm(state) {
    let validation = {};
    if (state.name.trim() === '') {
        validation.name = 'Name is required';
    }
    return validation;
}

function validateAssetForm(state, props) {
    let validation = {};
    if (state.name.trim() === '') {
        validation.name = 'Name is required';
    }
    if (state.defaultPercent === '' || parseInt(state.defaultPercent, 10) < 0) {
        validation.defaultPercent = 'Target Percentage of Ideal needs to be equals or greater than 0';
    }
    if (props.action !== 'Edit' && state.level === 'Site' && state.siteCode.trim() === '') {
        validation.siteCode = 'This value is required. Generally this is the Parker Hannifin 3 or 4 digit location identifier';
    }
    if (props.level !== 'Site' && state.parent_code.trim() === '') {
        validation.parent_code = 'This value is required';
    }
    return validation;
}

function validateEscalationCreateForm(state) {
    let validation = {};
    if (state.name_es_1.trim() === '') {
        validation.name_es_1 = 'Name is required';
    }
    if (state.name_es_2.trim() === '') {
        validation.name_es_2 = 'Name is required';
    }
    if (state.name_es_3.trim() === '') {
        validation.name_es_3 = 'Name is required';
    }
    if (state.hours_es_1 === '') {
        validation.hours_es_1 = 'Hours is required';
    } else if (parseInt(state.hours_es_1, 10) < 1) {
        validation.hours_es_1 = 'Hour needs to be equals or greater than 1';
    }
    if (state.hours_es_2 === '') {
        validation.hours_es_2 = 'Hours is required';
    } else if (parseInt(state.hours_es_2, 10) < 1) {
        validation.hours_es_2 = 'Hour needs to be equals or greater than 1';
    }
    if (state.hours_es_3 === '') {
        validation.hours_es_3 = 'Hours is required';
    } else if (parseInt(state.hours_es_3, 10) < 1) {
        validation.hours_es_3 = 'Hour needs to be equals or greater than 1';
    }
    return validation;
}

function validateDisplayForm(state, props) {
    let validation = {};
    if (state.name.trim() === '') {
        validation.name = 'Name is required';
    }
    if (props.action === 'Create' && state.asset === 0) {
        validation.asset = 'Asset is required';
    }
    return validation;
}

export {
    validateScrapSubmit,
    validateTimeLostSubmit,
    validateShiftsForm,
    validateCommonParametersForm,
    validateUserForm,
    validateBreakForm,
    validateTagForm,
    validateReasonForm,
    generalValidationForm,
    validateAssetForm,
    validateEscalationCreateForm,
    validateDisplayForm
}