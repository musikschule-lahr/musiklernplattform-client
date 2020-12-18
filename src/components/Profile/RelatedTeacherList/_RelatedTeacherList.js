import React, {
  useState, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import {
  TextButton, DataSheet, DataRow, Accordion, IconButton,
} from 'musiklernplattform-components';
import { useQuery, useMutation } from '@apollo/client';
import { useHistory } from 'react-router-dom';
import AddCircleOutlineIcon from '@iconify/icons-ion/add-circle-outline';
import { GET_TEACHERS, REMOVE_TEACHER_LESSON, REMOVE_TEACHER_GROUP } from '~/constants/gql/relations';
import { GET_USER } from '~/constants/gql/user';
import RelationList from '~/components/Profile/RelationList';

const RelatedTeacherList = ({ teacherQuery }) => {
  const [formFields, setFormFields] = useState([]);

  const history = useHistory();

  const {
    loading: loadingData, error: errorData, data: relationData, refetch,
  } = useQuery(teacherQuery);

  const [removeLesson, { loading: removeLessonLoading }] = useMutation(
    REMOVE_TEACHER_LESSON, {
      update: () => {
        setFormFields([]);
        refetch();
      },
      onError: ((err) => {
        console.log(err);
      }),
      refetchQueries: [
        { query: GET_USER },
      ],
    },
  );

  const [removeGroup, { loading: removeGroupLoading }] = useMutation(
    REMOVE_TEACHER_GROUP, {
      update: () => {
        setFormFields([]);
        refetch();
      },
      onError: ((err) => {
        console.log(err);
      }),
      refetchQueries: [
        { query: GET_USER },
      ],
    },
  );

  useEffect(() => {
    if (relationData && !loadingData) {
      const myData = [];
      const teachMap = {};
      relationData.getMyTeachers.forEach((teacher, index) => {
        const groups = [];
        const instruments = [];
        const confirmed = [];
        const unconfirmed = [];
        const confirmedGroups = [];
        let instrumentText = '';
        teacher.instruments.forEach((instrument, instrumentIndex) => {
          if (teacher.confirmedInstruments[instrumentIndex]) {
            instrumentText += `${instrument.name},`;
            confirmed.push({
              id: instrument.id,
              name: instrument.name,
              isConfirmed: true,
            });
          } else {
            unconfirmed.push({
              id: instrument.id,
              name: instrument.name,
              isConfirmed: false,
              disabled: true,
            });
          }
          instruments.push(
            {
              isConfirmed: teacher.confirmedInstruments[instrumentIndex],
              id: instrument.id,
              name: instrument.name,
            },
          );
        });
        teacher.groups.forEach((group) => {
          groups.push(group);
          confirmedGroups.push({
            id: group.id,
            name: group.name,
            isConfirmed: true,
          });
        });
        if (instrumentText.length > 0) {
          instrumentText = instrumentText.substring(0, instrumentText.length - 1);
        } else {
          instrumentText = '-';
        }
        teachMap[teacher.user.id] = index;
        myData.push({
          index,
          title: `Lehrer: ${teacher.user.firstname} ${teacher.user.lastname} (${instrumentText})`,
          firstname: teacher.user.firstname,
          lastname: teacher.user.lastname,
          mail: teacher.user.mail,
          phone: teacher.user.phone,
          userId: teacher.user.id,
          school: 'Musikschule Lahr',
          ensembles: groups,
          instruments,
          confirmed,
          confirmedEnsembles: confirmedGroups,
          id: teacher.user.id,
          unconfirmed,
        });
      });
      setFormFields(myData);
    }
  }, [relationData, loadingData]);

  const removeLessonFunc = (userId, instrumentId) => {
    console.log('Remove', userId, instrumentId);
    removeLesson({ variables: { user: { id: userId }, instrument: { id: instrumentId } } });
  };

  const removeGroupFunc = (userId, groupId) => {
    console.log('Remove', userId, groupId);
    removeGroup({ variables: { user: { id: userId }, group: { id: groupId } } });
  };

  if (loadingData || removeLessonLoading) return (<LoadingIndicator />);

  if (errorData) {
    return (<div>Ein Fehler ist aufgetreten... Versuche es noch einmal</div>);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h2 style={{ marginRight: '0.5rem' }}>
          Lehrkräfte
        </h2>
        <IconButton
          icon={AddCircleOutlineIcon}
          onClickHandler={() => { history.push('/qr'); }}
        />
      </div>
      {formFields.map((field) => (
        <Accordion summary={field.title} key={`relation_${field.index}`}>
          <div style={{ paddingBottom: '1rem' }}>
            <DataSheet>
              <DataRow label="Vorname" value={field.firstname || 'Keine Angabe'} />
              <DataRow label="Nachname" value={field.lastname || 'Keine Angabe'} />
              <DataRow label="E-Mail" value={field.mail || 'Keine Angabe'} />
              <DataRow label="Telefon" value={field.phone || 'Keine Angabe'} />
             {/*<DataRow label="Musikschule" value={field.school || 'Keine Angabe'} />*/}
              <DataRow
                label="Ensembles"
                value={
                  field.ensembles.length < 1 ? '-'
                    : (field.ensembles.map(
                      (ensemble, index) => `${((index > 0) ? ' ' : '') + ensemble.name}`,
                    )
                    ).toString()
                  }
              />
            </DataSheet>
            {field.confirmed.length > 0 && (
            <RelationList
              heading="Bestätigte Verbindungen"
              elements={field.confirmed}
              noElementMsg={`Verbindungen mit ${field.firstname} ${field.lastname} stehen noch aus.`}
              onRemove={(instrumentId) => removeLessonFunc(field.id, instrumentId)}
            />
            )}
            {field.confirmedEnsembles.length > 0 && (
            <RelationList
              heading="Ensembles"
              elements={field.confirmedEnsembles}
              noElementMsg={`Ensemble-Verbindungen mit ${field.firstname} ${field.lastname} stehen noch aus.`}
              onRemove={(groupId) => removeGroupFunc(field.id, groupId)}
            />
            )}
            {field.unconfirmed.length > 0 && (
            <RelationList
              heading="Ausstehende Verbindungen"
              elements={field.unconfirmed}
              noElementMsg={`Verbindungen mit ${field.firstname} ${field.lastname} stehen noch aus.`}
            />
            )}
          </div>
        </Accordion>
      ))}
      {formFields.length < 1 && (
        <div>Es sind keine Lehrer verbunden.</div>
      )}
    </div>

  );
};

RelatedTeacherList.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  teacherQuery: PropTypes.object,
};
RelatedTeacherList.defaultProps = {
  teacherQuery: GET_TEACHERS,
};
export default RelatedTeacherList;
