import _ from 'lodash';

function getDtReason(resons) {
    let newOptions = [];
    _.forEach(resons, reason => {
        newOptions.push({ value: reason.dtreason_code, label: `${reason.dtreason_code} - ${reason.dtreason_name}`, dtreason_id: reason.dtreason_id });
    });
    return newOptions;
}

export {
    getDtReason
}