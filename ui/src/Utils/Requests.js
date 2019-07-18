import { API } from './Constants';
import { resolve } from 'url';
const axios = require('axios');

async function getRequestData(data) {
  let res = {};
    const parameters = { 
        params: {
            mc: data[0],
            dt: data[1],
            sf: data[2],
        }
    }
    // console.log(parameters);
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

async function getIntershift(data) {
  let res = {};
  let shift = 0;
  if (data[2] === 'First Shift' || data[2] === 'Select Shift') {
    shift = 1;
  }
  if (data[2] === 'Second Shift') {
    shift = 2;
  }
  if (data[2] === 'Third Shift') {
    shift = 3;
  }
  const parameters = { 
        params: {
            mc: data[0],
            dt: data[1],
            sf: shift,
        }
    }
    // console.log(parameters);
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

export { getRequestData, getIntershift }
