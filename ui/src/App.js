import React, { Suspense, useState, useEffect } from 'react';
import './sass/App.scss';
import Spinner from './Spinner';
import SignIn from './SignIn';
import Login from './Login';
import DashboardOne from './Dashboard/DashboardOne';
import { useTranslation } from 'react-i18next';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { getStationAsset } from './Utils/Requests';
import * as qs from 'query-string';
import $ from 'jquery';

function App(propsApp) {
  // set default machine and type
  const { t } = useTranslation();
  //const machine = propsApp.defaultAsset;
  const machine = localStorage.getItem('machine_name');
  console.log(machine)
  // sessionStorage.setItem('machine_name', machine);
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
                defaultAsset={machine}
                history={props.history}
                search={qs.parse(props.history.location.search)} 
                />
            )
          }
          } />
        <Route exact path="/login" render={(props) => 
        <Login t={t} 
        history={props.history}
        search={qs.parse(props.history.location.search)}
        />} 
        />
        <Route exact path="/" render={(props) => 
        <SignIn t={t} 
          history={props.history}
          search={qs.parse(props.history.location.search)}
        />} />
      </Suspense>
    </Router>
  );
}

export default App;
