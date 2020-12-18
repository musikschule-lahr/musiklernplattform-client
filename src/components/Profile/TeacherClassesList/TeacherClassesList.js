/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useEffect, useRef } from 'react';
import {
  Accordion,
  IconButton,
  Row,
  Col,
  // ToggleSwitch,
  TextButton,
} from 'musiklernplattform-components';
import {
  useQuery, useMutation, useApolloClient,
} from '@apollo/client';
import QRCode from 'react-qr-code';
import AddCircleOutlineIcon from '@iconify/icons-ion/add-circle-outline';
import sort from 'fast-sort';
import useMatrix from '~/components/MatrixProvider/useMatrix';
import {
  GET_OWNED_GROUPS, ADD_GROUP, REMOVE_GROUP, ADD_GROUP_MATRIX_ROOM,
} from '~/constants/gql/group';
import { GET_SORTED_CONTACT_LIST } from '~/constants/gql/cache';
import {
  ADD_TEACHED_INSTRUMENTS, REMOVE_TEACHED_INSTRUMENTS, GET_ONLY_GROUP_RELATED_STUDENTS,
} from '~/constants/gql/relations';
import { GET_USER } from '~/constants/gql/user';
import { QR, checkGroupsAndAddRooms } from '~/constants/util';
import ClassesForm from './ClassesForm';
import QRWindow from '../QRWindow';
import ChoiceModal from '~/components/Generic/ChoiceModal';
import LoadingIndicator from '~/components/Generic/LoadingIndicator';

