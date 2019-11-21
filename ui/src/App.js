import React, { Suspense, useState } from 'react';
import './sass/App.scss';
import Spinner from './Spinner';
import SignIn from './SignIn';
import Login from './Login';
import Import from './Dashboard/Import';
import DashboardOne from './Dashboard/DashboardOne';
import Header1 from './Layout/Header1';
import { useTranslation } from 'react-i18next';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { isComponentValid } from './Utils/Requests';
import * as qs from 'query-string';

function App(propsApp) {
  // set default machine and type
  let [showModal, displayModal] = useState(false);
  const { t } = useTranslation();
  return (
    <Router>
      <Helmet>
        <title>{'Parker Hannifin Day By Hour'}</title>
        <meta name="description" content="Day By Hour Application" />
        <meta name="theme-color" content="#ccc" />
      </Helmet>
      <Suspense fallback={<Spinner />}>
        <Route path="/"
          render={(props) =>
            (props.location.pathname !== "/" && props.location.pathname !== "/login") &&
            <Header1
              history={props.history}
              t={t}
              user={propsApp.user}
              defaultAsset={propsApp.defaultAsset}
              machineData={propsApp.machineData}
              openModal={displayModal} />}
        />
        <Route
          path="/dashboard"
          render={function (props) {
            return (
              <DashboardOne
                user={propsApp.user}
                t={t}
                history={props.history}
                search={qs.parse(props.history.location.search)}
                showNewOrderModal={showModal}
                closeOrderModal={displayModal}
                defaultAsset={propsApp.defaultAsset}
                machineData={propsApp.machineData} />
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
        {propsApp.user && isComponentValid(propsApp.user.role, 'import') ?
          <Route exact path="/import" render={(props) =>
            <Import t={t}
              history={props.history}
              user={propsApp.user}
              search={qs.parse(props.history.location.search)}
            />} />
          : null
        }
        <Route exact path="/summary" render={(props) =>
          <DashboardOne
            user={propsApp.user}
            t={t}
            history={props.history}
            search={qs.parse(props.history.location.search)}
            summary={true}
            defaultAsset={propsApp.defaultAsset}
            machineData={propsApp.machineData} />}
        />
      </Suspense>
    </Router>
  );
}

export default App;
