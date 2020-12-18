import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import useMatrix from '~/components/MatrixProvider/useMatrix';
import { GET_GROUP } from '~/constants/gql/group';
import {
  REMOVE_STUDENT_GROUP,
  RELATION_GROUP_DELETED_SUBSCRIPTION,
  GET_ALL_CONFIRMED_RELATIONS_WITH_USER,
} from '~/constants/gql/relations';
import RelationList from '~/components/Profile/RelationList';
import ChoiceModal from '~/components/Generic/ChoiceModal';
import LoadingIndicator from '~/components/Generic/LoadingIndicator';
import { checkGroupsAndAddRooms} from  '~/constants/util';

const ManagementGroup = ({ id }) => {
  const client = useApolloClient();
  const history = useHistory();
  const matrix = useMatrix();

  const [errorMsg, setErrorMsg] = useState(null);
  const [displayShowModal, setDisplayModal] = useState(false);
  const [listData, setListData] = useState(null);

  const choiceModalData = useRef({
    message: '',
    headerMsg: '',
    onSubmit: () => {},
    onClose: () => {},
  });
  const lastChange = useRef(null);
  const subsInitiated = useRef(false);

  const {
    loading, data, subscribeToMore, refetch,
  } = useQuery(GET_GROUP, {
    variables: { groupId: parseInt(id, 10) },
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    onCompleted: () => {
      const list = [];
      checkGroupsAndAddRooms(data.getGroup,matrix,client).then((addedNew) =>{
        if(addedNew) refetch();
      })
      data.getGroup.relations.forEach((relation, index) => {
        if (relation.isConfirmed) {
          list.push({
            index,
            // title: `${relation.relatedUser.firstname} ${relation.relatedUser.lastname}`,
            name: `${relation.relatedUser.firstname} ${relation.relatedUser.lastname}`,
            firstname: relation.relatedUser.firstname,
            lastname: relation.relatedUser.lastname,
            id: relation.relatedUser.id,
            returnValue: {
              userId: relation.relatedUser.id,
              name: `${relation.relatedUser.firstname} ${relation.relatedUser.lastname}`,
              matrixRoomId: relation.matrixRoomId,
              matrixUserName: relation.relatedUser.matrixUserName,
            },
            onClickFunc: () => history.push(`/management/detail/user:${relation.relatedUser.id}`),
          });
        }
      });
      setListData(list);
    },
    onError: (err) => {
      setErrorMsg(err);
    },
  });

  const [updateGroup, {
    loading: loadingUpdateGroup,
  }] = useMutation(REMOVE_STUDENT_GROUP, {
    errorPolicy: 'all',
    onCompleted: () => {
      const newData = [...listData];
      const found = newData.findIndex(
        (element) => element.id === lastChange.current.user.userId,
      );
      if (found > -1) newData.splice(found, 1);
      // async but does not matter, we won't do any other changes as result of this
      matrix.removeUserFromRoom(data.getGroup.matrixRoomId, lastChange.current.user.matrixUserName);

      setListData(newData);
    },
    onError: (err) => {
      setErrorMsg(err);
    },
  });

  useEffect(() => {
    if (data && !subsInitiated.current) {
      subscribeToMore({
        document: RELATION_GROUP_DELETED_SUBSCRIPTION,
        variables: { groupId: parseInt(id, 10) },
        updateQuery: () => {
          refetch();
        },
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, subsInitiated.current]);

  const removeGroupFunc = (user) => {
    lastChange.current = { added: false, user };
    choiceModalData.current = {
      message: `Bist du sicher, dass du die Verknüpfung mit ${user.name} aufheben möchtest?`,
      headerMsg: 'Achtung',
      onSubmit: () => {
        setDisplayModal(false);
        client.query({
          query: GET_ALL_CONFIRMED_RELATIONS_WITH_USER,
          variables: {
            userId: parseInt(user.userId, 10),
          },
          fetchPolicy: 'network-only',
        }).then((allRelations) => {
          if (allRelations.data.getMyConfirmedRelationsWithUser.length === 1) {
            matrix.leaveRoom(allRelations.data.getMyConfirmedRelationsWithUser[0].matrixRoomId);
          }
          updateGroup({
            variables: {
              group: { id: parseInt(id, 10) },
              user: { id: parseInt(user.userId, 10) },
            },
          });
        });
      },
      onClose: () => { setDisplayModal(false); },
    };
    setDisplayModal(true);
  };

  if (loading || loadingUpdateGroup || !listData) {
    return <LoadingIndicator padding />;
  }

  return (
    <div className="management-controlled management-group height-content">
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
      {data.getGroup
        && (
        <div>
          <h2>
            {data.getGroup.name}
          </h2>
          <RelationList
            elements={listData}
            onRemove={removeGroupFunc}
            noElementMsg="Es gibt keine Verbindungen."
          />
        </div>
        )}
    </div>
  );
};

ManagementGroup.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default ManagementGroup;
