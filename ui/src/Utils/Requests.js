import { API } from './Constants';
import { resolve } from 'url';
const axios = require('axios');

async function getRequestData(url, data) {
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
    return res.data;
}

export { getRequestData }
