import _ from 'lodash';
import moment from 'moment-timezone';

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

        if (item['summary_setup_minutes'] < 0 ){
            item['summary_setup_minutes'] = 0;
        }
        if (item['summary_breakandlunch_minutes'] < 0 ){
            item['summary_breakandlunch_minutes'] = 0;
        }
    })
    return obj;
}

function structureMachines(obj) {
    const machineStruct = Object.values(obj)[0].Asset;
    return JSON.parse(machineStruct);
}

function createUnallocatedTime(obj) {
    obj.map((item, index) => {
        console.log(item);
        var base = moment(item.hour_interval_start).hours();
        var current = moment().tz("America/New_York").hours();
        var totalTime = item.summary_breakandlunch_minutes ? 60 - item.summary_breakandlunch_minutes : 60;
        var newIdeal = 0;
        var minutes = moment().minutes();

        if ((item.production_id === '') || item.production_id === undefined){
            item['unallocated_time'] = totalTime;
        } 
        else if (item.summary_actual >= item.summary_ideal) {
            item['unallocated_time'] = 0;
        }
        else if (base === current){
            if (minutes > item.summary_breakandlunch_minutes){
                newIdeal = item.summary_ideal * ((minutes - item.summary_breakandlunch_minutes)/(totalTime));
                if (item.summary_actual < newIdeal){
                var idealTimeForPart = totalTime/item.summary_ideal;
                var minimumTime = newIdeal * idealTimeForPart;
                var actualTimeForPart = item.summary_actual * idealTimeForPart;
                item['unallocated_time'] = Math.round(minimumTime - actualTimeForPart);
                }else{
                    item['unallocated_time'] = 0;
                }
            }else{
                item['unallocated_time'] = 0;
            }
        }
        else {
            if (item.summary_actual === 0){
                item['unallocated_time'] = totalTime;    
            }else{
                var idealTimeForPart = totalTime/item.summary_ideal;
                var actualTimeForPart = item.summary_actual * idealTimeForPart;
                item['unallocated_time'] = Math.round(totalTime - actualTimeForPart);
        }
    }
        item['allocated_time'] = item['unallocated_time'] - /*(item.summary_setup_minutes + item.summary_breakandlunch_minutes +*/ item.timelost_summary;
        if (item['allocated_time'] < 0){
            item['allocated_time'] = 0;
        }
    })
    return obj;
}

export { restructureSQLObject, replaceFieldNames, nameMapping, restructureSQLObjectByContent, createLatestComment, createTimelossSummary, structureMachines, createUnallocatedTime };7