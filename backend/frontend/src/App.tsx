import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { ThemeProvider } from './modules/Theme/contexts/Theme.Context';
import { DashboardPage } from './modules/Dashboard/pages/Dashboard.Page';
import './i18n'; // Initialise translations dictionary

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <DashboardPage />
      </ThemeProvider>
    </Provider>
  );
};

export default App;
