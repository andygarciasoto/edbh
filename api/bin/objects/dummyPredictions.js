"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.data = void 0;
var data = [{
  "dxhdata_id": 1,
  "asset_code": "10832",
  "production_day": "2019-07-25T00:00:00",
  "shift_code": "3",
  "shift_name": "3rd Shift",
  "hour_interval": "11pm - 12am",
  "hour_interval_start": "2019-07-24T23:00:00",
  "hour_interval_end": "2019-07-25T00:00:00",
  "summary_product_code": "1 1/2 X 1 1/2 F47HG-S PS",
  "summary_ideal": 10,
  "summary_target": 9,
  "summary_actual": 9,
  "cumulative_target_pcs": 9,
  "cumulative_pcs": 9,
  "symmary_dtminutes": null,
  "symmary_dtreason_code": null,
  "symmary_dtreason_name": null,
  "symmary_comment": null,
  "oper_id": "AD",
  "operator_signoff_timestamp": "2019-07-25T00:05:00",
  "superv_id": null,
  "supervisor_signoff_timestamp": null,
  "message": null,
  "timelost": null,
  "actions_comments": null,
  "product_code": "1 1/2 X 1 1/2 F47HG-S PS",
  "ideal": 10,
  "target_pcs": 9,
  "actual_pcs": 9,
  "order_number": "12345",
  "timelost_summary": null,
  "latest_timelost_code": null
}, {
  "dxhdata_id": 2,
  "asset_code": "10832",
  "production_day": "2019-07-25T00:00:00",
  "shift_code": "3",
  "shift_name": "3rd Shift",
  "hour_interval": "12am - 1am",
  "hour_interval_start": "2019-07-25T00:00:00",
  "hour_interval_end": "2019-07-25T01:00:00",
  "summary_product_code": "multiple",
  "summary_ideal": 19,
  "summary_target": 17,
  "summary_actual": 14,
  "cumulative_target_pcs": 26,
  "cumulative_pcs": 23,
  "symmary_dtminutes": 7,
  "symmary_dtreason_code": "multiple",
  "symmary_dtreason_name": "multiple",
  "symmary_comment": "multiple",
  "oper_id": "AD",
  "operator_signoff_timestamp": "2019-07-25T01:15:00",
  "superv_id": "FP",
  "supervisor_signoff_timestamp": "2019-07-25T01:25:00",
  "message": null,
  "timelost": [{
    "dtdata_id": 1,
    "dxhdata_id": 2,
    "dtreason_id": 11,
    "dtminutes": 4,
    "dtminutes_provisional": null,
    "dtreason_code": "11",
    "dtreason_name": "Waiting for Raw Material",
    "dtminutes_total": null,
    "dtminutes_breaks": null,
    "dtminutes_setup": null
  }, {
    "dtdata_id": 2,
    "dxhdata_id": 2,
    "dtreason_id": 12,
    "dtminutes": 3,
    "dtminutes_provisional": null,
    "dtreason_code": "12",
    "dtreason_name": "Insert Issue",
    "dtminutes_total": null,
    "dtminutes_breaks": null,
    "dtminutes_setup": null
  }],
  "actions_comments": [{
    "dxhdata_id": 2,
    "comment": "We must of lost some material somewhere",
    "first_name": "Authur",
    "last_name": "Dent",
    "last_modified_on": "2019-07-29T22:48:12.793",
    "message": null
  }, {
    "dxhdata_id": 2,
    "comment": "He dropped them behind the CNC, so I showed him where to find them",
    "first_name": "Ford",
    "last_name": "Prefect",
    "last_modified_on": "2019-07-29T22:48:24.073",
    "message": null
  }],
  "product_code": "1 1/2 X 1 1/2 F47HG-S PS",
  "ideal": 4,
  "target_pcs": 4,
  "actual_pcs": 4,
  "order_number": "12345",
  "latest_comment": "We must of lost some material somewhere",
  "timelost_summary": 7,
  "latest_timelost_code": "11"
}, {
  "dxhdata_id": 2,
  "asset_code": "10832",
  "production_day": "2019-07-25T00:00:00",
  "shift_code": "3",
  "shift_name": "3rd Shift",
  "hour_interval": "12am - 1am",
  "hour_interval_start": "2019-07-25T00:00:00",
  "hour_interval_end": "2019-07-25T01:00:00",
  "summary_product_code": "multiple",
  "summary_ideal": 19,
  "summary_target": 17,
  "summary_actual": 14,
  "cumulative_target_pcs": 26,
  "cumulative_pcs": 23,
  "symmary_dtminutes": 7,
  "symmary_dtreason_code": "multiple",
  "symmary_dtreason_name": "multiple",
  "symmary_comment": "multiple",
  "oper_id": "AD",
  "operator_signoff_timestamp": "2019-07-25T01:15:00",
  "superv_id": "FP",
  "supervisor_signoff_timestamp": "2019-07-25T01:25:00",
  "message": null,
  "timelost": [{
    "dtdata_id": 1,
    "dxhdata_id": 2,
    "dtreason_id": 11,
    "dtminutes": 4,
    "dtminutes_provisional": null,
    "dtreason_code": "11",
    "dtreason_name": "Waiting for Raw Material",
    "dtminutes_total": null,
    "dtminutes_breaks": null,
    "dtminutes_setup": null
  }, {
    "dtdata_id": 2,
    "dxhdata_id": 2,
    "dtreason_id": 12,
    "dtminutes": 3,
    "dtminutes_provisional": null,
    "dtreason_code": "12",
    "dtreason_name": "Insert Issue",
    "dtminutes_total": null,
    "dtminutes_breaks": null,
    "dtminutes_setup": null
  }],
  "actions_comments": [{
    "dxhdata_id": 2,
    "comment": "We must of lost some material somewhere",
    "first_name": "Authur",
    "last_name": "Dent",
    "last_modified_on": "2019-07-29T22:48:12.793",
    "message": null
  }, {
    "dxhdata_id": 2,
    "comment": "He dropped them behind the CNC, so I showed him where to find them",
    "first_name": "Ford",
    "last_name": "Prefect",
    "last_modified_on": "2019-07-29T22:48:24.073",
    "message": null
  }],
  "product_code": "1 1/2L4MNS PS",
  "ideal": 15,
  "target_pcs": 13,
  "actual_pcs": 10,
  "order_number": "23456",
  "latest_comment": "We must of lost some material somewhere",
  "timelost_summary": 7,
  "latest_timelost_code": "11"
}, {
  "dxhdata_id": 3,
  "asset_code": "10832",
  "production_day": "2019-07-25T00:00:00",
  "shift_code": "3",
  "shift_name": "3rd Shift",
  "hour_interval": "1am - 2am",
  "hour_interval_start": "2019-07-25T01:00:00",
  "hour_interval_end": "2019-07-25T02:00:00",
  "summary_product_code": "multiple",
  "summary_ideal": 14,
  "summary_target": 11,
  "summary_actual": 11,
  "cumulative_target_pcs": 37,
  "cumulative_pcs": 34,
  "symmary_dtminutes": null,
  "symmary_dtreason_code": null,
  "symmary_dtreason_name": null,
  "symmary_comment": "multiple",
  "oper_id": "AD",
  "operator_signoff_timestamp": "2019-07-25T02:08:00",
  "superv_id": null,
  "supervisor_signoff_timestamp": null,
  "message": null,
  "timelost": null,
  "actions_comments": [{
    "dxhdata_id": 3,
    "comment": "All good so far",
    "first_name": "Aurthur",
    "last_name": "Dent",
    "last_modified_on": "2019-07-29T22:48:36.160",
    "message": null
  }, {
    "dxhdata_id": 3,
    "comment": "Any ole comment",
    "first_name": "Elihue",
    "last_name": "Couch III",
    "last_modified_on": "2019-08-08T21:57:12.177",
    "message": null
  }],
  "product_code": "1 1/2L4MNS PS",
  "ideal": 10,
  "target_pcs": 8,
  "actual_pcs": 8,
  "order_number": "23456",
  "latest_comment": "All good so far",
  "timelost_summary": null,
  "latest_timelost_code": null
}, {
  "dxhdata_id": 3,
  "asset_code": "10832",
  "production_day": "2019-07-25T00:00:00",
  "shift_code": "3",
  "shift_name": "3rd Shift",
  "hour_interval": "1am - 2am",
  "hour_interval_start": "2019-07-25T01:00:00",
  "hour_interval_end": "2019-07-25T02:00:00",
  "summary_product_code": "multiple",
  "summary_ideal": 14,
  "summary_target": 11,
  "summary_actual": 11,
  "cumulative_target_pcs": 37,
  "cumulative_pcs": 34,
  "symmary_dtminutes": null,
  "symmary_dtreason_code": null,
  "symmary_dtreason_name": null,
  "symmary_comment": "multiple",
  "oper_id": "AD",
  "operator_signoff_timestamp": "2019-07-25T02:08:00",
  "superv_id": null,
  "supervisor_signoff_timestamp": null,
  "message": null,
  "timelost": null,
  "actions_comments": [{
    "dxhdata_id": 3,
    "comment": "All good so far",
    "first_name": "Aurthur",
    "last_name": "Dent",
    "last_modified_on": "2019-07-29T22:48:36.160",
    "message": null
  }, {
    "dxhdata_id": 3,
    "comment": "Any ole comment",
    "first_name": "Elihue",
    "last_name": "Couch III",
    "last_modified_on": "2019-08-08T21:57:12.177",
    "message": null
  }],
  "product_code": "1 1/4 CD45-S PS",
  "ideal": 4,
  "target_pcs": 3,
  "actual_pcs": 3,
  "order_number": "98765",
  "latest_comment": "All good so far",
  "timelost_summary": null,
  "latest_timelost_code": null
}, {
  "dxhdata_id": null,
  "asset_code": "10832",
  "production_day": "2019-07-25T00:00:00",
  "shift_code": "3",
  "shift_name": "3rd Shift",
  "hour_interval": "2am - 3am",
  "hour_interval_start": "2019-07-25T02:00:00",
  "hour_interval_end": "2019-07-25T03:00:00",
  "summary_product_code": "1 1/4 CD45-S PS",
  "summary_ideal": 7,
  "summary_target": 5,
  "summary_actual": null,
  "cumulative_target_pcs": null,
  "cumulative_pcs": null,
  "symmary_dtminutes": null,
  "symmary_dtreason_code": null,
  "symmary_dtreason_name": null,
  "symmary_comment": null,
  "oper_id": null,
  "operator_signoff_timestamp": null,
  "superv_id": null,
  "supervisor_signoff_timestamp": null,
  "message": null,
  "timelost": null,
  "actions_comments": null,
  "product_code": "",
  "ideal": "",
  "target_pcs": "",
  "actual_pcs": "",
  "order_number": "",
  "timelost_summary": null,
  "latest_timelost_code": null
}, {
  "dxhdata_id": null,
  "asset_code": "10832",
  "production_day": "2019-07-25T00:00:00",
  "shift_code": "3",
  "shift_name": "3rd Shift",
  "hour_interval": "3am - 4am",
  "hour_interval_start": "2019-07-25T03:00:00",
  "hour_interval_end": "2019-07-25T04:00:00",
  "summary_product_code": "1 1/4 CD45-S PS",
  "summary_ideal": 5,
  "summary_target": 3,
  "summary_actual": null,
  "cumulative_target_pcs": null,
  "cumulative_pcs": null,
  "symmary_dtminutes": null,
  "symmary_dtreason_code": null,
  "symmary_dtreason_name": null,
  "symmary_comment": null,
  "oper_id": null,
  "operator_signoff_timestamp": null,
  "superv_id": null,
  "supervisor_signoff_timestamp": null,
  "message": null,
  "timelost": null,
  "actions_comments": null,
  "product_code": "",
  "ideal": "",
  "target_pcs": "",
  "actual_pcs": "",
  "order_number": "",
  "timelost_summary": null,
  "latest_timelost_code": null
}, {
  "dxhdata_id": null,
  "asset_code": "10832",
  "production_day": "2019-07-25T00:00:00",
  "shift_code": "3",
  "shift_name": "3rd Shift",
  "hour_interval": "4am - 5am",
  "hour_interval_start": "2019-07-25T04:00:00",
  "hour_interval_end": "2019-07-25T05:00:00",
  "summary_product_code": "1 1/4 CD45-S PS",
  "summary_ideal": 7,
  "summary_target": 5,
  "summary_actual": null,
  "cumulative_target_pcs": null,
  "cumulative_pcs": null,
  "symmary_dtminutes": null,
  "symmary_dtreason_code": null,
  "symmary_dtreason_name": null,
  "symmary_comment": null,
  "oper_id": null,
  "operator_signoff_timestamp": null,
  "superv_id": null,
  "supervisor_signoff_timestamp": null,
  "message": null,
  "timelost": null,
  "actions_comments": null,
  "product_code": "",
  "ideal": "",
  "target_pcs": "",
  "actual_pcs": "",
  "order_number": "",
  "timelost_summary": null,
  "latest_timelost_code": null
}, {
  "dxhdata_id": null,
  "asset_code": "10832",
  "production_day": "2019-07-25T00:00:00",
  "shift_code": "3",
  "shift_name": "3rd Shift",
  "hour_interval": "5am - 6am",
  "hour_interval_start": "2019-07-25T05:00:00",
  "hour_interval_end": "2019-07-25T06:00:00",
  "summary_product_code": null,
  "summary_ideal": null,
  "summary_target": null,
  "summary_actual": null,
  "cumulative_target_pcs": null,
  "cumulative_pcs": null,
  "symmary_dtminutes": null,
  "symmary_dtreason_code": null,
  "symmary_dtreason_name": null,
  "symmary_comment": null,
  "oper_id": null,
  "operator_signoff_timestamp": null,
  "superv_id": null,
  "supervisor_signoff_timestamp": null,
  "message": null,
  "timelost": null,
  "actions_comments": null,
  "product_code": "",
  "ideal": "",
  "target_pcs": "",
  "actual_pcs": "",
  "order_number": "",
  "timelost_summary": null,
  "latest_timelost_code": null
}, {
  "dxhdata_id": null,
  "asset_code": "10832",
  "production_day": "2019-07-25T00:00:00",
  "shift_code": "3",
  "shift_name": "3rd Shift",
  "hour_interval": "6am - 7am",
  "hour_interval_start": "2019-07-25T06:00:00",
  "hour_interval_end": "2019-07-25T07:00:00",
  "summary_product_code": null,
  "summary_ideal": null,
  "summary_target": null,
  "summary_actual": null,
  "cumulative_target_pcs": null,
  "cumulative_pcs": null,
  "symmary_dtminutes": null,
  "symmary_dtreason_code": null,
  "symmary_dtreason_name": null,
  "symmary_comment": null,
  "oper_id": null,
  "operator_signoff_timestamp": null,
  "superv_id": null,
  "supervisor_signoff_timestamp": null,
  "message": null,
  "timelost": null,
  "actions_comments": null,
  "product_code": "",
  "ideal": "",
  "target_pcs": "",
  "actual_pcs": "",
  "order_number": "",
  "timelost_summary": null,
  "latest_timelost_code": null
}];
exports.data = data;