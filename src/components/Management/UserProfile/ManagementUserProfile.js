import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import PropTypes from 'prop-types';
import {
  GET_USER_BY_ID,
} from '~/constants/gql/user';
import ProfileData from '~/components/Profile/UserProfile/ProfileData';
import LoadingIndicator from '~/components/Generic/LoadingIndicator';

const UserProfile = ({ id }) => {
  const [errorMsg, setErrorMsg] = useState(null);

  const {
    loading, data, error,
  } = useQuery(GET_USER_BY_ID, {
    variables: { userId: parseInt(id, 10) },
    errorPolicy: 'all',
    returnPartialData: true,
    onError: (err) => {
      setErrorMsg(err);
    },
  });

  if (loading) {
    return <LoadingIndicator padding />;
  }
  if (error) {
    console.log(error);
    // TODO: Besseres Error Handling
    return 'Keine Berechtigung für diese Information.';
  }
  return (
    <div className="marginBottom">
      {errorMsg && <div className="errorField">{errorMsg}</div>}
      {data.getUserFromId
       && (
       <ProfileData
         firstname={data.getUserFromId.firstname}
         lastname={data.getUserFromId.lastname}
         mail={data.getUserFromId.mail}
         phone={data.getUserFromId.phone}
         username={data.getUserFromId.username}
         birthyear={data.getUserFromId.birthyear}
         instruments={data.getUserFromId.instruments}
       />
       )}
    </div>
  );
};

UserProfile.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default UserProfile;
