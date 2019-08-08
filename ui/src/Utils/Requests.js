import { API } from './Constants';
import moment from 'moment';
const axios = require('axios');

async function getRequestData(data) {
  console.log(data);
  let res = {};
    const parameters = { 
        params: {
            mc: data[0],
            dt: data[1],
            sf: data[2],
        }
    }
    res = await axios.get(`${API}/data`, parameters)
    .then(function (response) {
      // handle success
      console.log(response)
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
  let shift = 0;
  if (rawshift === 'First Shift' || rawshift === 'Select Shift') {
    shift = 1;
  }
  if (rawshift === 'Second Shift') {
    shift = 2;
  }
  if (rawshift === 'Third Shift') {
    shift = 3;
  }
  return shift;
}

async function getIntershift(data) {
  let res = {};

  const parameters = { 
        params: {
            mc: data[0],
            dt: data[1],
            sf: mapShift(data[2])
        }
    }
    console.log(parameters);
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

async function getMachineData() {
  let res = {};
  res = await axios.get(`${API}/machine`)
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

export { getRequestData, getIntershift, getMachineData, mapShift, formatDate }
