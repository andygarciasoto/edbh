import _ from 'lodash';

function getDtReason(reasons) {
    _.forEach(reasons, reason => {
        reason.label = reason.dtreason_name;
        reason.value = reason.dtreason_id;
    });
    return reasons;
}

export {
    getDtReason
}