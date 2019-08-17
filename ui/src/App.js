import React, { Suspense } from 'react';
import './sass/App.scss';
import Spinner from  './Spinner';
import SignIn from './SignIn';
import Login from './Login';
import DashboardOne from './Dashboard/DashboardOne';
import { useTranslation } from 'react-i18next';
import { BrowserRouter as Router, Route } from 'react-router-dom';

function App(props) {
  const { t } = useTranslation();
  return (
    <Router>
      <Suspense fallback={<Spinner />}>
        <Route path="/dashboard" render={()=> <DashboardOne user={props.user} t={t}/>} />
        <Route exact path="/login" render={()=> <Login t={t}/>}/>
        <Route exact path="/" render={()=> <SignIn t={t}/>}/>
      </Suspense>
    </Router>
  );
}

export default App;
