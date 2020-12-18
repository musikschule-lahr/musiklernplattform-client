import React from 'react';
import './styles/App.css';
import 'react-input-range/lib/css/index.css';
import { KeycloakProvider } from '@react-keycloak/web';
import { ThemeProvider, themes } from 'musiklernplattform-components';
import { HashRouter as Router } from 'react-router-dom';
import moment from 'moment';
import { Routes } from './components/Layout';
import keycloakConfig from './keycloak';
import AuthRefreshProvider from './components/AuthRefreshProvider';
import ApolloProviderWrapper from './components/ApolloProviderWrapper';
import MatrixProvider from './components/MatrixProvider';

const App = () => {
  const kcInitConfig = {
    adapter: (window.cordova.platformId === 'browser' ? 'default' : 'cordova'),
    checkLoginIframe: false,
    scope: 'openid offline_access',
  };
  if (localStorage.getItem('refreshtoken')) kcInitConfig.refreshToken = localStorage.getItem('refreshtoken');
  if (localStorage.getItem('accesstoken')) kcInitConfig.token = localStorage.getItem('accesstoken');

  moment.locale('de');
  return (
    <KeycloakProvider keycloak={keycloakConfig} autoRefreshToken={false} initConfig={kcInitConfig}>
      <ApolloProviderWrapper>
        <ThemeProvider theme={themes.defaultTheme}>
          <AuthRefreshProvider>
            <MatrixProvider>
              <Router>
                <Routes />
              </Router>
            </MatrixProvider>
          </AuthRefreshProvider>
        </ThemeProvider>
      </ApolloProviderWrapper>
    </KeycloakProvider>
  );
};

export default App;
