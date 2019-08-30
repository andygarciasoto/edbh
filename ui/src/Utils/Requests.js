import { API } from './Constants';
import moment from 'moment';
import config from '../config.json'

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
    res = await axios.get(`${API}/data`, parameters)
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
  const returnShift = shift === undefined ? rawshift: shift;
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
    console.log(response)
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
  return moment().format('YYYY-MM-DD HH:mm:ss');
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

function isComponentValid(role, name) {
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
    ],
    operator: [
      'actual',
      'timelost', 
      'comments', 
      'pagination',
      'operator_signoff', 
      'intershifts',
      'supervisor_signoff'
    ]
  }

  if (!['administrator', 'supervisor', 'operator'].includes(role)) {
    console.log(role)
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
  } else {return true}
} 

function isFieldAllowed(role, row) {
  if (role !== 'administrator') {
    let rollback = role === 'operator' ? 2 : config['rollback'];
    const rowtime = row._subRows[0]._original.hour_interval_start;
    const now = getCurrentTime();
    const minusDate = moment(now).add(-rollback, 'hours');

    if (!moment(now).isSame(rowtime, 'day')) {
      return false;
    }

    if (!moment(rowtime).isAfter(minusDate)) {
      return false;
    }
    return true;
  } else {
    return true;
  }
}

export { getRequestData,
  getIntershift, 
  getRequest,
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
  isFieldAllowed 
}
