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
import { getCurrentShift, genericRequest, getResponseFromGeneric, assignValuesToUser } from './Utils/Requests';
import _ from 'lodash';

const ACCESS_TOKEN_STORAGE_KEY = 'accessToken';

let search = window.location.search;
let params = queryString.parse(search);
if (search !== "") {
    if (params.st) {
        localStorage.setItem('st', params.st);
    }
}

if (window.location.pathname === '/' || window.location.pathname === '/login') {
    let machineName = params.st;
    if (!machineName) {
        machineName = localStorage.getItem('st');
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
        config.timeout = 15000;
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
        const station = params.st || localStorage.getItem('st');
        // console.log(station);
        if (error.response && error.response.status === 401) {
            const loginUrl = configuration['root'] + (station ? `?st=${station}` : '');
            // Redirect to login
            window.location.replace(loginUrl);
            return;
        }
        return Promise.reject(error);
    });

    genericRequest('get', API, '/me', { Authorization: 'Bearer ' + localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) })
        .then(async (response) => {
            let user = {};
            user = assignValuesToUser(user, response.data[0]);

            localStorage.setItem('ln', response.data[0].language);

            let station = params.st || localStorage.getItem('st');
            let site = params.cs;
            let machine = null;

            const shift = {
                st: station,
                site: site || user.site,
                clock_number: user.clock_number
            };

            let res = await getResponseFromGeneric('get', API, '/asset_display_system', {}, shift, {}) || {};
            const machineValues = res[0] || {};
            machine = {
                asset_code: machineValues.asset_code || 'No Data',
                asset_level: machineValues.asset_level,
                automation_level: machineValues.automation_level,
                display_name: machineValues.displaysystem_name,
                asset_description: machineValues.asset_description
            }

            user.shifts = await getResponseFromGeneric('get', API, '/shifts', {}, shift, {}) || [];
            user.machines = await getResponseFromGeneric('get', API, '/machine', {}, shift, {}) || [];
            user.sites = await getResponseFromGeneric('get', API, '/user_sites', {}, shift, {}) || [];
            user.uoms = await getResponseFromGeneric('get', API, '/uom_by_site', {}, shift, {}) || [];

            user.workcell = await getResponseFromGeneric('get', API, '/workcell', {}, shift, {}) || [];

            if (site && Number(user.site) !== Number(site)) {
                const parameters = {
                    user_id: _.find(user.sites, ['Site', parseInt(site)]).id
                };

                res = await getResponseFromGeneric('get', API, '/user_info_login_by_site', {}, parameters, {}) || [];
                let newUserValues = res[0] || {};
                user = assignValuesToUser(user, newUserValues);/////Double Check using Ryan login
            }

            if (!user.shift_id) {
                let currentShiftInfo = getCurrentShift(user.shifts, user.current_date_time);
                user.date_of_shift = currentShiftInfo.date_of_shift;
                user.current_shift = currentShiftInfo.current_shift;
                user.shift_id = currentShiftInfo.shift_id;
            }

            ReactDOM.render(
                <App user={user} defaultAsset={station} machineData={machine} />, document.getElementById('root'));

        });
};

serviceWorker.unregister();