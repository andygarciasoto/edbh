import React from 'react';
import './sass/App.scss';
import SignIn from './SignIn';
import DashboardOne from './Dashboard/DashboardOne';
import Spinner from  './Layout/Spinner';
import './Layout/Spinner.scss';

function App() {
  return (
    <div>
      <SignIn />
      {/* <DashboardOne/> */}
      {/* <Spinner /> */}
    </div>
  );
}

export default App;