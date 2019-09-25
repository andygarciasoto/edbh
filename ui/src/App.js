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
import config from './config.json';

function App(propsApp) {
  // set default machine and type
  const { t } = useTranslation();
  let machine = propsApp.machine || localStorage.getItem('machine_name');

  if (machine === 'undefined') {
    let machineValues = JSON.parse(localStorage.getItem('machineKey'));
    localStorage.setItem('machine_name', (machineValues == null ? config['station'] : machineValues.displaysystem_name));
    machine = config['station'];
  }
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
          render={function (props) {
            return (
              <DashboardOne
                user={propsApp.user} t={t}
                defaultAsset={propsApp.defaultAsset}
                history={props.history}
                search={qs.parse(props.history.location.search)} />
            )
          }
          } />
        <Route exact path="/login" render={(props) => 
        <Login t={t} 
        history={props.history}
        search={qs.parse(props.history.location.search)}
        />} 
        />
        <Route exact path="/" render={(props) => <SignIn t={t} 
         history={props.history}
         search={qs.parse(props.history.location.search)}
        />} />
      </Suspense>
    </Router>
  );
}

export default App;
