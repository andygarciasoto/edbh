import { API } from './Constants';
import moment from 'moment-timezone';
import _ from 'lodash';

const axios = require('axios');

function genericRequest(method, baseURL, route, headers, parameters, body, cancelTok) {
  return axios({
    method: method,
    url: `${baseURL}${route}`,
    headers: headers,
    params: parameters,
    data: body,
    cancelToken: cancelTok
  });
}

async function getResponseFromGeneric(method, baseURL, route, headers, parameters, body, cancelTok) {

  return axios({
    method: method,
    url: `${baseURL}${route}`,
    headers: headers,
    params: parameters,
    data: body,
    cancelToken: cancelTok
  })
    .then(response => {
      // handle success
      if (method === 'get') {
        return response.data;
        //resolve(response.data);
      } else {
        //resolve(response);
        return response;
      }
    })
    .catch(error => {
      // handle error
      //console.log(error.message);
      //reject(error.response);
      if (method === 'get') {
        return [];
        //resolve(response.data);
      } else {
        //resolve(response);
        return {};
      }
    });
}

function BuildGet(url, parameters, config) {
  return axios.get(url, parameters, config);
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

function formatTime(date) {
  return moment(date).format('HH:mm:ss');
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
  if (summary) {
    let totalMinutes = _.sumBy(props.user.shifts, 'duration_in_minutes');
    rows = (totalMinutes / 60) + props.user.shifts.length;
  } else {
    let currentShift = props.selectedShift;
    let shift = _.find(props.user.shifts, { shift_name: currentShift });
    rows = (shift.duration_in_minutes / 60);
  }
  return rows;
}

function validPermission(user, componentName, action) {
  return _.find(user.permissions, { component_name: componentName, ['can_' + action]: true }) ? true : false;
}

function validMenuOption(optionName, viewName) {
  let views =
  {
    '/dashboard': [
      'megamenu-machine-option',
      'megamenu-date-option',
      'megamenu-shift-option',
      'megamenu-language-option'
    ],
    '/summary': [
      'megamenu-machine-option',
      'megamenu-date-option',
      'megamenu-language-option'
    ],
    '/import': [
      'megamenu-language-option'
    ],
    '/digitalcups': [
      'megamenu-level-option',
      'megamenu-area-option',
      'megamenu-date-option',
      'megamenu-shift-option',
      'megamenu-language-option'
    ],
  };
  return _.indexOf(views[viewName], optionName) !== -1;
}

export {
  getRequest,
  formatDate,
  formatDateWithTime,
  getCurrentTime,
  sendPost,
  sendPut,
  isFieldAllowed,
  formatNumber,
  getCurrentTimeOnly,
  BuildGet,
  getDateAccordingToShifts,
  getCurrentShift,
  genericRequest,
  getResponseFromGeneric,
  getRowsFromShifts,
  formatTime,
  validPermission,
  validMenuOption
}
