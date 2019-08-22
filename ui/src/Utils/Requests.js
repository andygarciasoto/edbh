import { API } from './Constants';
import moment from 'moment';
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
  console.log(date, moment(date).format('YYYY-MM-DD HH:mm:ss'))
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
}

function formatDateWithCurrentTime(date) {
  return formatDate(date) + ' ' + moment().format('HH:mm:ss');
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

export { getRequestData, getIntershift, getRequest, mapShift, formatDate, formatDateWithTime, formatDateWithCurrentTime, sendPost, timelossGetReasons, sendPut }
