import React from 'react';
import './sass/App.scss';
import SignIn from './SignIn';
import './sass/SignIn.scss';
import DashboardOne from './Dashboard/DashboardOne';

function App() {
  return (
    <div>
      {/* <SignIn /> */}
      <DashboardOne/>
    </div>
  );
}

export default App;