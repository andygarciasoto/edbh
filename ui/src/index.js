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
import { BuildGet, getCurrentShift } from './Utils/Requests';
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
    axios(`${API}/me`, { headers: { Authorization: 'Bearer ' + localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) } })
        .then(function (response) {
            return response;
        })
        .then(async function (json) {
            let user = {
                first_name: json.data[0].first_name,
                last_name: json.data[0].last_name,
                username: json.data[0].username,
                role: json.data[0].role,
                clock_number: json.data[0].badge,
                site: json.data[0].site,
                site_name: json.data[0].site_name,
                timezone: json.data[0].timezone,
                current_shift: json.data[0].shift_name,
                shift_id: json.data[0].shift_id,
                language: json.data[0].language,
                date_of_shift: json.data[0].date_of_shift,
                current_date_time: json.data[0].current_date_time,
                max_regression: json.data[0].max_regression
            }

            localStorage.setItem('ln', json.data[0].language);

            let station = params.st || localStorage.getItem('st');
            let site = params.cs;
            let machine = null;
            const shift = {
                params: {
                    st: station,
                    site: site || user.site,
                    clock_number: user.clock_number
                }
            }

            let requestData = [
                BuildGet(`${API}/asset_display_system`, shift),
                BuildGet(`${API}/shifts`, shift),
                BuildGet(`${API}/machine`, shift),
                BuildGet(`${API}/user_sites`, shift),
                BuildGet(`${API}/uom_by_site`, shift)
            ];

            await axios.all(requestData).then(
                axios.spread((responseAsset, responseShift, responseMachine, responseLogins, responseUom) => {
                    const machineValues = responseAsset.data[0];
                    machine = {
                        asset_code: machineValues.asset_code || machineValues.message,
                        asset_level: machineValues.asset_level,
                        automation_level: machineValues.automation_level,
                        display_name: machineValues.displaysystem_name,
                        asset_description: machineValues.asset_description
                    }
                    user.shifts = responseShift.data;
                    user.machines = responseMachine.data;
                    user.sites = responseLogins.data;
                    user.uoms = responseUom.data;
                })
            ).catch(function (error) {
                console.log(error);
            });

            //shift.params.st = 'CR2080435W1';
            await axios.all([BuildGet(`${API}/workcell`, shift)]).then(
                axios.spread(async (responseWorkcell) => {
                    user.workcell = responseWorkcell.data;
                })
            ).catch(function (error) {
                console.log(error);
            });

            if (site && Number(user.site) !== Number(site)) {

                const parameters = {
                    params: {
                        user_id: _.find(user.sites, ['asset_id', parseInt(site)])['dbo.TFDUsers'][0].id
                    }
                };

                let updateUserRequest = [
                    BuildGet(`${API}/user_info_login_by_site`, parameters)
                ];

                await axios.all(updateUserRequest).then(
                    axios.spread(async (responseUser) => {
                        let newUserValues = responseUser.data[0];
                        user.role = newUserValues.role;
                        user.site = newUserValues.site;
                        user.site_name = newUserValues.site_name;
                        user.timezone = newUserValues.timezone;
                        user.current_shift = newUserValues.shift_name;
                        user.shift_id = newUserValues.shift_id;
                        user.language = newUserValues.language;
                        user.date_of_shift = newUserValues.date_of_shift;
                        user.current_date_time = newUserValues.current_date_time
                    })
                ).catch(function (error) {
                    console.log(error);
                });
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