const TeacherClassesList = () => {
  const client = useApolloClient();
  const matrix = useMatrix();

  const [addNew, setAddNew] = useState(false);
  const [codeContent, setCodeContent] = useState('');
  const [displayShowModal, setDisplayModal] = useState(false);
  const [list, setList] = useState([]);
  const [showQR, setShowQR] = useState(false);

  const choiceModalData = useRef({
    message: '',
    headerMsg: '',
    onSubmit: () => {},
    onClose: () => {},
  });
  const lastRemovedInstrument = useRef(null);

  const {
    loading: loadingData, error: errorData, data: teacherData,refetch
  } = useQuery(
    GET_OWNED_GROUPS,
    {
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
      onCompleted: (data) =>{
        checkGroupsAndAddRooms(data.getGroupsOfOwner,matrix,client).then((addedNew) =>{
          console.log("missing rooms checked and if missing added")
          if(addedNew) refetch();
        })
    }
  },
  );
  const { data: userData, loading: userLoading } = useQuery(GET_USER, {
  });

  const [addLesson, { loading: addLessonLoading }] = useMutation(
    ADD_TEACHED_INSTRUMENTS, {
      errorPolicy: 'all',
      update: (cache, { data: result }) => {
        const { teachedInstruments, ...otherUserData } = userData.getUser;
        cache.writeQuery({
          query: GET_USER,
          data: {
            getUser: {
              ...otherUserData,
              teachedInstruments:
            [...result.addTeachedInstruments.teachedInstruments],
            },
          },
        });
      },
      onError: ((err) => {
        console.log(err);
      }),
    },
  );
  const [addGroup, { loading: addGroupLoading }] = useMutation(
    ADD_GROUP, {
      errorPolicy: 'all',
      update: (cache, { data: result }) => {
        matrix.addNewRoom([], result.addGroup.name, false).then((newRoom) => {
           if (!newRoom) return;
          client.mutate({
            mutation: ADD_GROUP_MATRIX_ROOM,
            variables: {
              group: { id: parseInt(result.addGroup.idGroup, 10) },
              room: newRoom.room_id,
            },
          });
          const newGroup = { ...result.addGroup };
          //  newGroup.matrixRoomId = newRoom.room_id;
          const newlist = [...list];
          newlist.push(newGroup);
          const sorted = sort(newlist).asc((u) => u.name.toUpperCase());
          setList(sorted);
          cache.writeQuery({
            query: GET_OWNED_GROUPS,
            data: { getGroupsOfOwner: [...teacherData.getGroupsOfOwner, newGroup] },
          });
          cache.writeQuery({
            query: GET_SORTED_CONTACT_LIST,
            data: {
              __typename: 'ContactList',
              getSortedContactList: null,
            },
          });
        });
      },
      onError: ((err) => {
        console.log(err);
      }),
    },
  );

  const [removeGroup, { loading: removeGroupLoading }] = useMutation(
    REMOVE_GROUP, {
      errorPolicy: 'all',
      update: (cache, { data: result }) => {
        const found = teacherData.getGroupsOfOwner.findIndex(
          (data) => parseInt(data.id, 10) === parseInt(result.removeGroup, 10),
        );
        if (found > -1) {
          const group = teacherData.getGroupsOfOwner[found];
          matrix.leaveRoom(group.matrixRoomId);
          cache.writeQuery({
            query: GET_OWNED_GROUPS,
            data: {
              getGroupsOfOwner: [...teacherData.getGroupsOfOwner.slice(0, found),
                ...teacherData.getGroupsOfOwner.slice(found + 1, teacherData.getGroupsOfOwner.length)],
            },
          });
        }
        cache.writeQuery({
          query: GET_SORTED_CONTACT_LIST,
          data: {
            __typename: 'ContactList',
            getSortedContactList: null,
          },
        });
        const newlist = [...list];
        const foundList = newlist.findIndex(
          (data) => parseInt(data.id, 10) === parseInt(result.removeGroup, 10),
        );
        if (foundList > -1) {
          newlist.splice(foundList, 1);
        }
        setList(newlist);
      },
      onError: ((err) => {
        console.log('removegroup', err);
      }),
    },
  );

  const [removeLesson, { loading: removeLessonLoading }] = useMutation(
    REMOVE_TEACHED_INSTRUMENTS, {
      errorPolicy: 'all',
      update: (cache) => {
        const { teachedInstruments, ...otherUserData } = userData.getUser;
        const found = teachedInstruments.findIndex(
          (data) => parseInt(data.id, 10) === parseInt(lastRemovedInstrument.current, 10),
        );
        if (found > -1) {
          cache.writeQuery({
            query: GET_USER,
            data: {
              getUser: {
                ...otherUserData,
                teachedInstruments:
              [...teachedInstruments.slice(0, found),
                ...teachedInstruments.slice(found + 1)],
              },
            },
          });
        }
        const newlist = [...list];
        const foundList = newlist.findIndex(
          (data) => parseInt(data.id, 10) === parseInt(lastRemovedInstrument.current, 10),
        );
        if (foundList > -1) {
          newlist.splice(foundList, 1);
        }
        setList(newlist);
      },
      onError: ((err) => {
        //   console.log(err);
      }),
    },
  );

  useEffect(() => {
    if (teacherData && userData) {
      const consolidated = teacherData.getGroupsOfOwner.concat(userData.getUser.teachedInstruments);
      const sorted = sort(consolidated).asc((u) => u.name.toUpperCase());
      setList(sorted);
    }
  }, [teacherData, userData]);

  const submitNewGroup = (value) => {
    setAddNew(false);
    addGroup({ variables: { name: value } });
  };

  const submitNewLesson = (value) => {
    addLesson({ variables: { instruments: value } });
    setAddNew(false);
  };

  const removeGroupFunc = (groupId, name) => {
    choiceModalData.current = {
      message: `Bist du sicher, dass du das Ensemble ${name} löschen möchtest?`,
      headerMsg: 'Achtung',
      onSubmit: () => {
        setDisplayModal(false);
        client.query({
          query: GET_ONLY_GROUP_RELATED_STUDENTS,
          variables: {
            groupId: parseInt(groupId, 10),
          },
        }).then((data) => {
          Promise.all(data.data.getMyOnlyGroupRelatedStudents.map(async (student) => {
            matrix.leaveRoom(student.matrixRoomId);
          })).then(() => {
            removeGroup({ variables: { groupId: parseInt(groupId, 10) } });
          });
        });
      },
      onClose: () => { setDisplayModal(false); },
    };
    setDisplayModal(true);
  };

  const removeLessonFunc = (instrumentId, name) => {
    lastRemovedInstrument.current = instrumentId;
    choiceModalData.current = {
      message: `Bist du sicher, dass du das Fach ${name} löschen möchtest?`,
      headerMsg: 'Achtung',
      onSubmit: () => {
        setDisplayModal(false);
        removeLesson({ variables: { instruments: [{ id: parseInt(instrumentId, 10) }] } });
      },
      onClose: () => { setDisplayModal(false); },
    };
    setDisplayModal(true);
  };

  const openQR = (value) => {
    setCodeContent(value);
    setShowQR(true);
  };

  if (loadingData || addGroupLoading || userLoading
    || removeGroupLoading || addLessonLoading || removeLessonLoading) return (<LoadingIndicator paddingY={18} />);
  if (errorData) {
    return (<div>Ein Fehler ist aufgetreten... Versuche es noch einmal</div>);
  }

  return (
    <div>
      {showQR
      && (
      <QRWindow
        content={codeContent}
        onClose={() => setShowQR(false)}
      />
      )}
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
          onClickHandler={() => setAddNew(!addNew)}
          icon={AddCircleOutlineIcon}

        />
      </div>
      {addNew
      && (
      <ClassesForm
        onClose={() => setAddNew(!addNew)}
        onSubmitGroup={submitNewGroup}
        onSubmitLesson={submitNewLesson}
      />
      )}
      {list.map((field) => {
        let fieldQr = `${userData.getUser.id}${QR.DELIMITER}`;
        if (field.idInstrument) { fieldQr += `${QR.TEACHER_LESSON}${QR.DELIMITER}${field.idInstrument}`; } else { fieldQr += `${QR.TEACHER_GROUP}${QR.DELIMITER}${field.id}`; }
        // `${userData.getUser.id}${QR.DELIMITER}${QR.TEACHER_GROUP}${QR.DELIMITER}${field.id}`
        return (
          <Accordion
            key={`lesson_${field.__typename + (field.id || field.idInstrument)}`}
            summary={field.name}
          >
            <div style={{ paddingBottom: '18px' }}>
              <Row breakpoint="md">
                <Col>
                  <div
                    onKeyPress={() => openQR(fieldQr)}
                    onClick={() => openQR(fieldQr)}
                  >
                    <QRCode
                      size={128}
                      value={fieldQr}
                    />

                  </div>
                  {field.idInstrument
                    ? (
                      <TextButton
                        className="leftTextBtn"
                        onClickHandler={() => removeLessonFunc(field.idInstrument, field.name)}
                        title="Fach löschen"
                      />
                    )
                    : (
                      <TextButton
                        className="leftTextBtn"
                        onClickHandler={() => removeGroupFunc(field.id, field.name)}
                        title="Gruppe löschen"
                      />
                    )}
                </Col>
              </Row>
            </div>
          </Accordion>
        );
      })}
    </div>

  );
};

export default TeacherClassesList;
