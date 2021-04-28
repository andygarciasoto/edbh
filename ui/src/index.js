import React from 'react';
import { Provider } from 'react-redux';
import store from './redux/store';
import ReactDOM from 'react-dom';
import { socket } from './context/socket';
import App from './App';
import * as serviceWorker from './serviceWorker';
import './i18n';
import axios from 'axios';
import configuration from './config.json';
import { API, AUTH } from './Utils/Constants';
import queryString from 'query-string';
import { getResponseFromGeneric } from './Utils/Requests';
import { assignValuesToUser, assignSiteConfiguration } from './Utils/Utils';

const ACCESS_TOKEN_STORAGE_KEY = 'accessToken';

socket.on('connect', () => console.log('Connected to the Websocket Service'));
socket.on('disconnect', () => console.log('Disconnected from the Websocket Service'));

let search = window.location.search;
let params = queryString.parse(search);
if (search !== '') {
	if (params.st) {
		localStorage.setItem('st', params.st);
	}
}

if (window.location.pathname === '/' || window.location.pathname === '/login') {
	let machineName = params.st;
	ReactDOM.render(
		<Provider store={store}>
			<App defaultAsset={machineName} />
		</Provider>,

		document.getElementById('root')
	);
} else {
	init();
}

function init() {
	// Read hashes from url
	const urlHashes = window.location.hash
		.slice(1)
		.split(',')
		.reduce(function (obj, seg) {
			const keyValue = seg.split('=');
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
		const redirectUrl = window.location.href.split('#')[0];
		window.history.replaceState({}, '', redirectUrl);
	} else {
		console.log('No new token found. Using existing one or unlogging user.');
	}

	// Setup request interceptor
	axios.interceptors.request.use(
		function (config) {
			const url = config.url;
			config.timeout = url.indexOf('import_data') !== -1 ? 60000 : 15000;
			// TODO: Check if the "does not start with http" case is necessary
			const urlRequiresAuth =
				url.indexOf('http') !== 0 ||
				[API].some(function (domain) {
					return url.indexOf(domain) === 0;
				});
			if (urlRequiresAuth) {
				// Ensure credentials are always sent to digital factory API's
				config.withCredentials = true;
				// Send access token in Authorization header if available
				const accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
				if (accessToken) {
					config.headers = Object.assign(
						{
							Authorization: 'Bearer ' + accessToken,
						},
						config.headers
					);
				}
			}
			return config;
		},
		function (error) {
			return Promise.reject(error);
		}
	);

	// Setup response interceptor
	axios.interceptors.response.use(
		function (response) {
			return response;
		},
		function (error) {
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
		}
	);

	const parameters = {
		station: params.st || localStorage.getItem('st'),
		site_id: params.cs,
	};

	getResponseFromGeneric(
		'get',
		AUTH,
		'/me',
		{ Authorization: 'Bearer ' + localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) },
		parameters
	).then(async (response) => {
		let user = {};
		user = assignValuesToUser(user, response[0]);

		localStorage.setItem('ln', user.language);
		parameters.site_id = parameters.site_id || user.site;

		const siteInfomration =
			(await getResponseFromGeneric('get', API, '/loadSiteConfiguration', {}, parameters)) || {};
		const machineValues = siteInfomration.dsystems[0] || {};

		const machine = {
			asset_code: machineValues.asset_code || 'No Data',
			asset_name: machineValues.asset_name || 'No Data',
			asset_level: machineValues.asset_level,
			automation_level: machineValues.automation_level,
			display_name: machineValues.displaysystem_name,
			asset_description: machineValues.asset_description,
		};

		user = assignSiteConfiguration(user, siteInfomration);

		ReactDOM.render(
			<Provider store={store}>
				<App user={user} defaultAsset={parameters.station} machineData={machine} socket={socket} />
			</Provider>,
			document.getElementById('root')
		);
	});
}

serviceWorker.unregister();
