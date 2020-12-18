import React, {
  useState, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  useQuery, useMutation, useApolloClient,
} from '@apollo/client';
import RelationList from '~/components/Profile/RelationList';
import {
  GET_GROUP,
} from '~/constants/gql/group';
import { useSortedUserGroupList } from '~/constants/hooks';
import {
  CONFIRM_RELATION_FROM_USER, GET_CONFIRMED_LESSONS_WITH_RELATED, REMOVE_RELATION_FROM_USER, GET_UNCONFIRMED_STUDENTS, GET_STUDENT_TEACHERS,
} from '~/constants/gql/relations';

const UnconfirmedList = ({ refreshMaster }) => {
  const [unconfirmedList, setUnconfirmedList] = useState(null);
  const [lastChanged, setLastChanged] = useState(null);
  const sortedContactList = useSortedUserGroupList();
  const client = useApolloClient();

  const {
    loading, error, data, refetch,
  } = useQuery(GET_UNCONFIRMED_STUDENTS, {
    errorPolicy: 'all',

  });

  const updateData = async () => {
    refetch();
    setUnconfirmedList(null);
    await sortedContactList.refetch();
    refreshMaster();
  };

  const [confirmRelation, {
    loading: loadingConfirm,
  }] = useMutation(CONFIRM_RELATION_FROM_USER, {
    onCompleted: (result) => {
      updateData();
      /* client.query({
        query: GET_USER_BY_ID,
        variables: {
          userId: lastChanged.userId,
        },
      }).then((userData) => {
        client.writeQuery({
          query: GET_USER_BY_ID,
          fetchPolicy: 'network-only',
          variables: {
            userId: lastChanged.userId,
          },
          data: userData.data,
        });
      }); */
      if (lastChanged.userChanged) {
        client.query({
          query: GET_STUDENT_TEACHERS,
          variables: {
            userid: lastChanged.userId,
          },
          fetchPolicy: 'network-only',
        }).then((userData) => {
          client.writeQuery({
            query: GET_STUDENT_TEACHERS,
            variables: {
              userid: lastChanged.userId,
            },
            data:
              userData.data,
          });
        });
        client.query({
          query: GET_CONFIRMED_LESSONS_WITH_RELATED,
          variables: {
            userId: lastChanged.userId,
          },
          fetchPolicy: 'network-only',
        }).then((userData) => {
          client.writeQuery({
            query: GET_CONFIRMED_LESSONS_WITH_RELATED,
            variables: {
              userId: lastChanged.userId,
            },
            data:
              userData.data,
          });
        });
      }

      if (lastChanged.groupChanged) {
        client.query({
          query: GET_GROUP,
          variables: {
            groupId: lastChanged.groupId,
          },
          fetchPolicy: 'network-only',
        }).then((groupData) => {
          client.writeQuery({
            query: GET_GROUP,
            variables: {
              groupId: lastChanged.groupId,
            },
            data:
            groupData.data,
          });
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
    onCompleted: (result) => {
      updateData();
    },
    onError: (err) => {
      console.log(err);
    },
  });

  useEffect(() => {
    if (!loading && data && !unconfirmedList) {
      const newList = [];
      data.getMyUnconfirmedStudents.forEach((relation) => {
        const newStudent = {
          id: relation.id,
          name: `${relation.relatedUser.firstname} ${relation.relatedUser.lastname}: `,
          returnValue: {
            userId: relation.relatedUser.id,
            relationId: relation.id,
          },
        };
        if (relation.instruments) {
          newStudent.name += relation.instruments[0].name;
          newStudent.returnValue.userChanged = true;
        }
        if (relation.groups) {
          newStudent.name += relation.groups[0].name;
          newStudent.returnValue.groupChanged = true;
          newStudent.returnValue.groupId = relation.groups[0].id;
        }
        newList.push(newStudent);
      });
      setUnconfirmedList(newList);
    }
  }, [data, loading, unconfirmedList]);

  const confirm = (user) => {
    setLastChanged(user);
    confirmRelation({
      variables: {
        time: moment().format('YYYY-MM-DD'),
        relation: { id: user.relationId },
      },
    });
  };
  const remove = (user) => {
    setLastChanged(user);
    removeRelation({
      variables: {
        relation: { id: user.relationId },
      },
    });
  };
  if (!unconfirmedList || loadingConfirm || loadingRemove) return <LoadingIndicator />;

  if (unconfirmedList.length < 1) return 'Es gibt keine neuen Kontaktanfragen.';
  return (
    <div>

      <RelationList
        heading={`Du hast ${unconfirmedList.length} neue Kontaktanfrage/n!`}
        elements={unconfirmedList}
        onRemove={remove}
        onConfirm={confirm}
        noElementMsg="Es gibt keine ausstehenden Verbindungen."
      />
    </div>

  );
};

export default UnconfirmedList;
