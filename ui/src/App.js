import React, { Suspense, useState } from 'react';
import Spinner from './Components/Common/Spinner';
import SignIn from './Views/SignIn';
import Login from './Views/Login';
import Header from './Components/Header/Header';
import DashboardOne from './Views/DashboardOne';
import Import from './Views/Import';
import DigitalCups from './Views/DigitalCups';
import { useTranslation } from 'react-i18next';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { validPermission } from './Utils/Requests';
import * as qs from 'query-string';
import './sass/App.scss';

function App(propsApp) {
  // set default machine and type
  let [modal_order_IsOpen, displayOrderModal] = useState(false);
  let [showModalLogOff, displayModalLogOff] = useState(false);
  let [currentUser, changeCurrentUser] = useState(propsApp.user);
  const updateCurrentUser = (newUser) => {
    changeCurrentUser({ ...currentUser, currentUser: newUser });
  }

  const { t } = useTranslation();
  return (
    <Router>
      <Helmet>
        <title>{'Parker Hannifin Day By Hour'}</title>
        <meta name="description" content="Day By Hour Application" />
        <meta name="theme-color" content="#ccc" />
      </Helmet>
      <Suspense fallback={<Spinner />}>
        <Route path='/'
          render={(props) =>
            (props.location.pathname === '/dashboard' || props.location.pathname === '/import' || props.location.pathname === '/summary' || props.location.pathname === '/digitalcups') &&
            <Header
              history={props.history}
              t={t}
              user={currentUser}
              machineData={propsApp.machineData}
              displayOrderModal={displayOrderModal}
              displayModalLogOff={displayModalLogOff}
              changeCurrentUser={updateCurrentUser}
            />}
        />
        {currentUser && validPermission(currentUser, 'dashboardView', 'read') ?
          <Route
            path='/dashboard'
            render={(props) => {
              return (
                <DashboardOne
                  user={currentUser}
                  t={t}
                  history={props.history}
                  search={qs.parse(props.history.location.search)}
                  modal_order_IsOpen={modal_order_IsOpen}
                  displayOrderModal={displayOrderModal}
                  defaultAsset={propsApp.defaultAsset}
                  machineData={propsApp.machineData}
                  socket={propsApp.socket}
                  updateCurrentUser={updateCurrentUser}
                  showModalLogOff={showModalLogOff}
                  displayModalLogOff={displayModalLogOff}
                />
              )
            }
            } />
          : null
        }
        <Route exact path="/login" render={(props) =>
          <Login t={t}
            history={props.history}
            search={qs.parse(props.history.location.search)}
            st={propsApp.defaultAsset}
          />}
        />
        <Route exact path="/" render={(props) =>
          <SignIn t={t}
            history={props.history}
            search={qs.parse(props.history.location.search)}
            st={propsApp.defaultAsset}
          />} />
        {currentUser && validPermission(currentUser, 'importView', 'read') ?
          <Route exact path="/import" render={(props) =>
            <Import t={t}
              history={props.history}
              user={currentUser}
              search={qs.parse(props.history.location.search)}
            />} />
          : null
        }
        {currentUser && validPermission(currentUser, 'verticalView', 'read') ?
          <Route exact path="/summary" render={(props) =>
            <DashboardOne
              user={currentUser}
              t={t}
              history={props.history}
              search={qs.parse(props.history.location.search)}
              defaultAsset={propsApp.defaultAsset}
              machineData={propsApp.machineData}
              summary={true}
              socket={propsApp.socket}
              updateCurrentUser={updateCurrentUser}
              showModalLogOff={showModalLogOff}
              displayModalLogOff={displayModalLogOff}
            />}
          />
          : null
        }
        {currentUser && validPermission(currentUser, 'digitalcups', 'read') ?
          <Route exact path='/digitalcups' render={(props) =>
            <DigitalCups
              user={currentUser}
              t={t}
              history={props.history}
              search={qs.parse(props.history.location.search)}
              defaultAsset={propsApp.defaultAsset}
              machineData={propsApp.machineData}
              socket={propsApp.socket}
            />}
          />
          : null
        }
      </Suspense>
    </Router>
  );
}

export default App;
