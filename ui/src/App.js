import React, { Suspense } from 'react';
import './sass/App.scss';
import Spinner from './Spinner';
import SignIn from './SignIn';
import Login from './Login';
import DashboardOne from './Dashboard/DashboardOne';
import { useTranslation } from 'react-i18next';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import * as qs from 'query-string';

function App(propsApp) {
  const { t } = useTranslation();
  return (
    <Router>
      <Helmet>
        <title>{'Parker Hannifin Day By Hour'}</title>
        <meta name="description" content="Day By Hour Application" />
        <meta name="theme-color" content="#ccc" />
      </Helmet>
      <Suspense fallback={<Spinner />}>
        <Route path="/dashboard" render={(props) => <DashboardOne user={propsApp.user} t={t} history={props.history} search={qs.parse(props.history.location.search)} />} />
        <Route exact path="/login" render={() => <Login t={t} />} />
        <Route exact path="/" render={() => <SignIn t={t} />} />
      </Suspense>
    </Router>
  );
}

export default App;
