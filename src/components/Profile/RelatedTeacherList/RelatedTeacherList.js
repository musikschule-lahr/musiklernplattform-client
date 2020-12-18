import React, {
  useState, useEffect, useRef,
} from 'react';
import {
  TextButton, DataSheet, DataRow, Accordion, IconButton,
} from 'musiklernplattform-components';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { useHistory } from 'react-router-dom';
import AddCircleOutlineIcon from '@iconify/icons-ion/add-circle-outline';
import useMatrix from '~/components/MatrixProvider/useMatrix';
import {
  GET_TEACHERS,
  REMOVE_TEACHER_LESSON,
  REMOVE_TEACHER_GROUP,
  RELATION_UNCONFIRMED_SUBSCRIPTION,
  RELATION_CONFIRMED_SUBSCRIPTION,
  RELATION_DELETED_SUBSCRIPTION,
  GET_ALL_CONFIRMED_RELATIONS_WITH_USER,
} from '~/constants/gql/relations';
import { GET_USER } from '~/constants/gql/user';
import ChoiceModal from '~/components/Generic/ChoiceModal';
import LoadingIndicator from '~/components/Generic/LoadingIndicator';

const RelatedTeacherList = () => {
  const client = useApolloClient();
  const history = useHistory();
  const matrix = useMatrix();

  const [displayShowModal, setDisplayModal] = useState(false);
  const [formFields, setFormFields] = useState([]);

  const choiceModalData = useRef({
    message: '',
    headerMsg: '',
    onSubmit: () => {},
    onClose: () => {},
  });
  const lastGroup = useRef();
  const subsInitiated = useRef(false);

  const {
    data: userData,
  } = useQuery(GET_USER);

  const {
    loading: loadingData, error: errorData, data: relationData, refetch, subscribeToMore,
  } = useQuery(GET_TEACHERS, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  });

  const [removeLesson, { loading: removeLessonLoading }] = useMutation(
    REMOVE_TEACHER_LESSON, {
      onCompleted: () => {
        setFormFields([]);
        refetch();
      },
      onError: ((err) => {
        console.log(err);
      }),
    },
  );

  const [removeGroup, { loading: removeGroupLoading }] = useMutation(
    REMOVE_TEACHER_GROUP, {
      onCompleted: () => {
        setFormFields([]);
        if (lastGroup.current) {
          matrix.leaveRoom(lastGroup.current);
          lastGroup.current = null;
        }
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

  // TODO: use cache not refetch
  useEffect(() => {
    if (relationData && userData && !subsInitiated.current) {
      subscribeToMore({
        document: RELATION_UNCONFIRMED_SUBSCRIPTION,
        variables: { userId: parseInt(userData.getUser.id, 10) },
        updateQuery: (prev, { subscriptionData }) => {
          const subData = subscriptionData.data.relationUnconfirmedSubscription;
          if (parseInt(subData.idRelatedUser, 10)
          === parseInt(userData.getUser.id, 10) && subData.userRole === 'Teacher') {
            refetch();
          }
        },
      });
      subscribeToMore({
        document: RELATION_CONFIRMED_SUBSCRIPTION,
        variables: { userId: parseInt(userData.getUser.id, 10) },
        updateQuery: (prev, { subscriptionData }) => {
          const subData = subscriptionData.data.relationConfirmedSubscription;
          if (parseInt(subData.idRelatedUser, 10)
          === parseInt(userData.getUser.id, 10) && subData.userRole === 'Teacher') {
            refetch();
          }
        },
      });
      subscribeToMore({
        document: RELATION_DELETED_SUBSCRIPTION,
        variables: { userId: parseInt(userData.getUser.id, 10) },
        updateQuery: (prev, { subscriptionData }) => {
          const subData = subscriptionData.data.relationDeletedSubscription;
          if (parseInt(subData.idRelatedUser, 10) === parseInt(userData.getUser.id, 10)
          && subData.userRole === 'Teacher') {
            refetch();
          }
        },
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData, relationData, subsInitiated.current]);

  useEffect(() => {
    if (relationData && !loadingData) {
      const myData = [];
      relationData.getMyTeachers.forEach((teacher, index) => {
        teacher.instruments.forEach((instrument, instrumentIndex) => {
          myData.push({
            index,
            title: `${instrument.name} - ${teacher.user.firstname} ${teacher.user.lastname}`,
            firstname: teacher.user.firstname,
            lastname: teacher.user.lastname,
            mail: teacher.user.mail,
            phone: teacher.user.phone,
            userId: teacher.user.id,
            school: 'Musikschule Lahr',
            instrumentId: instrument.id,
            isConfirmed: teacher.confirmedInstruments[instrumentIndex] === true,
            instrumentName: instrument.name,
            matrixUserRoomId: teacher.matrixRoomId,
          });
        });
        teacher.groups.forEach((group, groupIndex) => {
          myData.push({
            index,
            title: `${group.name} - ${teacher.user.firstname} ${teacher.user.lastname}`,
            firstname: teacher.user.firstname,
            lastname: teacher.user.lastname,
            mail: teacher.user.mail,
            phone: teacher.user.phone,
            userId: teacher.user.id,
            school: 'Musikschule Lahr',
            groupId: group.id,
            isConfirmed: teacher.confirmedGroups[groupIndex] === true,
            groupName: group.name,
            matrixRoomId: group.matrixRoomId,
            matrixUserRoomId: teacher.matrixRoomId,
          });
        });
      });
      setFormFields(myData);
    }
  }, [relationData, loadingData]);

  // Wir lösen das so, da nach einer Subscription noch keine MatrixRoomId eingetragen sein könnte
  // daher wollen wir die matrixroomid nicht verlieren um danach den Raum verlassen zu können
  const leaveRoom = (userId) => new Promise((resolve, reject) => {
    client.query({
      query: GET_ALL_CONFIRMED_RELATIONS_WITH_USER,
      variables: {
        userId: parseInt(userId, 10),
      },
      fetchPolicy: 'network-only',
    }).then((allRelations) => {
      if (allRelations.data.getMyConfirmedRelationsWithUser.length === 1) {
        matrix.leaveRoom(allRelations.data.getMyConfirmedRelationsWithUser[0].matrixRoomId);
      }
      resolve();
    });
  });
  const removeLessonFunc = (userId, instrumentId, name, instrumentName, matrixUserRoomId) => {
    choiceModalData.current = {
      message: `Bist du sicher, dass du die Verknüpfung mit ${name} im Fach ${instrumentName} aufheben möchtest?`,
      headerMsg: 'Achtung',
      onSubmit: () => {
        setDisplayModal(false);
        leaveRoom(userId).then(() => {
          removeLesson({
            variables: {
              user: { id: parseInt(userId, 10) },
              instrument: { id: parseInt(instrumentId, 10) },
            },
          });
        });
      },
      onClose: () => { setDisplayModal(false); },
    };
    setDisplayModal(true);
  };

  const removeGroupFunc = (userId, groupId, name, groupName, matrixRoomId, matrixUserRoomId) => {
    choiceModalData.current = {
      message: `Bist du sicher, dass du die Verknüpfung mit ${name} im Ensemble ${groupName} aufheben möchtest?`,
      headerMsg: 'Achtung',
      onSubmit: () => {
        setDisplayModal(false);
        lastGroup.current = matrixRoomId;
        leaveRoom(userId).then(() => {
          removeGroup({ variables: { user: { id: parseInt(userId, 10) }, group: { id: parseInt(groupId, 10) } } });
        });
      },
      onClose: () => { setDisplayModal(false); },
    };
    setDisplayModal(true);
  };

  const getItemAccordeon = (field) => {
    let { title } = field;
    let returnLessonFunc;
    let returnGroupFunc;
    if (!field.isConfirmed) {
      title += '\n(Status: Anfrage gesendet)';
      returnLessonFunc = () => removeLessonFunc(field.userId,
        field.instrumentId, `${field.firstname} ${field.lastname}`, field.instrumentName,
        null);
      returnGroupFunc = () => removeGroupFunc(field.userId, field.groupId,
        `${field.firstname} ${field.lastname}`, field.groupName,
        null, null);
    } else {
      returnLessonFunc = () => removeLessonFunc(field.userId, field.instrumentId,
        `${field.firstname} ${field.lastname}`, field.instrumentName,
        field.matrixUserRoomId);
      returnGroupFunc = () => removeGroupFunc(field.userId, field.groupId,
        `${field.firstname} ${field.lastname}`, field.groupName, field.matrixRoomId,
        field.matrixUserRoomId);
    }
    return (
      <Accordion
        removePaddingLeft
        summary={title}
        key={`relation${field.userId}${field.instrumentId}${field.groupId}`}
      >
        <div style={{ paddingBottom: '18px' }}>
          <DataSheet className="">
            <DataRow label="Vorname" value={field.firstname || 'Keine Angabe'} />
            <DataRow label="Nachname" value={field.lastname || 'Keine Angabe'} />
            <DataRow label="E-Mail" value={field.mail || 'Keine Angabe'} />
            <DataRow label="Telefon" value={field.phone || 'Keine Angabe'} />
             {/*<DataRow label="Musikschule" value={field.school || 'Keine Angabe'} />*/}
          </DataSheet>
          {field.instrumentId ? (
            <TextButton
              className="leftTextBtn "
              onClickHandler={returnLessonFunc}
              title={`Verknüpfung mit ${field.firstname} ${field.lastname} aufheben`}
            />
          ) : (
            <TextButton
              className="leftTextBtn "
              onClickHandler={returnGroupFunc}
              title={`Verknüpfung mit ${field.firstname} ${field.lastname} aufheben`}
            />
          )}
        </div>
      </Accordion>
    );
  };

  if (loadingData || removeLessonLoading || removeGroupLoading) return (<LoadingIndicator />);

  if (errorData) {
    return (<div>Ein Fehler ist aufgetreten... Versuche es noch einmal</div>);
  }

  return (
    <div>
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
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h2 style={{ marginRight: 12 }}>
          Meine Fächer/Ensembles
        </h2>
        <IconButton
          icon={AddCircleOutlineIcon}
          onClickHandler={() => { history.push('/qr'); }}
        />
      </div>
      {formFields.map((field) => getItemAccordeon(field))}
      {formFields.length < 1 && (
        <div>Es sind aktuell keine Lehrkräfte verbunden.</div>
      )}
    </div>
  );
};

export default RelatedTeacherList;
