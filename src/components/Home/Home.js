import React from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useQuery } from '@apollo/client';
import { Button } from 'musiklernplattform-components';
import { Redirect, Link } from 'react-router-dom';
import { GET_USER } from '~/constants/gql/user';
import useMatrix from '~/components/MatrixProvider/useMatrix';

const Home = () => {
  const matrix = useMatrix();
  const { keycloak } = useKeycloak();
  const {
    loading, error, data,
  } = useQuery(GET_USER);

  return (
    <div className="home">
      <h2>Willkommen</h2>
      {keycloak.authenticated
        ? (
          <div>
            {data
              ? (
                <span>
                  Hallo&nbsp;
                  {data.getUser.username}
                  !
                </span>
              ) : (
                <span>
                  Um die Anwendung nutzen zu können, musst du zuerst dein Profil vervollständigen.
                  <br />
                  Klicke hierzu unten auf "Mein Profil".
                </span>
              )}

            <br />
            <br />
            <br />
            <Button
              title="Abmelden"
              name="logoutBtn"
              onClickHandler={
                  () => {
                    localStorage.removeItem('accesstoken');
                    localStorage.removeItem('refreshtoken');
                    localStorage.removeItem('matrixtoken');
                    matrix.logout();
                    keycloak.logout();
                    if (window.device.platform.toLowerCase() === 'ios') {
                      window.location.href = window.location.href.substring(0, window.location.href.indexOf('#'));
                    }
                  }
                }
            />
          </div>
        )

        : <span>Bitte loggen Sie sich ein!</span>}
    </div>
  );
};

export default Home;
