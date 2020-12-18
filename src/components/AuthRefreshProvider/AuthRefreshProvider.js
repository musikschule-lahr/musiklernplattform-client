import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useKeycloak } from '@react-keycloak/web';

const AuthRefreshProvider = ({ children }) => {
  const { keycloak, initialized } = useKeycloak();
  useEffect(() => {
    if (initialized && keycloak.authenticated) {
      localStorage.setItem('accesstoken', keycloak.token);
      localStorage.setItem('refreshtoken', keycloak.refreshToken);
    } else if (initialized && !keycloak.authenticated && localStorage.getItem('refreshtoken')) {
      keycloak.updateToken(1500)
        .then((refreshed) => {
          if (refreshed) {
            console.log('Token was successfully refreshed');
          } else {
            console.log('Token is still valid');
          }
          localStorage.setItem('accesstoken', keycloak.token);
          localStorage.setItem('refreshtoken', keycloak.refreshToken);
        }).catch(() => {
          console.log('Failed to refresh the token, or the session has expired');
          localStorage.removeItem('accesstoken', keycloak.token);
          localStorage.removeItem('refreshtoken', keycloak.refreshToken);
        });
    }
  }, [initialized, keycloak]);

  return (
    <>
      {initialized
        && children}
    </>
  );
};

AuthRefreshProvider.propTypes = {
  children: PropTypes.node,
};

AuthRefreshProvider.defaultProps = {
  children: <div />,
};

export default AuthRefreshProvider;
