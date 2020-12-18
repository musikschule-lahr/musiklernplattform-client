import React, {
  useState, useEffect,
} from 'react';
import { DataSheet, DataRow } from 'musiklernplattform-components';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client';
import { GET_STUDENT_PARENTS } from '~/constants/gql/relations';
import ProfileHeading from '~/components/Profile/ProfileHeading';
import LoadingIndicator from '~/components/Generic/LoadingIndicator';

const UserParentList = ({ id }) => {
  const [errorMsg, setErrorMsg] = useState(null);
  const [formFields, setFormFields] = useState([]);

  const {
    loading: loadingData, data: relationData, error,
  } = useQuery(GET_STUDENT_PARENTS, {
    fetchPolicy: 'cache-and-network',
    variables: {
      userid: parseInt(id, 10),
    },
    onError: (err) => {
      setErrorMsg(err);
    },
  });
  useEffect(() => {
    if (relationData && !loadingData) {
      const myData = [];
      relationData.getStudentParents.forEach((parent, index) => {
        myData.push({
          index,
          firstname: parent.user.firstname,
          lastname: parent.user.lastname,
          mail: parent.user.mail,
          phone: parent.user.phone,
          userId: parent.user.id,
        });
      });
      setFormFields(myData);
    }
  }, [relationData, loadingData]);

  if (loadingData) return (<LoadingIndicator padding />);
  if (error) {
    // TODO: Besseres Error Handling
    return 'Keine Berechtigung für diese Information.';
  }
  return (
    <div className="marginBottom">
      <ProfileHeading heading="Familienmitglieder" />
      {errorMsg && <div className="errorField">{errorMsg}</div>}
      {(formFields || []).map((field) => (
        <div className="marginBottom" key={`relation_${field.index}`}>
          <DataSheet width="auto">
            <DataRow label="Vorname" value={field.firstname || 'Keine Angabe'} />
            <DataRow label="Nachname" value={field.lastname || 'Keine Angabe'} />
            <DataRow label="E-Mail" value={field.mail || 'Keine Angabe'} />
            <DataRow label="Telefon" value={field.phone || 'Keine Angabe'} />
          </DataSheet>
        </div>
      ))}
      {formFields.length < 1 && (
        <div>Es sind keine Familienmitglieder verbunden.</div>
      )}
    </div>

  );
};

UserParentList.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default UserParentList;
