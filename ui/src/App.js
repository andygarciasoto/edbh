import React, { Suspense, useState } from 'react';
import Spinner from './Components/Common/Spinner';
import SignIn from './Views/SignIn';
import Login from './Views/Login';
import Header from './Components/Header/Header';
import DashboardOne from './Views/DashboardOneExample';
import Import from './Views/Import';
import SesionManage from './Views/SesionManage';
import { useTranslation } from 'react-i18next';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { isComponentValid } from './Utils/Requests';
import * as qs from 'query-string';

function App(propsApp) {
  // set default machine and type
  let [showModal, displayModal] = useState(false);
  let [showModalLogOff, displayModalLogOff] = useState(false);
  let [currentUser, changeCurrentUser] = useState(propsApp.user);
  const updateCurrentUser = (newUser) => {
    changeCurrentUser({ ...currentUser, currentUser: newUser });
  }
  let [activeOperators, changeActiveOperators] = useState([]);

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
            (props.location.pathname === "/dashboard" || props.location.pathname === "/import" || props.location.pathname === "/summary") &&
            <Header
              history={props.history}
              t={t}
              user={currentUser}
              machineData={propsApp.machineData}
              openModal={displayModal}
              displayModalLogOff={displayModalLogOff}
              changeCurrentUser={updateCurrentUser}
            />}
        />
        {currentUser && isComponentValid(currentUser.role, 'dashboardOne') ?
          <Route
            path="/dashboard"
            render={(props) => {
              return (
                <DashboardOne
                  user={currentUser}
                  t={t}
                  history={props.history}
                  search={qs.parse(props.history.location.search)}
                  modal_order_IsOpen={showModal}
                  closeOrderModal={displayModal}
                  defaultAsset={propsApp.defaultAsset}
                  machineData={propsApp.machineData}
                  changeActiveOperators={changeActiveOperators}
                  activeOperators={activeOperators}
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
        {currentUser && isComponentValid(currentUser.role, 'import') ?
          <Route exact path="/import" render={(props) =>
            <Import t={t}
              history={props.history}
              user={currentUser}
              search={qs.parse(props.history.location.search)}
            />} />
          : null
        }
        {currentUser && isComponentValid(currentUser.role, 'summary') ?
          <Route exact path="/summary" render={(props) =>
            <DashboardOne
              user={currentUser}
              t={t}
              history={props.history}
              search={qs.parse(props.history.location.search)}
              summary={true}
              defaultAsset={propsApp.defaultAsset}
              machineData={propsApp.machineData}
            />}
          />
          : null
        }
        <Route path="/"
          render={(props) =>
            (props.location.pathname === "/dashboard" || props.location.pathname === "/import" || props.location.pathname === "/summary") &&
            <SesionManage
              history={props.history}
              search={qs.parse(props.history.location.search)}
              t={t}
              user={currentUser}
              machineData={propsApp.machineData}
              tryToOpenModalLogOff={showModalLogOff}
              displayModalLogOff={displayModalLogOff}
              changeCurrentUser={updateCurrentUser}
              changeActiveOperators={changeActiveOperators}
              activeOperators={activeOperators}
            />}
        />
      </Suspense>
    </Router>
  );
}

export default App;
