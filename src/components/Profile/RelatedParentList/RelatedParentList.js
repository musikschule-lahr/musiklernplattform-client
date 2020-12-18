import React, { useState, useEffect, useRef } from 'react';
import {
  Accordion, DataSheet, DataRow, TextButton, IconButton,
} from 'musiklernplattform-components';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import AddCircleOutlineIcon from '@iconify/icons-ion/add-circle-outline';
import QRWindow from '../QRWindow';
import useMatrix from '~/components/MatrixProvider/useMatrix';
import {
  GET_PARENTS, REMOVE_PARENT, CONFIRM_PARENT,
  RELATION_DELETED_SUBSCRIPTION,
  RELATION_UNCONFIRMED_SUBSCRIPTION,
  GET_ALL_CONFIRMED_RELATIONS_WITH_USER,
  ADD_MATRIX_ROOMS,
} from '~/constants/gql/relations';
import { GET_USER } from '~/constants/gql/user';
import { QR } from '~/constants/util';
import RelationList from '~/components/Profile/RelationList';
import ChoiceModal from '~/components/Generic/ChoiceModal';
import LoadingIndicator from '~/components/Generic/LoadingIndicator';

const RelatedParentList = () => {
  const client = useApolloClient();
  const matrix = useMatrix();

  const [displayShowModal, setDisplayModal] = useState(false);
  const [formFields, setFormFields] = useState([]);
  const [showQR, setShowQR] = useState(false);
  const [unconfirmedData, setUnconfirmed] = useState([]);

  const choiceModalData = useRef({
    message: '',
    headerMsg: '',
    onSubmit: () => {},
    onClose: () => {},
  });
  const createMatrixRoom = useRef(false);
  const currentAddedUser = useRef(null);
  const subsInitiated = useRef(false);

  const {
    loading: loadingData, error: errorData, data: relationData,
    refetch, subscribeToMore,
  } = useQuery(GET_PARENTS, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  });
  const {
    loading: loadingUser, data: userData,
  } = useQuery(GET_USER);

  const [removeParent, { loading: removeParentLoading }] = useMutation(
    REMOVE_PARENT, {
      update: () => {
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

  const [confirmParent, { loading: confirmParentLoading }] = useMutation(
    CONFIRM_PARENT, {
      update: () => {
        if (createMatrixRoom.current) {
          console.log('!matrix');
          matrix.addNewRoom([currentAddedUser.current.matrixUserName],
            null, true).then((newRoom) => {
            if (!newRoom) return;
            client.mutate({
              mutation: ADD_MATRIX_ROOMS,
              variables: {
                user: { id: parseInt(currentAddedUser.current.userId, 10) },
                room: newRoom.room_id,
              },
            });
          });
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

  useEffect(() => {
    if (relationData && !loadingData) {
      console.log('new', relationData.getMyParents);
      const myData = [];
      const unconfirmed = [];
      relationData.getMyParents.forEach((parent, index) => {
        if (parent.isConfirmed) {
          myData.push({
            index,
            title: `${parent.user.firstname} ${parent.user.lastname}`,
            firstname: parent.user.firstname,
            lastname: parent.user.lastname,
            mail: parent.user.mail,
            phone: parent.user.phone,
            userId: parent.user.id,
          });
        } else {
          unconfirmed.push({
            returnValue: {
              userId: parent.user.id,
              matrixUserName: parent.user.matrixUserName,
              name: `${parent.user.firstname} ${parent.user.lastname}`,
            },
            name: `${parent.user.firstname} ${parent.user.lastname}`,
            isConfirmed: false,
            disabled: false,
          });
        }
      });
      setFormFields(myData);
      setUnconfirmed(unconfirmed);
    }
  }, [loadingData, relationData]);

  useEffect(() => {
    if (relationData && userData && !subsInitiated.current) {
      subscribeToMore({
        document: RELATION_DELETED_SUBSCRIPTION,
        variables: { userId: parseInt(userData.getUser.id, 10) },
        updateQuery: (prev, { subscriptionData }) => {
          const subData = subscriptionData.data.relationDeletedSubscription;
          if (parseInt(subData.idRelatedUser, 10) === parseInt(userData.getUser.id, 10)
          && subData.userRole === 'Parent') {
            refetch();
          }
        },
      });
      subscribeToMore({
        document: RELATION_UNCONFIRMED_SUBSCRIPTION,
        variables: { userId: parseInt(userData.getUser.id, 10) },
        updateQuery: (prev, { subscriptionData }) => {
          const subData = subscriptionData.data.relationUnconfirmedSubscription;
          if (parseInt(subData.idRelatedUser, 10) === parseInt(userData.getUser.id, 10)
          && subData.userRole === 'Parent') {
            refetch();
          }
        },
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingUser, loadingData, subsInitiated.current]);

  const removeParentFunc = (userId, name) => {
    choiceModalData.current = {
      message: `Bist du sicher, dass du die Verknüpfung mit ${name} aufheben möchtest?`,
      headerMsg: 'Achtung',
      onSubmit: () => {
        setDisplayModal(false);
        client.query({
          query: GET_ALL_CONFIRMED_RELATIONS_WITH_USER,
          variables: {
            userId: parseInt(userId.userId, 10),
          },
          fetchPolicy: 'network-only',
        }).then((allRelations) => {
          if (allRelations.data.getMyConfirmedRelationsWithUser.length === 1) {
            matrix.leaveRoom(allRelations.data.getMyConfirmedRelationsWithUser[0].matrixRoomId);
          }
        });
        removeParent({ variables: { user: { id: parseInt(userId.userId, 10) } } });
      },
      onClose: () => { setDisplayModal(false); },
    };
    setDisplayModal(true);
  };

  const confirmParentFunc = (user) => {
    currentAddedUser.current = user;

    const variables = {
      user: { id: parseInt(user.userId, 10) },
      time: new Date(),
    };
    client.query({
      query: GET_ALL_CONFIRMED_RELATIONS_WITH_USER,
      variables: {
        userId: parseInt(user.userId, 10),
      },
      fetchPolicy: 'network-only',
    }).then((allRelations) => {
      let foundRoom;
      const found = allRelations
        .data.getMyConfirmedRelationsWithUser
        .some((item) => { foundRoom = item.matrixRoomId; return item.matrixRoomId !== null; });
      if (found) variables.room = foundRoom;
      createMatrixRoom.current = !found;
      confirmParent({
        variables,
      });
    });
  };

  if (loadingData || loadingUser || removeParentLoading || confirmParentLoading) return (<LoadingIndicator />);

  if (errorData) {
    return (<div>Ein Fehler ist aufgetreten... Versuche es noch einmal</div>);
  }

  return (
    <div>
      {showQR
      && (
      <QRWindow
        content={userData.getUser.id + QR.DELIMITER + QR.PARENT}
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
          Familienmitglieder
        </h2>
        <IconButton
          icon={AddCircleOutlineIcon}
          onClickHandler={() => { setShowQR(true); }}
        />
      </div>

      {formFields.map((field) => (
        <Accordion removePaddingLeft summary={field.title} key={`relation_${field.title}`}>
          <div style={{ paddingBottom: '18px' }}>
            <DataSheet width="auto" className="">
              <DataRow label="Vorname" value={field.firstname || 'Keine Angabe'} />
              <DataRow label="Nachname" value={field.lastname || 'Keine Angabe'} />
              <DataRow label="E-Mail" value={field.mail || 'Keine Angabe'} />
              <DataRow label="Telefon" value={field.phone || 'Keine Angabe'} />
            </DataSheet>
            <TextButton
              className="leftTextBtn "
              onClickHandler={() => removeParentFunc(field, `${field.firstname} ${field.lastname}`)}
              title={`Verknüpfung mit ${field.firstname} ${field.lastname} aufheben`}
            />
          </div>
        </Accordion>
      ))}
      {formFields.length < 1 && (
        <div>
          Es sind aktuell keine Familienmitglieder verbunden.
          <br />
          Um eine Verbindung aufzubauen, klicke auf das "+".
        </div>
      )}
      {unconfirmedData.length > 0 && (
      <RelationList
        heading="Verbindungsanfragen"
        elements={unconfirmedData}
        onRemove={(data) => { removeParentFunc(data, data.name); }}
        onConfirm={confirmParentFunc}
        noElementMsg="Es gibt keine Verbindungsanfragen."
      />
      )}
    </div>
  );
};

export default RelatedParentList;
