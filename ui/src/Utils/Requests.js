import { API } from './Constants';
const axios = require('axios');

function getRequestData(url, data) {
    console.log(url, data, 1)
    const parameters = { 
        params: {
            mc: data[0],
            dt: data[1],
            sf: data[2],
        }
    }
    console.log(parameters);

    axios.get(`${API}/data`, parameters)
    .then(function (response) {
      // handle success
      console.log(response);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .finally(function () {
      // always executed
    });
}

export { getRequestData }
