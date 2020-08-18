import { API } from './Constants';
import moment from 'moment-timezone';
import _ from 'lodash';

const axios = require('axios');

function genericRequest(method, baseURL, route, headers, parameters, body) {
  return axios({
    method: method,
    url: `${baseURL}${route}`,
    headers: headers,
    params: parameters,
    data: body
  });
}

async function getResponseFromGeneric(method, baseURL, route, headers, parameters, body) {
  const res = await axios({
    method: method,
    url: `${baseURL}${route}`,
    headers: headers,
    params: parameters,
    data: body
  })
    .then(response => {
      // handle success
      return response;
    })
    .catch(error => {
      // handle error
      return error.response;
    });
  if (res.status === 200) {
    if (method === 'get') {
      return res.data;
    } else {
      return res;
    }
  } else {
    if (method === 'get') {
      return [];
    } else {
      return res;
    }
  }
}

function assignValuesToUser(user, newAttributes) {
  user.first_name = newAttributes.first_name;
  user.last_name = newAttributes.last_name;
  user.username = newAttributes.username;
  user.role = newAttributes.role;
  user.clock_number = newAttributes.badge;
  user.site = newAttributes.site;
  user.max_regression = newAttributes.max_regression;
  user.site_name = newAttributes.site_name;
  user.timezone = newAttributes.timezone;
  user.current_shift = newAttributes.shift_name;
  user.shift_id = newAttributes.shift_id;
  user.language = newAttributes.language;
  user.date_of_shift = newAttributes.date_of_shift;
  user.current_date_time = newAttributes.current_date_time;
  return user;
}

function BuildGet(url, parameters, config) {
  return axios.get(url, parameters, config);
}

