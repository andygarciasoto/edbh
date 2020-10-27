

function validateScrapSubmit(state, type) {

    let validation = {};

    if (type === 'setup') {
        if (state.setupScrapOption === '') {
            validation.error = true;
            validation.modal_message = 'You need to select a setup scrap reason';
        } else if (state.setupScrapValue === 0) {
            validation.error = true;
            validation.modal_message = 'You need to define a setup scrap value';
        }
    } else {
        if (state.productionScrapOption === '') {
            validation.error = true;
            validation.modal_message = 'You need to select a production scrap reason';
        } else if (state.productionScrapValue === 0) {
            validation.error = true;
            validation.modal_message = 'You need to define a production scrap value';
        }
    }

    return validation;
}

export {
    validateScrapSubmit
}