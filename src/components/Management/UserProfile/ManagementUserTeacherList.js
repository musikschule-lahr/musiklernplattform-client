import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import {
  DataSheet, DataRow,
} from 'musiklernplattform-components';
import PropTypes from 'prop-types';
import ProfileHeading from '~/components/Profile/ProfileHeading';
import {
  GET_STUDENT_TEACHERS,
} from '~/constants/gql/relations';
import LoadingIndicator from '~/components/Generic/LoadingIndicator';

const TeacherList = ({ id }) => {
  const [errorMsg, setErrorMsg] = useState(null);
  const {
    loading, data, error,
  } = useQuery(GET_STUDENT_TEACHERS, {
    variables: { userid: parseInt(id, 10) },
    fetchPolicy: 'cache-and-network',
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
    // TODO: Besseres Error Handling
    return 'Keine Berechtigung für diese Information.';
  }
  return (
    <div className="marginBottom">
      <ProfileHeading heading="Verbundene Lehrkräfte" />
      {errorMsg && <div className="errorField">{errorMsg}</div>}
      {data.getStudentTeachers
      && (
      <DataSheet width="auto">
        {data.getStudentTeachers.map((teacher) => (
          <DataRow
            key={`teacher${teacher.user.id}`}
            label=""
            value={`${teacher.user.firstname}
          ${teacher.user.lastname}, ${
              teacher.instruments.map((instrument, instrumentIndex) => (
                (instrumentIndex > 0 && instrumentIndex ? ' ' : '') + instrument.name
              ))
            }${((teacher.instruments || []).length > 0 && (teacher.groups || []).length > 0) ? ', ' : ''}${
              (teacher.groups || []).map((group, groupIndex) => (
                (groupIndex > 0 ? ' ' : '') + group.name
              ))
            }`}
          />
        ))}
      </DataSheet>
      )}
    </div>
  );
};

TeacherList.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default TeacherList;
