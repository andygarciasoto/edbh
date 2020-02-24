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
                newItem['setup_scrap'] = prod.setup_scrap;
                newItem['other_scrap'] = prod.other_scrap;
                newItem['adjusted_actual'] = prod.adjusted_actual;
                newItem['order_number'] = prod.order_number;
                newItem['start_time'] = prod.start_time;
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
            item['setup_scrap'] = 0;
            item['other_scrap'] = 0;
            item['adjusted_actual'] = 0;
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
    setup_scrap: "setup_scrap",
    other_scrap: "other_scrap",
    adjusted_actual: "adjusted_actual",
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
            item['latest_comment'] = _.sortBy(item.actions_comments, 'commentdata_id').reverse()[0].comment;
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

        if (item['summary_setup_minutes'] < 0) {
            item['summary_setup_minutes'] = 0;
        }
        if (item['summary_breakandlunch_minutes'] < 0) {
            item['summary_breakandlunch_minutes'] = 0;
        }
    })
    return obj;
}

function structureMachines(obj) {
    const machineStruct = Object.values(obj)[0].Asset;
    return JSON.parse(machineStruct);
}

function createUnallocatedTime(obj, tz, dt) {
    obj.map((item, index) => {
        var base = moment(item.hour_interval_start).hours();
        var current = tz;
        var day = moment(dt, 'YYYYMMDD').format('YYYYMMDD');
        var today = moment().format('YYYYMMDD');
        var lunch_setup = item.summary_setup_minutes + item.summary_breakandlunch_minutes;
        var totalTime = lunch_setup ? 60 - lunch_setup : 60;
        if (totalTime < 0) {
            totalTime = 0;
        }
        if (lunch_setup > 60) {
            lunch_setup = 60;
        }
        var newIdeal = 0;
        var minutes = moment().minutes();

        if ((item.production_id === '') || item.production_id === undefined) {
            item['unallocated_time'] = base == current && today == day ? minutes : totalTime + lunch_setup;
        }
        else if (item.summary_actual >= item.summary_ideal) {
            item['unallocated_time'] = 0;
        }
        else if (base == current && day == today) {
            if (minutes > lunch_setup) {
                newIdeal = item.summary_ideal * ((minutes - lunch_setup) / (totalTime));
                if (item.summary_actual < newIdeal) {
                    var idealTimeForPart = totalTime / item.summary_ideal;
                    var minimumTime = newIdeal * idealTimeForPart;
                    var actualTimeForPart = item.summary_actual * idealTimeForPart;
                    if (Math.round(minimumTime - actualTimeForPart) > minutes){
                        item['unallocated_time'] = minutes;    
                    }else{
                    item['unallocated_time'] = Math.round(minimumTime - actualTimeForPart);
                }
                } else {
                    item['unallocated_time'] = 0;
                }
            } else {
                item['unallocated_time'] = 0;
            }
        }
        else {
            if (item.summary_actual === 0) {
                item['unallocated_time'] = totalTime;
            } else {
                var idealTimeForPart = totalTime / item.summary_ideal;
                var actualTimeForPart = item.summary_actual * idealTimeForPart;
                item['unallocated_time'] = Math.round(totalTime - actualTimeForPart);
            }
        }
        item['allocated_time'] = item['unallocated_time'] - (lunch_setup + item.timelost_summary);
        if (item['allocated_time'] < 0) {
            item['allocated_time'] = 0;
        }
        if (item['unallocated_time'] > 60) {
            item['unallocated_time'] = 60;
        }
    })
    return obj;
}

function createUnallocatedTime2(obj, tz, dt) {
    let actualElement = null;
    let actualUnallocatedTime = null;
    let actualAllocatedTime = null;
    obj.map((item, index) => {
        if (actualElement === null || actualElement.dxhdata_id === null || actualElement.dxhdata_id !== item.dxhdata_id && actualElement.started_on_chunck !== item.started_on_chunck) {
            actualElement = item;
            console.log(item);
            actualUnallocatedTime = actualElement.unallocated_time;
            actualAllocatedTime = actualElement.allocated_time;
            var base = moment(item.started_on_chunck).hours();
            var current = tz;
            var day = moment(dt, 'YYYYMMDD').format('YYYYMMDD');
            var today = moment().format('YYYYMMDD');
            var lunch_setup = item.summary_setup_minutes + item.summary_breakandlunch_minutes;
            var totalTime = lunch_setup ? 60 - lunch_setup : 60;
            if (totalTime < 0) {
                totalTime = 0;
            }
            if (lunch_setup > 60) {
                lunch_setup = 60;
            }
            var newIdeal = 0;
            var minutes = moment().minutes();

            if ((item.productiondata_id === '') || item.productiondata_id === undefined || item.productiondata_id === null) {
                actualUnallocatedTime = base == current && today == day ? minutes : totalTime + lunch_setup;
            }
            else if (Math.round(item.summary_adjusted_actual) >= Math.round(item.summary_ideal)) {
                actualUnallocatedTime = 0;
            }
            else if (base == current && day == today) {
                if (minutes > lunch_setup) {
                    newIdeal = item.summary_ideal * ((minutes - lunch_setup) / (totalTime));
                    if (item.summary_adjusted_actual < Math.round(newIdeal)) {
                        var idealTimeForPart = totalTime / item.summary_ideal;
                        var minimumTime = newIdeal * idealTimeForPart;
                        var actualTimeForPart = item.summary_adjusted_actual * idealTimeForPart;
                        actualUnallocatedTime = Math.round(minimumTime - actualTimeForPart);
                    } else {
                        actualUnallocatedTime = 0;
                    }
                } else {
                    actualUnallocatedTime = 0;
                }
            } else {
                if (item.summary_adjusted_actual === 0) {
                    actualUnallocatedTime = totalTime;
                } else {
                    var idealTimeForPart = totalTime / item.summary_ideal;
                    var actualTimeForPart = item.summary_adjusted_actual * idealTimeForPart;
                    actualUnallocatedTime = Math.round(totalTime - actualTimeForPart);
                }
            }
            actualAllocatedTime = actualUnallocatedTime - (lunch_setup + item.timelost_summary);
            if (actualAllocatedTime < 0) {
                actualAllocatedTime = 0;
            }
            if (actualUnallocatedTime > 60) {
                actualUnallocatedTime = 60;
            }
            actualElement.unallocated_time = actualUnallocatedTime;
            actualElement.allocated_time = actualAllocatedTime;
        } else {
            item.unallocated_time = actualUnallocatedTime;
            item.allocated_time = actualAllocatedTime;
        }
    });
    return obj;
}

export { restructureSQLObject, replaceFieldNames, nameMapping, restructureSQLObjectByContent, createLatestComment, createTimelossSummary, structureMachines, createUnallocatedTime, createUnallocatedTime2 };