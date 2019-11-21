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

const ACCESS_TOKEN_STORAGE_KEY = 'accessToken';

let search = window.location.search;
let params = queryString.parse(search);
if (search !== "") {
    if (params.st) {
        localStorage.setItem('machine_name', params.st);
    }
}

if (window.location.pathname === '/' || window.location.pathname === '/login') {
    let machineName = params.st;
    if (machineName) {
        machineName = localStorage.getItem('machine_name');
    }
    ReactDOM.render(
        <App defaultAsset={machineName} />
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
        // const station = localStorage.getItem('machine_name');
        const station = params.st || localStorage.getItem('machine_name');
        // console.log(station);
        if (error.response && error.response.status === 401) {
            const loginUrl = configuration['root'] + (station ? `?st=${station}` : '');
            // Redirect to login
            window.location.replace(loginUrl);
            return;
        }
        return Promise.reject(error);
    });

    axios(`${API}/me`, { headers: { Authorization: 'Bearer ' + localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) } })
        .then(function (response) {
            return response;
        })
        .then(async function (json) {
            const user = {
                first_name: json.data[0]['First Name'],
                last_name: json.data[0]['Last Name'],
                username: json.data[0].Username,
                password: json.data[0].Password,
                role: json.data[0].Role,
                clock_number: json.data[0].Badge,
                site: json.data[0].Site,
                site_name: json.data[0].SiteName,
                timezone: json.data[0].Timezone,
                current_shift: json.data[0].ShiftName
            }

            let station = params.st || localStorage.getItem('machine_name');
            let machine = null;
            await axios.get(`${API}/asset_display_system?st=${station}`, { headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') } })
                .then(function (response) {
                    const machineValues = response.data[0].AssetDisplaySystem;
                    machine = {
                        asset_code: machineValues.asset_code,
                        asset_level: machineValues.asset_level,
                        automation_level: machineValues.automation_level,
                        display_name: machineValues.displaysystem_name,
                        asset_description: machineValues.asset_description
                    }
                    return machine;
                }).catch((e) => {
                    console.log(e)
                });

            ReactDOM.render(
                <App user={user} defaultAsset={station} machineData={machine} />, document.getElementById('root'));
        });
};

serviceWorker.unregister();