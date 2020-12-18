import React, {
  useState, useEffect, useRef,
} from 'react';
import PropTypes from 'prop-types';
import {
  IconButton,
  List,
  ListItem,
} from 'musiklernplattform-components';
import TrashIcon from '@iconify/icons-ion/trash-outline';
import {
  useQuery, useMutation, useApolloClient,
} from '@apollo/client';
import { useHistory } from 'react-router-dom';
import ProfileHeading from '~/components/Profile/ProfileHeading';
import ChoiceModal from '~/components/Generic/ChoiceModal';
import useMatrix from '~/components/MatrixProvider/useMatrix';
import LoadingIndicator from '~/components/Generic/LoadingIndicator';
import {
  GET_CONFIRMED_WITH_RELATED_STUDENT,
  GET_STUDENT_TEACHERS,
  REMOVE_RELATION_FROM_USER,
  RELATION_DELETED_SUBSCRIPTION,
  GET_ALL_CONFIRMED_RELATIONS_WITH_USER,
} from '~/constants/gql/relations';
import { GET_GROUP } from '~/constants/gql/group';
import { GET_USER } from '~/constants/gql/user';

const ManagementRemove = ({ id }) => {
  const client = useApolloClient();
  const history = useHistory();
  const matrix = useMatrix();

  const [displayShowModal, setDisplayModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [lessons, setLessons] = useState(null);

  const choiceModalData = useRef({
    message: '',
    headerMsg: '',
    onSubmit: () => {},
    onClose: () => {},
  });
  const lastRemoved = useRef(null);
  const subsInitiated = useRef(false);

  const {
    data: userData,
  } = useQuery(GET_USER);

  const {
    loading, data, subscribeToMore,
  } = useQuery(GET_CONFIRMED_WITH_RELATED_STUDENT, {
    variables: { userId: parseInt(id, 10) },
    errorPolicy: 'all',
    returnPartialData: true,
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    onCompleted: (result) => {
      const lessonList = [];
      if (result.getConfirmedWithRelatedStudent.length > 0) {
        result.getConfirmedWithRelatedStudent.map((lesson) => {
          if ((lesson.instruments || []).length > 0) {
            lessonList.push({
              isLesson: true, id: lesson.id, name: lesson.instruments[0].name, index: lessonList.length,
            });
          }
          if ((lesson.groups || []).length > 0) {
            lessonList.push({
              isLesson: false, id: lesson.id, name: lesson.groups[0].name, index: lessonList.length,
            });
          }
        });
      }
      setLessons(lessonList);
    },
    onError: (err) => {
      setErrorMsg('Ein Fehler ist aufgetreten');
    },
  });

  const onRemoved = () => {
    const newData = [...data.getConfirmedWithRelatedStudent];
    const foundData = newData.findIndex((element) => parseInt(element.id, 10) === parseInt(lastRemoved.current, 10));

    if (foundData > -1) {
      const old = newData[foundData];
      if (old.groups !== null) {
        matrix.removeUserFromRoom(old.groups[0].matrixRoomId,
          old.relatedUser.matrixUserName);
      }
      newData.splice(foundData, 1);
    }
    client.cache.writeQuery({
      query: GET_CONFIRMED_WITH_RELATED_STUDENT,
      variables: { userId: parseInt(id, 10) },
      data: { getConfirmedWithRelatedStudent: newData },
    });
    const newLessons = [...lessons];
    const found = newLessons.findIndex((element) => parseInt(element.id, 10) === parseInt(lastRemoved.current, 10));
    if (found > -1) newLessons.splice(found, 1);
    if (newLessons.length - 1 <= 0) {
      history.push('/management');
    } else setLessons(newLessons);
  };

  const [removeRelation, {
    loading: loadingRemove,
  }] = useMutation(REMOVE_RELATION_FROM_USER, {
    update: () => {
      onRemoved();
    },
    onError: (err) => {
      console.log(err);
      setErrorMsg('Ein Fehler ist aufgetreten');
    },
    refetchQueries: [
      {
        query: GET_STUDENT_TEACHERS,
        variables: { userid: parseInt(id, 10) },
      },
    ],
  });

  useEffect(() => {
    if (lessons && userData && !subsInitiated.current) {
      subsInitiated.current = true;
      subscribeToMore({
        document: RELATION_DELETED_SUBSCRIPTION,
        variables: { userId: parseInt(userData.getUser.id, 10) },
        updateQuery: (prev, { subscriptionData }) => {
          const subData = subscriptionData.data.relationDeletedSubscription;
          if (parseInt(subData.idUser, 10) === parseInt(userData.getUser.id, 10)
          && parseInt(subData.idRelatedUser, 10) === parseInt(id, 10)
          && subData.userRole === 'Teacher') {
            lastRemoved.current = subData.idRelation;
            onRemoved();
          }
        },
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData, lessons, subsInitiated.current]);

  const remove = (relationId, name) => {
    lastRemoved.current = relationId;
    choiceModalData.current = {
      message: `Bist du sicher, dass du die Verknüpfung im Fach ${name} aufheben möchtest?`,
      headerMsg: 'Achtung',
      onSubmit: () => {
        setDisplayModal(false);
        client.query({
          query: GET_ALL_CONFIRMED_RELATIONS_WITH_USER,
          variables: {
            userId: parseInt(id, 10),
          },
          fetchPolicy: 'network-only',
        }).then((allRelations) => {
          if (allRelations.data.getMyConfirmedRelationsWithUser.length === 1) {
            matrix.leaveRoom(allRelations.data.getMyConfirmedRelationsWithUser[0].matrixRoomId);
          }
          removeRelation({
            variables: {
              relation: { id: parseInt(relationId, 10) },
            },
          });
        });
      },
      onClose: () => { setDisplayModal(false); },
    };
    setDisplayModal(true);
  };

  if (loading || loadingRemove || !lessons) return <LoadingIndicator padding />;

  return (
    <div className="marginBottom">
      {displayShowModal
      && (
      <ChoiceModal
        headerMsg={choiceModalData.current.headerMsg}
        message={choiceModalData.current.message}
        onClose={choiceModalData.current.onClose}
        onSubmit={choiceModalData.current.onSubmit}
        submitText="OK"
        closeText="Abbrechen"
      />
      )}
      {errorMsg && <div className="errorField">{errorMsg}</div>}
      <ProfileHeading heading="Vorhandene Verbindungen" />
      {lessons.length < 1 && 'Es sind keine Verbindungen vorhanden.'}
      <List>
        {lessons.map((lesson) => (
          <ListItem key={`lesson-${lesson.id}`} removePadding>
            <div style={{ display: 'flex', flexBasis: '100%', alignItems: 'center' }}>
              <span style={{ flexGrow: 2 }}>{`${lesson.name}`}</span>
              <IconButton
                style={{ flexGrow: 1 }}
                s
                icon={TrashIcon}
                onClickHandler={() => { remove(lesson.id, lesson.name); }}
              />
            </div>
          </ListItem>
        ))}
      </List>
    </div>

  );
};

ManagementRemove.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default ManagementRemove;
