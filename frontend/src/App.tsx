import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { DashboardPage } from './modules/Dashboard/pages/Dashboard.Page';
import './i18n'; // Initialise translations dictionary

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <DashboardPage />
    </Provider>
  );
};

export default App;
