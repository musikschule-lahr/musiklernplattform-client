import React, {
  useState, useEffect, useRef,
} from 'react';
import {
  Accordion, IconButton, TextButton,
} from 'musiklernplattform-components';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { useHistory } from 'react-router-dom';
import AddCircleOutlineIcon from '@iconify/icons-ion/add-circle-outline';
import RefreshCircleOutlineIcon from '@iconify/icons-ion/refresh-circle-outline';
import useMatrix from '~/components/MatrixProvider/useMatrix';
import UserProfile from '~/components/Management/UserProfile/ManagementUserProfile';
import {
  GET_CHILDREN,
  REMOVE_RELATION_FROM_USER,
  RELATION_DELETED_SUBSCRIPTION,
  RELATION_CONFIRMED_SUBSCRIPTION,
  GET_ALL_CONFIRMED_RELATIONS_WITH_USER,
} from '~/constants/gql/relations';
import ChoiceModal from '~/components/Generic/ChoiceModal';
import { GET_USER } from '~/constants/gql/user';
import LoadingIndicator from '~/components/Generic/LoadingIndicator';

const RelatedChildList = () => {
  const client = useApolloClient();
  const history = useHistory();
  const matrix = useMatrix();

  // const [unlistData, setUnconfirmed] = useState(null);
  const [displayShowModal, setDisplayModal] = useState(false);
  const [listData, setList] = useState(null);

  const choiceModalData = useRef({
    message: '',
    headerMsg: '',
    onSubmit: () => {},
    onClose: () => {},
  });
  const chosen = useRef();
  const subsInitiated = useRef(false);

  const {
    data: userData,
  } = useQuery(GET_USER);

  const {
    loading: loadingChildren,
    error: errorChildren, data: dataChildren, refetch,
    subscribeToMore,
  } = useQuery(GET_CHILDREN, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    onCompleted: () => {
      setList(null);
    },
  });

  const onRemoved = () => {
    const newData = [...(listData || [])];
    const found = newData.findIndex(
      (data) => data.id === chosen.current,
    );
    newData.splice(found, 1);
    setList(newData);
    const myChildrenList = [...dataChildren.getMyChildren];
    const foundCache = myChildrenList.findIndex(
      (data) => data.id === chosen.current,
    );
    if (foundCache > -1) myChildrenList.splice(foundCache, 1);
    client.cache.writeQuery({
      query: GET_CHILDREN,
      data: { getMyChildren: myChildrenList },
    });
  };

  const [removeChild, { loading: removeLessonLoading }] = useMutation(
    REMOVE_RELATION_FROM_USER, {
      update: () => {
        onRemoved();
      },
      onError: ((err) => {
        console.log(err);
      }),
      refetchQueries: [
      ],
    },
  );

  useEffect(() => {
    if (dataChildren && userData && !subsInitiated.current) {
      subscribeToMore({
        document: RELATION_DELETED_SUBSCRIPTION,
        variables: { userId: parseInt(userData.getUser.id, 10) },
        updateQuery: (prev, { subscriptionData }) => {
          const subData = subscriptionData.data.relationDeletedSubscription;
          if (parseInt(subData.idUser, 10) === parseInt(userData.getUser.id, 10)
          && subData.userRole === 'Parent') {
            onRemoved();
          }
        },
      });
      subscribeToMore({
        document: RELATION_CONFIRMED_SUBSCRIPTION,
        variables: { userId: parseInt(userData.getUser.id, 10) },
        updateQuery: (prev, { subscriptionData }) => {
          const subData = subscriptionData.data.relationConfirmedSubscription;
          if (parseInt(subData.idUser, 10) === parseInt(userData.getUser.id, 10)
          && subData.userRole === 'Parent') {
            refetch();
          }
        },
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData, dataChildren, subsInitiated.current]);

  useEffect(() => {
    if (!listData && !loadingChildren && dataChildren) {
      const list = [];
      // const unconfirmed = [];
      dataChildren.getMyChildren.forEach((child) => {
        list.push({
          title: `Bezugsperson ${child.relatedUser.firstname} ${child.relatedUser.lastname}`,
          firstname: child.relatedUser.firstname,
          lastname: child.relatedUser.lastname,
          mail: child.relatedUser.mail,
          phone: child.relatedUser.phone,
          userId: child.relatedUser.id,
          isConfirmed: child.isConfirmed,
          idRelation: child.id,
        });
      });
      setList(list);
    }
  }, [listData, dataChildren, loadingChildren]);

  const removeChildFunc = (idRelation, name, userId) => {
    choiceModalData.current = {
      message: `Bist du sicher, dass du die Verknüpfung mit ${name} aufheben möchtest?`,
      headerMsg: 'Achtung',
      onSubmit: () => {
        setDisplayModal(false);
        chosen.current = idRelation;
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
          removeChild({ variables: { relation: { id: idRelation } } });
        });
      },
      onClose: () => { setDisplayModal(false); },
    };
    setDisplayModal(true);
  };
  if (loadingChildren || removeLessonLoading) return (<LoadingIndicator />);
  if (errorChildren) {
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
          Schüler-Familienmitglieder
        </h2>
        <IconButton
          icon={AddCircleOutlineIcon}
          onClickHandler={() => { history.push('/qr'); }}
        />
      </div>
      {(listData || []).map((field) => {
        if (field.isConfirmed) {
          return (
            <Accordion
              removePaddingLeft
              summary={`${field.firstname} ${field.lastname}`}
              key={`childrelation_${field.userId}`}
            >
              <div style={{ paddingBottom: '18px' }}>
                <UserProfile id={field.userId} className="" />
                <TextButton
                  className="leftTextBtn "
                  onClickHandler={() => removeChildFunc(field.idRelation,
                    `${field.firstname} ${field.lastname}`, field.userId)}
                  title={`Verknüpfung mit ${field.firstname} ${field.lastname} aufheben`}
                />
              </div>
            </Accordion>
          );
        }
        return (

          <Accordion
            className="marginBottom whiteSpacePreWrap"
            summary={`${field.firstname} ${field.lastname}: \n(Status: Anfrage gesendet)`}
            key={`relation_${field.index}`}
          />

        );
      })}
      {(listData || []).length < 1 && (
        <div>Es sind keine Schüler-Familienmitglieder verbunden.</div>
      )}
    </div>
  );
};

export default RelatedChildList;
