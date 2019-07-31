import _ from 'lodash';
import { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } from 'constants';

function restructureSQLObject(obj, format) {
    var newArray = [];
    if (format === 'format1') {
        obj.map((item, key) => {
            let newObj = Object.assign(item.hour);
            newObj.comments = item.comment;
            newObj.production = item.production;
            newObj.timelost = item.timelost;
            newArray.push(newObj);
        })
    } else if (format === 'format2') {
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
                newItem['product_code'] = prod.product_code;
                newItem['ideal'] = prod.ideal;
                newItem['target'] = prod.target;
                newItem['actual'] = prod.actual;
                newItem['order_number'] = prod.order_number;
                newArray.push(newItem);
                delete newItem.production;
            }
        )} else {
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
    hour_interval : "hour_interval",
    product_code : "part_number",
    ideal : "ideal",
    target : "target_pcs",
    actual : "actual_pcs",
    cumulative_target : "cumulative_target_pcs",
    cumulative_actual : "cumulative_pcs",
    timelost : "timelost", // get the latest time lost or calculate the total
    dtreason_code : "timelost_reason_code",
    comment : "actions_comments",
    operator_signoff : "oper_id",
    supervisor_signoff : "superv_id"
}

function createLatestComment(obj) {
    obj.map((item, index) => {
        if (item.actions_comments) {
            item['latest_comment'] = item.actions_comments[0].comment;
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
        item['timelost_summary'] = summary;
        item['latest_timelost_code'] = item.timelost !== null ? item.timelost[0].dtreason_code : null;
    })
    return obj;
}

export {restructureSQLObject, replaceFieldNames, nameMapping, restructureSQLObjectByContent, createLatestComment, createTimelossSummary};