import React, {
  useState, useRef,
} from 'react';
import PropTypes from 'prop-types';
import {
  TextButton, DialogButtonRow,
} from 'musiklernplattform-components';
import {
  useQuery, useMutation, useApolloClient,
} from '@apollo/client';
import { useHistory } from 'react-router-dom';
import useMatrix from '~/components/MatrixProvider/useMatrix';
import {
  GET_GROUP,
} from '~/constants/gql/group';
import {
  CONFIRM_RELATION_FROM_USER,
  GET_SINGLE_RELATION,
  GET_CONFIRMED_WITH_RELATED_STUDENT,
  REMOVE_RELATION_FROM_USER,
  GET_STUDENT_TEACHERS,
  GET_ALL_CONFIRMED_RELATIONS_WITH_USER,
  ADD_MATRIX_ROOMS,
} from '~/constants/gql/relations';
import ChoiceModal from '~/components/Generic/ChoiceModal';
import { GET_USER_BY_ID } from '~/constants/gql/user';
import { checkGroupsAndAddRooms} from  '~/constants/util';
import LoadingIndicator from '~/components/Generic/LoadingIndicator';

const UnconfirmedComponent = ({ id }) => {
  const client = useApolloClient();
  const history = useHistory();
  const matrix = useMatrix();

  const [displayShowModal, setDisplayModal] = useState(false);

  const choiceModalData = useRef({
    message: '',
    headerMsg: '',
    onSubmit: () => {},
    onClose: () => {},
  });
  const createMatrixRoom = useRef(false);
  const userMatrixRoom = useRef();

  const {
    loading, error, data,
  } = useQuery(GET_SINGLE_RELATION, {
    errorPolicy: 'all',
    variables: { relationId: parseInt(id, 10) },
    onCompleted: (relationData) => {
      client.query({
        query: GET_ALL_CONFIRMED_RELATIONS_WITH_USER,
        variables: {
          userId: parseInt(relationData.getSingleRelation.relatedUser.id, 10),
        },
        fetchPolicy: 'network-only',
      }).then((allRelations) => {
        let foundRoom;
        const found = allRelations
          .data.getMyConfirmedRelationsWithUser
          .some((item) => { foundRoom = item.matrixRoomId; return item.matrixRoomId !== null; });
        createMatrixRoom.current = !found;
        userMatrixRoom.current = foundRoom;
      });
    },
  });
  const [confirmRelation, {
    loading: loadingConfirm,
  }] = useMutation(CONFIRM_RELATION_FROM_USER, {
    onCompleted: (result) => {
      const user = { ...data.getSingleRelation };

      if (data.getSingleRelation.instruments !== null) {
        Promise.all([
          new Promise((resolve, reject) => {
            client.query({
              query: GET_STUDENT_TEACHERS,
              variables: {
                userid: parseInt(user.relatedUser.id, 10),
              },
              fetchPolicy: 'network-only',
            }).then((userData) => {
              client.writeQuery({
                query: GET_STUDENT_TEACHERS,
                variables: {
                  userid: parseInt(user.relatedUser.id, 10),
                },
                data:
                    userData.data,
              });
              resolve();
            });
          }),
          new Promise((resolve, reject) => {
            client.query({
              query: GET_CONFIRMED_WITH_RELATED_STUDENT,
              variables: {
                userId: parseInt(user.relatedUser.id, 10),
              },
              fetchPolicy: 'network-only',
            }).then((userData) => {
              client.writeQuery({
                query: GET_CONFIRMED_WITH_RELATED_STUDENT,
                variables: {
                  userId: parseInt(user.relatedUser.id, 10),
                },
                data:
                    userData.data,
              });
              resolve();
            });
          }),
          new Promise((resolve, reject) => {
            client.query({
              query: GET_USER_BY_ID,
              variables: {
                userId: parseInt(user.relatedUser.id, 10),
              },
              fetchPolicy: 'network-only',
            }).then((userData) => {
              client.writeQuery({
                query: GET_USER_BY_ID,
                variables: {
                  userId: parseInt(user.relatedUser.id, 10),
                },
                data:
                    userData.data,
              });
              resolve();
            });
          }),
          new Promise((resolve, reject) => {
               if (createMatrixRoom.current) {
            // We need to add a room
             matrix.addNewRoom([data.getSingleRelation.relatedUser.matrixUserName],
                null, true).then((newRoom) => {
                if (!newRoom) return;
                client.mutate({
                  mutation: ADD_MATRIX_ROOMS,
                  variables: {
                    user: { id: parseInt(data.getSingleRelation.relatedUser.id, 10) },
                    room: newRoom.room_id,
                  },
                });
                resolve();
              });
            } else {
              resolve();
            }
            resolve();
          }),
        ]).then((e) => {
          history.push(`user:${user.relatedUser.id}`);
        });
      }
      if (data.getSingleRelation.groups !== null) {
        Promise.all([
          new Promise((resolve, reject) => {
            client.query({
              query: GET_GROUP,
              variables: {
                groupId: parseInt(user.groups[0].id, 10),
              },
              fetchPolicy: 'network-only',
            }).then((groupData) => {
              client.writeQuery({
                query: GET_GROUP,
                variables: {
                  groupId: parseInt(user.groups[0].id, 10),
                },
                data:
                groupData.data,
              });
              resolve();
            });
          }),

          new Promise((resolve, reject) => {
            client.query({
              query: GET_USER_BY_ID,
              variables: {
                userId: parseInt(user.relatedUser.id, 10),
              },
              fetchPolicy: 'network-only',
            }).then((userData) => {
              client.writeQuery({
                query: GET_USER_BY_ID,
                variables: {
                  userId: parseInt(user.relatedUser.id, 10),
                },
                data:
                    userData.data,
              });
              resolve();
            });
          }),
          new Promise((resolve, reject) => {
               if (createMatrixRoom.current) {
              // We need to add a room
              matrix.addNewRoom([data.getSingleRelation.relatedUser.matrixUserName],
                null, true).then((newRoom) => {
                if (!newRoom) return;
                client.mutate({
                  mutation: ADD_MATRIX_ROOMS,
                  variables: {
                    user: { id: parseInt(data.getSingleRelation.relatedUser.id, 10) },
                    room: newRoom.room_id,
                  },
                });
                resolve();
              });
            } else {
              resolve();
            }

            resolve();
          }),
          new Promise((resolve, reject) => {
            checkGroupsAndAddRooms(data.getSingleRelation.groups[0], matrix, client).then((addedNew) =>{
              if(addedNew) {
                client.query({
                  query: GET_GROUP,
                  variables: {
                    groupId: parseInt(data.getSingleRelation.groups[0].id, 10),
                  },
                  fetchPolicy: 'network-only',
                }).then((groupData) => {
                  client.writeQuery({
                    query: GET_GROUP,
                    variables: {
                      groupId: parseInt(data.getSingleRelation.groups[0].id, 10),
                    },
                    data:
                    groupData.data,
                  });
                  matrix.addUserToRoom(groupData.data.getGroup.matrixRoomId,
                    data.getSingleRelation.relatedUser.matrixUserName).then(() => resolve());
                });
              }else{
                matrix.addUserToRoom(data.getSingleRelation.groups[0].matrixRoomId,
                  data.getSingleRelation.relatedUser.matrixUserName)
                 .then(() => resolve());
              }
            })

          }),
        ]).then((e) => {
          history.push(`group:${user.groups[0].id}`);
        });
      }
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const [removeRelation, {
    loading: loadingRemove,
  }] = useMutation(REMOVE_RELATION_FROM_USER, {
    onCompleted: () => {
      history.push('/management');
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const confirm = () => {
    const variables = {
      time: new Date(),
      relation: { id: parseInt(id, 10) },
    };
    if (userMatrixRoom.current) variables.room = userMatrixRoom.current;
    confirmRelation({
      variables,
    });
  };
  const remove = (name) => {
    choiceModalData.current = {
      message: `Bist du sicher, dass du die Verbindungsanfrage mit ${name} aufheben möchtest?`,
      headerMsg: 'Achtung',
      onSubmit: () => {
        setDisplayModal(false);
        removeRelation({
          variables: {
            relation: { id: parseInt(id, 10) },
          },
        });
      },
      onClose: () => {
        setDisplayModal(false);
      },
    };
    setDisplayModal(true);
  };

  if (loading || loadingConfirm || loadingRemove) return <LoadingIndicator />;
  if (error || !data.getSingleRelation) return 'Sie sind nicht berechtigt, diese Seite zu sehen.';

  return (
    <>
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
      <div className="management-controlled management-unconfirmed height-content marginBottom">
        Möchtest du die Verbindung mit
        {' '}
        {data.getSingleRelation.relatedUser.firstname}
        {' '}
        {data.getSingleRelation.relatedUser.lastname}
        {' '}
        {data.getSingleRelation.instruments != null
          ? `im Fach ${data.getSingleRelation.instruments[0].name} `
          : `im Ensemble ${data.getSingleRelation.groups[0].name} `}
        hinzufügen?
        <br />
        <TextButton
          onClickHandler={confirm}
          title="Verbindung herstellen"
        />
        <TextButton
          onClickHandler={() => remove(
            `${data.getSingleRelation.relatedUser.firstname} ${
              data.getSingleRelation.relatedUser.lastname}`,
          )}
          title="Verbindung ablehnen"
        />

      </div>
    </>
  );
};

UnconfirmedComponent.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default UnconfirmedComponent;
