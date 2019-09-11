import React, { Suspense } from 'react';
import './sass/App.scss';
import Spinner from './Spinner';
import SignIn from './SignIn';
import Login from './Login';
import DashboardOne from './Dashboard/DashboardOne';
import { useTranslation } from 'react-i18next';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { API } from './Utils/Constants';
import { getRequest } from './Utils/Requests';
import axios from 'axios';
import * as qs from 'query-string';

function App(propsApp) {
  // set default machine and type
  const { t } = useTranslation();
    const machine = propsApp.machine || 'CR2080435W1';
    const machineData = axios.get(`${API}/asset_display_system?st=${machine}`, { headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') }});
    machineData.then((data) => localStorage.setItem('machineKey', JSON.stringify(data.data[0].AssetDisplaySystem)));
  return (
    <Router>
      <Helmet>
        <title>{'Parker Hannifin Day By Hour'}</title>
        <meta name="description" content="Day By Hour Application" />
        <meta name="theme-color" content="#ccc" />
      </Helmet>
      <Suspense fallback={<Spinner />}>
        <Route 
          path="/dashboard" 
            render={function(props) {
              return (
              <DashboardOne 
              user={propsApp.user} t={t} 
              defaultAsset={propsApp.defaultAsset} 
              history={props.history} 
              search={qs.parse(props.history.location.search)} />
              )}
            } />
        <Route exact path="/login" render={() => <Login t={t} />} />
        <Route exact path="/" render={() => <SignIn t={t} />} />
      </Suspense>
    </Router>
  );
}

export default App;
