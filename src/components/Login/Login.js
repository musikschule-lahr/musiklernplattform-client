import React from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { Button } from 'musiklernplattform-components';
import { Redirect } from 'react-router-dom';

const Login = (() => {
  const { keycloak, initialized } = useKeycloak();
  return (
    <div className="login">
      <style dangerouslySetInnerHTML={{
        __html: `
        #app {
          background-image: url("img/background/login.jpg");
          background-position: center;
          background-size: cover;
        }
        .header{
          background: rgba(60, 60, 60, 0.75)
        }
       `,
      }}
      />
      {!initialized ? '<LoadingIndicator /> Login'
        : (
          <div>
            {!keycloak.authenticated
              ? (
                <div className="loginPage">
                  <br />
                  <Button
                    title="Anmelden"
                    name="loginBtn"
                    className="login-btn"
                    onClickHandler={() => keycloak.login({ scope: 'offline_access', cordovaOptions: { zoom: 'no' } })}
                  />
                  <br />
                  <Button
                    title="Registrieren"
                    name="registerBtn"
                    className="login-btn"
                    onClickHandler={
                      () => keycloak.register({ scope: 'offline_access', cordovaOptions: { zoom: 'no' } })
                    }
                  />
                </div>
              )
              : (
                <Redirect
                  to="/home"
                />
              )}
          </div>
        )}
    </div>
  );
});

export default Login;
