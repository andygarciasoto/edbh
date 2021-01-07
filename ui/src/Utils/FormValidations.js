

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

export {
    validateScrapSubmit,
    validateTimeLostSubmit
}