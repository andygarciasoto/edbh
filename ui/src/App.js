import React, { Suspense } from 'react';
import './sass/App.scss';
import Spinner from './Spinner';
import SignIn from './SignIn';
import Login from './Login';
import Import from './Dashboard/Import';
import DashboardOne from './Dashboard/DashboardOne';
import { useTranslation } from 'react-i18next';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import * as qs from 'query-string';

function App(propsApp) {
  // set default machine and type
  const { t } = useTranslation();
  const machine = localStorage.getItem('machine_name');
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
        <Route exact path="/import" render={(props) => 
        <Import t={t} 
          history={props.history}
          user={propsApp.user}
          search={qs.parse(props.history.location.search)}
        />} />
      </Suspense>
    </Router>
  );
}

export default App;
