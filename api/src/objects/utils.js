import _ from 'lodash';

function restructureSQLObject(obj, format) {
    var newArray = [];
    if (format === 'primitive_shif') {
        obj.map((item, key) => {
            let newObj = Object.assign(item.hour);
            newObj.comments = item.comment;
            newObj.production = item.production;
            newObj.timelost = item.timelost;
            newArray.push(newObj);
        })
    } else if (format === 'shift') {
        obj.map((item, key) => {
            item = Object.values(item)[0];
            newArray.push(item);
        })
    } else if (format === 'communication') {
        obj.map((item, key) => {
            item = Object.values(item)[0];
            newArray.push(item);
        })
    }
    return newArray;
}

function restructureSQLObjectByContent(obj) {
    var newArray = [];
    obj.map((item, key) => {
        if (item.production !== null && item.production) {
            item.production.map((prod, index) => {
                const newItem = _.cloneDeep(item);
                newItem['production_id'] = prod.productiondata_id;
                newItem['product_code'] = prod.product_code;
                newItem['ideal'] = prod.ideal;
                newItem['target'] = prod.target;
                newItem['actual'] = prod.actual;
                newItem['order_number'] = prod.order_number;
                newItem['routed_cycle_time'] = prod.routed_cycle_time;
                newArray.push(newItem);
                delete newItem.production;
            }
            )
        } else {
            item['product_code'] = '';
            item['ideal'] = '';
            item['target'] = '';
            item['actual'] = '';
            item['order_number'] = '';
            delete item.production;
            newArray.push(item);
        }
    })
    return newArray;
}

function replaceFieldNames(obj, mapping) {
    var newObjArray = [];
    obj.map((objItem, index1) => {
        const keyValues = Object.keys(objItem).map(key => {
            const newKey = mapping[key] || key;
            return { [newKey]: objItem[key] };
        });
        newObjArray.push(Object.assign({}, ...keyValues));
    })
    return newObjArray;
}

var nameMapping = {
    hour_interval: "hour_interval",
    ideal: "ideal",
    target: "target_pcs",
    actual: "actual_pcs",
    cumulative_target: "cumulative_target_pcs",
    cumulative_actual: "cumulative_pcs",
    timelost: "timelost", // get the latest time lost or calculate the total
    dtreason_code: "timelost_reason_code",
    comment: "actions_comments",
    operator_signoff: "oper_id",
    supervisor_signoff: "superv_id"
}

function createLatestComment(obj) {
    obj.map((item, index) => {
        if (item.actions_comments) {
            item['latest_comment'] = _.sortBy(item.actions_comments, 'last_modified_on').reverse()[0].comment;
        }
    })
    return obj;
}

function createTimelossSummary(obj) {
    obj.map((item, index) => {
        let summary = 0;
        if (item.timelost) {
            item.timelost.map((loss, indexB) => {
                summary = summary + loss.dtminutes;
            })
        }
        item['timelost_summary'] = summary === 0 ? null : summary;
        item['latest_timelost_code'] = item.timelost !== null ? item.timelost[0].dtreason_code : null;
    })
    return obj;
}

function structureMachines(obj) {
    const machines = [];
    obj.map((item, index) => {
        let machineObj = {};
        machineObj.asset_id = item.asset_id,
            machineObj.asset_code = item.asset_code,
            machineObj.asset_name = item.asset_name,
            machineObj.asset_description = item.asset_description,
            machineObj.asset_level = item.asset_level,
            machineObj.site_code = item.site_code,
            machineObj.parent_asset_code = item.parent_asset_code
        machines.push(machineObj);
    })
    return machines;
}

function createUnallocatedTime(obj) {
    obj.map((item, index) => {
        if (item.actual_pcs >= item.ideal) {
            item['unallocated_time'] = 0;
        } else {
            item['unallocated_time'] = ((item.ideal - item.actual_pcs) * item.routed_cycle_time) / 60;
        }
    })
    return obj;
}

export { restructureSQLObject, replaceFieldNames, nameMapping, restructureSQLObjectByContent, createLatestComment, createTimelossSummary, structureMachines, createUnallocatedTime };