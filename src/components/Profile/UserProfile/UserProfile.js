import React, { useState, useRef } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  TextButton,
} from 'musiklernplattform-components';
import { useKeycloak } from '@react-keycloak/web';
import { useHistory } from 'react-router-dom';
import ProfileForm from './ProfileForm';
import ProfileData from './ProfileData';
import ProfileHeading from '../ProfileHeading';
import {
  GET_USER, REGISTER_USER, UPDATE_USER,
} from '~/constants/gql/user';
import useMatrix from '~/components/MatrixProvider/useMatrix';
import { usePlans } from '~/constants/hooks';
import LoadingIndicator from '~/components/Generic/LoadingIndicator';

const UserProfile = () => {
  const { keycloak } = useKeycloak();
  const matrix = useMatrix();
  const { loading: loadingPlans, updatePlans } = usePlans();
  const history = useHistory();

  // State
  const [errorMsg, setErrorMsg] = useState();
  const [existsMissingData, toggleExistsMissingData] = useState(false);
  const [showEdit, toggleEdit] = useState(false);

  const input = useRef({});

  // Queries
  const {
    loading, error, data, refetch,
  } = useQuery(GET_USER, {
    errorPolicy: 'all',
    returnPartialData: true,
    onCompleted: (result) => {
      toggleExistsMissingData(false);
      input.current = result.getUser;
      matrix.setDisplayName(`${result.getUser.firstname} ${result.getUser.lastname}`, () => {});
    },
    onError: (err) => {
      const { email: mail, given_name: firstname, family_name: lastname } = keycloak.idTokenParsed;
      input.current = { mail, firstname, lastname };
      toggleExistsMissingData(true);
    },
  });

  // Mutations
  const [registerUser, { loading: loadingRegisterMutation }] = useMutation(
    REGISTER_USER, {
      errorPolicy: 'all',
      update: () => {
        toggleExistsMissingData(false);
        refetch();
        updatePlans();
        setErrorMsg(null);
      },
      onError: ((err) => {
        console.log(err);
        setErrorMsg('Es ist ein Fehler aufgetreten, bitte prüfe die Daten.');
      }),
      refetchQueries: [
        { query: GET_USER },
      ],
    },
  );

  const [updateUser, { loading: loadingUpdateMutation }] = useMutation(
    UPDATE_USER, {
      errorPolicy: 'all,',
      update: (cache, { data: result }) => {
        cache.writeQuery({
          query: GET_USER,
          data: { getUser: result.updateRegisteredUser },
        });
        setErrorMsg(null);
        toggleEdit(false);
        toggleExistsMissingData(false);
      },
      onError: ((err) => {
        console.log(err);
        setErrorMsg('Es ist ein Fehler aufgetreten, bitte prüfe die Daten.');
      }),
    },
  );

  // Component functions
  function doRegister(variables) {
    //   setForminput.current(...variables);
    const newVars = { ...variables };
    input.current = { ...newVars };
    registerUser({ variables: newVars });
  }
  function doUpdate(variables) {
    //  setForminput.current(...variables);
    const newVars = { ...variables };
    input.current = { ...newVars };
    updateUser({ variables: newVars });
  }

  // Loading
  if (loading || loadingRegisterMutation || loadingUpdateMutation || loadingPlans) {
    return <LoadingIndicator />;
  }

  // Error Handling
  if (existsMissingData && data && !error) {
    // Wir haben den Nutzer, aber es fehlen noch Daten...
    if (data.getUser) {
      return (
        <div>
          <ProfileHeading heading="Meine Daten" />
          {errorMsg && <div className="errorField">{errorMsg}</div>}
          <ProfileForm
            infoText="Es fehlen noch wichtige Daten! Bitte fülle dein Profil aus!"
            firstname={input.current.firstname ? input.current.firstname : data.getUser.firstname}
            lastname={input.current.lastname ? input.current.lastname : data.getUser.lastname}
            mail={input.current.mail ? input.current.mail : data.getUser.mail}
            phone={input.current.phone ? input.current.phone : data.getUser.phone}
            username={input.current.username ? input.current.username : data.getUser.username}
            instruments={input.current.instruments ? input.current.instruments : data.getUser.instruments}
            birthyear={input.current.birthyear ? input.current.birthyear : data.getUser.birthyear}
            onSubmit={doUpdate}
            onClose={() => {
              history.push('/home');
            }}
          />
        </div>
      );
    }
    // Es fehlen komplett alle Daten
    return (
      <div>
        <ProfileHeading heading="Meine Daten" />
        {errorMsg && <div className="errorField">{errorMsg}</div>}

        <ProfileForm
          firstname={input.current.firstname}
          lastname={input.current.lastname}
          mail={input.current.mail}
          phone={input.current.phone}
          username={input.current.username}
          instruments={input.current.instruments}
          birthyear={input.current.birthyear}
          onSubmit={doUpdate}
          onClose={() => {
            history.push('/home');
          }}
        />
      </div>
    );
  }

  // Es gab einen allgemeinen Fehler
  if (error) {
    return (
      <div>
        <ProfileHeading heading="Meine Daten" />
        {errorMsg && <div className="errorField">{errorMsg}</div>}
        <ProfileForm
          infoText='Bitte fülle alle Felder aus. Klicke danach auf "Fertig".'
          firstname={input.current.firstname}
          lastname={input.current.lastname}
          mail={input.current.mail}
          phone={input.current.phone}
          username={input.current.username}
          instruments={input.current.instruments}
          birthyear={input.current.birthyear}
          onSubmit={doRegister}
          onClose={() => {
            history.push('/home');
          }}
        />
      </div>
    );
  }
  return (
    <div>
      <ProfileHeading heading="Meine Daten">
        <TextButton
          onClickHandler={() => toggleEdit(!showEdit)}
          title="Bearbeiten"
        />
      </ProfileHeading>

      {showEdit && (
        <ProfileForm
          infoText=""
          firstname={input.current.firstname}
          lastname={input.current.lastname}
          mail={input.current.mail}
          phone={input.current.phone}
          username={input.current.username}
          instruments={input.current.instruments}
          birthyear={input.current.birthyear}
          onSubmit={doUpdate}
          onClose={() => {
            toggleEdit(false);
          }}
        />
      )}
      {errorMsg && <div className="errorField">{errorMsg}</div>}
      <ProfileData
        firstname={data.getUser.firstname}
        lastname={data.getUser.lastname}
        mail={data.getUser.mail}
        phone={data.getUser.phone}
        username={data.getUser.username}
        birthyear={data.getUser.birthyear}
        instruments={data.getUser.instruments}
      />
    </div>
  );
};

export default UserProfile;
