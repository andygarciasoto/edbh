import React from 'react';
import ReactDOM from 'react-dom';
import './sass/index.scss';
import App from './App';
import * as serviceWorker from './serviceWorker';
import './i18n';
import axios from 'axios';
import configuration from './config.json';

const loginStateStorageKey = "loginState";
const ACCESS_TOKEN_STORAGE_KEY = 'accessToken';


if (window.location.pathname === '/' || window.location.pathname === '/login') {
    ReactDOM.render(
        <App />
    , document.getElementById('root'));
    } else {
        init();
    }

function init () {
    // Read hashes from url
    const urlHashes = window.location.hash
        .slice(1).split(",")
        .reduce(function (obj, seg) {
            const keyValue = seg.split("=");
            if (keyValue.length === 2) {
                obj[keyValue[0]] = keyValue[1];
            }
            return obj;
        }, {});

    // Verify state
    // const expectedState = sessionStorage.getItem(loginStateStorageKey);
    // if (expectedState) {
    //     alert('1. found a state', expectedState);
    //     sessionStorage.removeItem(loginStateStorageKey);
    //     if (!("state" in urlHashes) || urlHashes.state !== expectedState) {
    //         alert('1.1 state not in urlhashes')
    //         console.error("Invalid state");
    //         window.location.replace(config['loginPage']);
    //         return;
    //     }
    // }

    // Retrieve access token from URL hash
    if (urlHashes) {
        console.log(urlHashes);
        // Store access token
        localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, urlHashes.token);
        // Remove hash values from url
        const redirectUrl = window.location.href.split("#")[0];
        window.history.replaceState({}, "", redirectUrl);
    } else {
        alert('token not found')
    }

    // Setup request interceptor
axios.interceptors.request.use(function (config) {
    const url = config.url;
    // TODO: Check if the "does not start with http" case is necessary
    alert('json url', JSON.stringify(config));
    const urlRequiresAuth = url.indexOf("http") !== 0 ||
        [configuration['api']].some(function (domain) {
            return url.indexOf(domain) === 0;
        });
    if (urlRequiresAuth) {
        // Ensure credentials are always sent to digital factory API's
        config.withCredentials = true;
        // Send access token in Authorization header if available
        const accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
        if (accessToken) {
            config.headers = Object.assign({
                Authorization: "Bearer " + accessToken
            }, config.headers);
        }
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});

// Setup response interceptor
axios.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    // Redirect to login on 401 status code
    if (error.response && error.response.status === 401) {
        // Create state
        const state = Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem(loginStateStorageKey, state);
        // Build login url
        const loginUrl = configuration['root'] + "/dashboard?response_type=token&redirect_uri="
            + encodeURIComponent(window.location.href) +
            "&state=" + encodeURIComponent(state);
        // Redirect to login
        window.location.replace(loginUrl);
        return;
    }
    return Promise.reject(error);
});

fetch('http://localhost:3001/api/me')
  .then(function(response) {
    return response;
  })
  .then(function(json) {
    alert(json)
    ReactDOM.render(
      <App />, document.getElementById('root'));
  }).catch((e)=> console.log(e))

// Check if user is logged in
// axios.get(`${configuration['api']}/api/me`)
//     .then(function (response) {
//         alert(response);
//         ReactDOM.render(
//             <App />
//         , document.getElementById('root')
//         );
//     })
//     .catch(function (error) {
//         alert(error)
//         console.error(error);
//         window.location.replace(configuration['loginPage']);
//     });

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
};

serviceWorker.unregister();