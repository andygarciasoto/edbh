import React from 'react';
import ReactDOM from 'react-dom';
import './sass/index.scss';
import App from './App';
import * as serviceWorker from './serviceWorker';
import './i18n';
import axios from 'axios';
import configuration from './config.json';
import { API } from './Utils/Constants';
import queryString from 'query-string';
import { access } from 'fs';

const loginStateStorageKey = "loginState";
const ACCESS_TOKEN_STORAGE_KEY = 'accessToken';


if (window.location.pathname === '/' || window.location.pathname === '/login') {
    ReactDOM.render(
        <App />
        , document.getElementById('root'));
} else {
    init();
}

function init() {
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

    // Retrieve access token from URL hash
    if (urlHashes && urlHashes.token) {
        // Store access token
        localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, urlHashes.token);
        // Remove hash values from url
        const redirectUrl = window.location.href.split("#")[0];
        window.history.replaceState({}, "", redirectUrl);
    } else {
        console.log('No new token found. Using existing one or unlogging user.');
    }

    // Setup request interceptor
    axios.interceptors.request.use(function (config) {
        const url = config.url;
        // TODO: Check if the "does not start with http" case is necessary
        const urlRequiresAuth = url.indexOf("http") !== 0 ||
            [API].some(function (domain) {
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
            const loginUrl = configuration['root'] + "/login";
            // Redirect to login
            window.location.replace(loginUrl);
            return;
        }
        return Promise.reject(error);
    });

    // let url = window.location.search;
    // let params = queryString.parse(url);

    // axios.all(
    //     [
    //         axios.get(`${API}/me`, { headers: { Authorization: 'Bearer ' + localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) } }),
    //         axios.get(`${API}/asset_display_system`, { headers: { Authorization: 'Bearer ' + localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) }, params: {display_system_name: params.ds} }),
    //     ]
    // )
        
    
    //     .then(function (responseUser, responseMachine) {
    //         return [responseUser, responseMachine];
    //     })
    //     .then(function (json, jsonMachine) {
    //         console.log(json, jsonMachine);
    //         const machineData = {
    //             asset_code: jsonMachine[0].AssetDisplaySystem.asset_code,
    //             asset_level: jsonMachine[0].AssetDisplaySystem.asset_level,
    //             automation_level: jsonMachine[0].AssetDisplaySystem.automation_level,
    //             display_name: jsonMachine[0].AssetDisplaySystem.displaysystem_name, 
    //             asset_description: jsonMachine[0].AssetDisplaySystem.asset_description
    //         }
    //         const user = {
    //             first_name: json.data[0]['First Name'],
    //             last_name: json.data[0]['Last Name'],
    //             username: json.data[0].Username,
    //             password: json.data[0].Password,
    //             role: json.data[0].Role,
    //             clock_number: json.data[0].Badge
    //         }
    //         ReactDOM.render(
    //             <App user={user} defaultAsset={machineData} />, document.getElementById('root'));
    //     }).catch((e) => {
    //         console.log(e)
    //     })

    axios(`${API}/me`, { headers: { Authorization: 'Bearer ' + localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) } })
    .then(function (response) {
        return response;
    })
    .then(function (json) {
        const user = {
            first_name: json.data[0]['First Name'],
            last_name: json.data[0]['Last Name'],
            username: json.data[0].Username,
            password: json.data[0].Password,
            role: json.data[0].Role,
            clock_number: json.data[0].Badge
        }
        ReactDOM.render(
            <App user={user} />, document.getElementById('root'));
    }).catch((e) => {
        console.log(e)
    })

    // If you want your app to work offline and load faster, you can change
    // unregister() to register() below. Note this comes with some pitfalls.
    // Learn more about service workers: https://bit.ly/CRA-PWA
};

serviceWorker.unregister();