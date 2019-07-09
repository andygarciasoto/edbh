import React, { Suspense } from 'react';
import './sass/App.scss';
import Spinner from  './Spinner';
import SignIn from './SignIn';
import DashboardOne from './Dashboard/DashboardOne';
import { useTranslation } from 'react-i18next';
import { BrowserRouter as Router, Route } from 'react-router-dom';

function App() {
  const { t } = useTranslation();
  return (
    <Router>
      <Suspense fallback={<Spinner />}>
        <Route path="/dashboard" render={()=> <DashboardOne t={t}/>} />
        <Route exact path="/" render={()=> <SignIn t={t}/>}/>
        {/* <SignIn t={t}/> */}
        {/* <DashboardOne t={t}/> */}
        {/* <Spinner /> */}
      </Suspense>
    </Router>
  );
}

export default App;
