import React, { Suspense } from 'react';
import './sass/App.scss';
import Spinner from  './Spinner';
import SignIn from './SignIn';
import DashboardOne from './Dashboard/DashboardOne';
import { useTranslation } from 'react-i18next';

function App() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<Spinner />}>
      {/* <SignIn t={t}/> */}
      <DashboardOne t={t}/>
      {/* <Spinner /> */}
    </Suspense>
  );
}

export default App;
