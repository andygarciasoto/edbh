import { API, AUTH } from './Constants';
import moment from 'moment-timezone';
import config from '../config.json'
import _ from 'lodash';

const axios = require('axios');

async function getRequestData(data) {
  let res = {};
  const parameters = {
    params: {
      mc: data[0],
      dt: formatDate(data[1]).split("-").join(""),
      sf: mapShift(data[2]),
    }
  }
  res = await axios.get(`${API}/data`, parameters);

  if (res) {
    return res.data;
  }
}

function mapShift(rawshift) {
  let shift = 1;
  if (rawshift === 'Select Shift') {
    shift = 1;
  }
  if (rawshift === '1st Shift') {
    shift = 1;
  }
  if (rawshift === '2nd Shift') {
    shift = 2;
  }
  if (rawshift === '3rd Shift') {
    shift = 3;
  }
  return shift;
}

function mapShiftReverse(rawshift) {
  let shift;
  if (rawshift === 1) {
    shift = '1st Shift';
  }
  if (rawshift === 2) {
    shift = '2nd Shift';
  }
  if (rawshift === 3) {
    shift = '3rd Shift';
  }
  const returnShift = shift === undefined ? rawshift : shift;
  return returnShift;
}

async function sendPost(data, route) {
  const res = await axios.post(`${API}${route}`, data)
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.log(error);
    })
  if (res) {
    return res.status;
  }
}

async function sendPut(data, route) {
  const res = await axios.put(`${API}${route}`, data)
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.log(error);
    })
  if (res) {
    return res.status;
  }
}

async function getIntershift(data) {
  let res = {};

  const parameters = {
    params: {
      mc: data[0],
      dt: formatDate(data[1]).split("-").join(""),
      sf: mapShift(data[2])
    }
  }
  res = await axios.get(`${API}/intershift_communication`, parameters)
    .then(function (response) {
      // handle success
      return response;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .finally(function () {
      // nothing
    });
  if (res) {
    return res.data;
  }
}

async function getRequest(route, data) {
  const res = await axios.get(`${API}${route}`, data)
    .then(function (response) {
      // handle success
      return response;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .finally(function () {
      // nothing
    });
  if (res) {
    return res.data;
  }
}

async function getRequestAuth(route, data) {
  const res = await axios.get(`${AUTH}${route}`, data)
    .then(function (response) {
      // handle success
      return response;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .finally(function () {
      // nothing
    });
  if (res) {
    return res.data;
  }
}

function formatDate(date) {
  return moment(date).format('YYYY-MM-DD');
}

function formatDateWithTime(date) {
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
}

function formatDateWithCurrentTime(date) {
  return formatDate(date) + ' ' + moment().format('HH:mm:ss');
}

function getCurrentTime() {
  // return moment().tz(config['timezone']).format('YYYY-MM-DD HH:mm:ss');
  return moment().tz(config["timezone"]).format('YYYY-MM-DD HH:mm:ss');
}

async function timelossGetReasons(machine) {
  const parameters = {
    params: {
      mc: machine
    }
  }
  let res = {};
  res = await axios.get(`${API}/timelost_reasons`, parameters)
    .then(function (response) {
      // handle success
      return response;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .finally(function () {
      // nothing
    });
  if (res) {
    return res.data;
  }
}

async function getUOMS() {
  let res = {};
  res = await axios.get(`${API}/uom`)
    .then(function (response) {
      // handle success
      return response;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .finally(function () {
      // nothing
    });
  if (res) {
    return res.data;
  }
}

async function getProducts() {
  let res = {};
  res = await axios.get(`${API}/product`)
    .then(function (response) {
      // handle success
      return response;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .finally(function () {
      // nothing
    });
  if (res) {
    return res.data;
  }
}

function isComponentValid(user_role, name) {
  let role;
  if (user_role) {
    role = user_role.toLowerCase();
  }
  const componentStructure = {
    administrator: [
      'megamenu',
      'actual',
      'partnumber',
      'timelost',
      'ideal',
      'target',
      'comments',
      'operator_signoff',
      'supervisor_signoff',
      'intershifts',
      'pagination',
      'neworder',
      'manualentry',
    ],
    supervisor: [
      'megamenu',
      'actual',
      'timelost',
      'comments',
      'operator_signoff',
      'supervisor_signoff',
      'intershifts',
      'pagination',
      'neworder',
      'manualentry',
    ],
    operator: [
      'actual',
      'timelost',
      'comments',
      'pagination',
      'operator_signoff',
      'intershifts',
      'supervisor_signoff',
      'neworder'
    ]
  }

  if (!['administrator', 'supervisor', 'operator'].includes(role)) {
    return false;
  }
  if (!componentStructure.administrator.includes(name)) {
    return false;
  }
  let match = undefined;
  for (let i of componentStructure[role]) {
    if (name === i) {
      match = i;
    }
  }
  if (match === undefined) {
    return false;
  } else { return true }
}

function isFieldAllowed(role, row) {
  if (role === 'Administrator') {
    return true;
  }
  let rowTime = moment(row._subRows[0]._original.hour_interval_start);
  let actualSiteTime = moment().tz(config['timezone']);
  let diffHours = moment(actualSiteTime.format('YYYY-MM-DD HH')).diff(moment(rowTime.format('YYYY-MM-DD HH')), 'hours');
  let result;
  if (role === 'Operator' || role === 'Supervisor') {
    (diffHours === 0 || diffHours === 1) ? result = true : result = false;
    }
  return result;
}

function formatNumber(number, decimals) {
  if (!decimals) {
    return Math.round(number);
  } else {
    return number.toFixed(decimals);
  }
}

function getStationAsset(station) {
  let machineData = {};
  machineData = axios(`${API}/asset_display_system?st=${station}`, { headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') } })
  .then(function (response) {
      const machineValues = response.data[0].AssetDisplaySystem;
      machineData = {
          asset_code: machineValues.asset_code,
          asset_level: machineValues.asset_level,
          automation_level: machineValues.automation_level,
          display_name: machineValues.displaysystem_name,
          asset_description: machineValues.asset_description
          }
          return machineData;
    }).catch((e) => {
    console.log(e)
    });
    if (machineData) {
      return machineData;
    }
}

export {
  getRequestData,
  getIntershift,
  getRequest,
  getRequestAuth,
  mapShift,
  mapShiftReverse,
  formatDate,
  formatDateWithTime,
  formatDateWithCurrentTime,
  getCurrentTime,
  sendPost,
  timelossGetReasons,
  sendPut,
  isComponentValid,
  isFieldAllowed,
  getUOMS,
  getProducts,
  formatNumber,
  getStationAsset
}