function mapShift(rawshift) {//REVISAR METODO NO DEBERÍA DE USARSE
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

async function sendPost(data, route) {//CAMBIAR FORMA DE USO SOLO LLAMAR EL POST MANEJAR EN
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

async function sendPut(data, route) {//CAMBIAR FORMA DE USO SOLO LLAMAR EL POST MANEJAR EN
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

function formatDate(date) {
  return moment(date).format('YYYY/MM/DD HH:mm');
}

function formatDateWithTime(date) {
  return moment(date).format('YYYY/MM/DD HH:mm');
}

function getCurrentTime(timezone) {
  if (timezone) {
    return moment().tz(timezone).format('YYYY/MM/DD HH:mm');
  }
  return moment().format('YYYY/MM/DD HH:mm');
}

function getCurrentTimeOnly(timezone) {
  if (timezone) {
    return moment().tz(timezone).format('HH:mm');
  }
  return moment().format('HH:mm');
}

function isComponentValid(user_role, name) {
  let role;
  if (user_role) {
    role = user_role.toLowerCase();
  }
  const componentStructure = {
    administrator: [
      'menu',
      'menu-dashbaord',
      'menu-import',
      'menu-summary',
      'megamenu',
      'sitename',
      'actual',
      'partnumber',
      'timelost',
      'ideal',
      'target',
      'comments',
      'supervisor_signoff',
      'operator_signoff',
      'intershifts',
      'pagination',
      'neworder',
      'manualentry',
      'import',
      'scrap',
      'dashboardOne',
      'summary'
    ],
    supervisor: [
      'menu',
      'menu-dashbaord',
      'menu-summary',
      'megamenu',
      'actual',
      'timelost',
      'comments',
      'supervisor_signoff',
      'operator_signoff',
      'intershifts',
      'pagination',
      'neworder',
      'manualentry',
      'dashboardOne',
      'summary',
      'scrap'
    ],
    operator: [
      'timelost',
      'comments',
      'pagination',
      'supervisor_signoff',
      'operator_signoff',
      'intershifts',
      'neworder',
      'dashboardOne',
      'scrap'
    ],
    summary: [
      'megamenu',
      'timelost',
      'comments',
      'intershifts',
      'summary'
    ]
  }

  if (!['administrator', 'supervisor', 'operator', 'summary'].includes(role)) {
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

function isFieldAllowed(role, row, timezone) {
  if (role === 'Administrator') {
    return true;
  }
  if (row) {
    let rowTime = moment(row.started_on_chunck);
    let actualSiteTime = timezone ? moment().tz(timezone) : moment();
    let diffHours = moment(actualSiteTime.format('YYYY-MM-DD HH')).diff(moment(rowTime.format('YYYY-MM-DD HH')), 'hours');
    let result;
    if (role === 'Operator' || role === 'Supervisor') {
      result = diffHours === 0 || diffHours === 1;
    }
    return result;
  }
  return false;
}

function formatNumber(number, decimals) {
  if (!decimals) {
    return Math.round(number);
  } else {
    return number.toFixed(decimals);
  }
}

function convertNumber(num, uom_asset) {
  let result = 0;
  if (uom_asset && uom_asset.decimals) {
    result = (Math.round(Math.round(num) * 10 + Number.EPSILON) / 10);
  } else {
    result = Math.floor(Math.round(num));
  }
  return result;
}

function getDateAccordingToShifts(filterDate, user) {
  let newDate = moment(filterDate);
  let currentDate = moment(getCurrentTime(user.timezone));
  let startNewDate = moment(newDate.format('YYYY/MM/DD') + ' 00:00');
  let startCurrentDate = moment(currentDate.format('YYYY/MM/DD') + ' 00:00');

  if (startNewDate.isSame(startCurrentDate)) {
    let lastShiftDate = moment(user.shifts[user.shifts.length - 1].end_date_time_today);
    if (currentDate.isAfter(lastShiftDate)) {
      newDate = startNewDate.add(1, 'days');
    }
  }

  return newDate.format('YYYY/MM/DD HH:mm');
}

function getCurrentShift(shifts, current_date_time) {
  let currentShift = {};
  _.forEach(shifts, shift => {
    if (moment(current_date_time).isSameOrAfter(moment(shift.start_date_time_today)) && moment(current_date_time).isBefore(moment(shift.end_date_time_today))) {
      currentShift.current_shift = shift.shift_name;
      currentShift.shift_id = shift.shift_id;
      currentShift.date_of_shift = shift.end_date_time_today;
    }
    if (moment(current_date_time).isSameOrAfter(moment(shift.start_date_time_yesterday)) && moment(current_date_time).isBefore(moment(shift.end_date_time_yesterday))) {
      currentShift.current_shift = shift.shift_name;
      currentShift.shift_id = shift.shift_id;
      currentShift.date_of_shift = shift.end_date_time_yesterday;
    }
    if (moment(current_date_time).isSameOrAfter(moment(shift.start_date_time_tomorrow)) && moment(current_date_time).isBefore(moment(shift.end_date_time_tomorrow))) {
      currentShift.current_shift = shift.shift_name;
      currentShift.shift_id = shift.shift_id;
      currentShift.date_of_shift = shift.end_date_time_tomorrow;
    }
  });

  if (!currentShift.shift_id) {
    if (moment(current_date_time).isSameOrAfter(moment(shifts[shifts.length - 1].end_date_time_today))) {
      currentShift.current_shift = shifts[0].shift_name;
      currentShift.shift_id = shifts[0].shift_id;
      currentShift.date_of_shift = shifts[0].end_date_time_tomorrow;
    } else if (moment(current_date_time).isBefore(moment(shifts[0].start_date_time_today))) {
      currentShift.current_shift = shifts[0].shift_name;
      currentShift.shift_id = shifts[0].shift_id;
      currentShift.date_of_shift = current_date_time;
    }
  }

  return currentShift;
}

function getRowsFromShifts(props, summary) {
  let rows = 0;
  if(summary){
    let totalMinutes = _.sumBy(props.user.shifts, 'duration_in_minutes');
    rows = (totalMinutes / 60) + props.user.shifts.length;
  }else{
    let currentShift = props.search.sf ? props.search.sf : props.user.current_shift;
    let shift = _.find(props.user.shifts, {shift_name: currentShift});
    rows = (shift.duration_in_minutes / 60);
  }
  return rows;
}

export {
  getRequest,
  mapShift,
  formatDate,
  formatDateWithTime,
  getCurrentTime,
  sendPost,
  sendPut,
  isComponentValid,
  isFieldAllowed,
  formatNumber,
  getCurrentTimeOnly,
  BuildGet,
  convertNumber,
  getDateAccordingToShifts,
  getCurrentShift,
  genericRequest,
  getResponseFromGeneric,
  assignValuesToUser,
  getRowsFromShifts
}
