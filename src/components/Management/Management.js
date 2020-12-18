import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import {
  ListDivider, List, ListItem,
} from 'musiklernplattform-components';
import PropTypes from 'prop-types';
import { useHistory, useLocation } from 'react-router-dom';
import sort from 'fast-sort';
import {
  useQuery, useApolloClient,
} from '@apollo/client';
import {
  SplitView, MasterContainer, withDetailId,
} from 'react-splitview-controller';
import { useSortedManagementStudentGroupList } from '~/constants/hooks';
import {
  GET_CONFIRMED_STUDENTS,
  GET_UNCONFIRMED_STUDENTS,
  RELATION_CONFIRMED_SUBSCRIPTION,
  RELATION_UNCONFIRMED_SUBSCRIPTION,
  RELATION_DELETED_SUBSCRIPTION,
} from '~/constants/gql/relations';
import { GET_USER } from '~/constants/gql/user';
import UserProfile from './UserProfile';
import GroupItem from './GroupItem';
import LoadingIndicator from '~/components/Generic/LoadingIndicator';

import UnconfirmedComponent from './UnconfirmedComponent';

const NoContentComponent = styled.div`
  padding: 18px;
`;

const MyListItemComponent = ({ item }) => (
  <List>
    { item.divider
      && (
      <ListDivider
        key={`contactlist-key${item.divider}`}
        label={item.divider}
      />
      )}
    <ListItem
      className={item.isRequest ? 'contact-request-item' : ''}
      key={`contactlist-key${item.key}`}
    >
      <span className="text-overflow-ellipsis">{item.value}</span>
    </ListItem>
  </List>
);
MyListItemComponent.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  item: PropTypes.object.isRequired,
  /* TODO: Why does Id fail?
  item: PropTypes.objectOf(PropTypes.shape({
    divider: PropTypes.string,
    isRequest: PropTypes.bool,
    key: PropTypes.string,
    id: PropTypes.string,
    type: PropTypes.oneOf(['user', 'group']),
    value: PropTypes.string,
  })).isRequired,
  */
};

function MyDetailContainer({ detailId }) {
  const values = (`${detailId}`).split(':');
  if (values[0] === 'user') {
    return (
      <UserProfile id={values[1]} />
    );
  } if (values[0] === 'group') {
    return (
      <GroupItem id={values[1]} />
    );
  }
  if (values[0] === 'userrequest') {
    return <UnconfirmedComponent id={values[1]} />;
  }
  return (
    <NoContentComponent>
      Bitte wähle einen Kontakt aus um diesen anzuzeigen.
    </NoContentComponent>
  );
}

MyDetailContainer.propTypes = {
  detailId: PropTypes.string,
};
MyDetailContainer.defaultProps = {
  detailId: null,
};
const DetailContainer = withDetailId(MyDetailContainer);

const Management = ({ setShowBackBtn }) => {
  const client = useApolloClient();
  const history = useHistory();
  const location = useLocation();

  const {
    contacts,
    loading: loadingUserGroups,
    refetch: refetchUserGroups,
  } = useSortedManagementStudentGroupList();

  const [contactList, setContactList] = useState(null);

  const subsInitiated = useRef(false);

  const {
    data: userData,
  } = useQuery(GET_USER);

  const {
    loading, error, data, subscribeToMore, refetch,
  } = useQuery(GET_UNCONFIRMED_STUDENTS, {
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    onCompleted: () => {
      setContactList(null);
    },
  });

  useEffect(() => {
    if (data && userData && !subsInitiated.current) {
      subscribeToMore({
        document: RELATION_UNCONFIRMED_SUBSCRIPTION,
        variables: { userId: parseInt(userData.getUser.id, 10) },
        updateQuery: (prev, { subscriptionData }) => {
          if (subscriptionData.data.relationUnconfirmedSubscription.userRole === 'Teacher') {
            refetch();
          }
        },
      });
      subscribeToMore({
        document: RELATION_CONFIRMED_SUBSCRIPTION,
        variables: { userId: parseInt(userData.getUser.id, 10) },
        updateQuery: (prev, { subscriptionData }) => {
          if (subscriptionData.data.relationConfirmedSubscription.userRole === 'Teacher') {
            client.query({
              query: GET_CONFIRMED_STUDENTS,
            }).then((students) => {
              if (students.data.getMyConfirmedStudents.findIndex(
                (element) => element.relatedUser.id
                === subscriptionData.data.relationConfirmedSubscription.idRelatedUser,
              ) < 0) {
                // User not in list!
                refetchUserGroups().then(() => {
                  refetch();
                });
              } else {
                refetch();
              }
            });
          }
        },
      });
      subscribeToMore({
        document: RELATION_DELETED_SUBSCRIPTION,
        variables: { userId: parseInt(userData.getUser.id, 10) },
        updateQuery: (prev, { subscriptionData }) => {
          if (subscriptionData.data.relationDeletedSubscription.userRole === 'Teacher') {
            if (!subscriptionData.data.relationDeletedSubscription.isConfirmed) {
              refetch();
            } else {
              client.query({
                query: GET_CONFIRMED_STUDENTS,
                fetchPolicy: 'cache-only',
              }).then((students) => {
                let count = 0;
                students.data.getMyConfirmedStudents.forEach(
                  (element) => {
                    if (
                      element.relatedUser.id
                      === subscriptionData.data.relationDeletedSubscription.idRelatedUser
                    ) {
                      count += 1;
                    }
                  },
                );
                if (count <= 1) {
                  client.query({
                    query: GET_CONFIRMED_STUDENTS,
                    fetchPolicy: 'network-only',
                  }).then((newstudents) => {
                    client.writeQuery({
                      query: GET_CONFIRMED_STUDENTS,
                      data: newstudents,
                    });
                    refetchUserGroups().then(() => {
                      setContactList(null);
                    });
                  });
                }
              });
            }
          }
        },
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData, data, subsInitiated.current]);

  useEffect(() => {
    if (!contactList && !loadingUserGroups && !loading) {
      const fullList = [];
      let letter = null;
      // https://github.com/prisma/prisma-client-js/issues/249 -> man kann nested serverseitig noch nicht sortieren

      const sorted = sort(
        [...data.getMyUnconfirmedStudents],
      )
        .asc((u) => u.relatedUser.firstname + u.relatedUser.lastname);
      sorted.forEach((relation) => {
        // const firstLetter = relation.relatedUser.firstname.substring(0, 1).toUpperCase();
        const newStudent = {
          id: `userrequest:${relation.id}`,
          isRequest: true,
          type: 'userrequest',
          value: `${relation.relatedUser.firstname} ${relation.relatedUser.lastname}, `,
        };
        if (relation.instruments) {
          newStudent.value += relation.instruments[0].name;
          newStudent.key = `${relation.relatedUser.id}-instrument-${relation.instruments[0].id}`;
        }
        if (relation.groups) {
          newStudent.value += relation.groups[0].name;
          newStudent.key = `${relation.relatedUser.id}-group-${relation.groups[0].id}`;
        }
        /* if (firstLetter !== letter) {
          letter = firstLetter;
          newStudent.divider = firstLetter;
        } */
        fullList.push(newStudent);
      });
      if (fullList.length > 0) fullList[0].divider = 'Kontaktanfragen';
      letter = null;

      contacts.forEach((field) => {
        const firstLetter = field.value.substring(0, 1).toUpperCase();
        const element = {
          id: `${field.type}:${field.key}`,
          key: `${field.type}:${field.key}`,
          isRequest: false,
          type: field.type,
          value: field.value,
        };
        if (firstLetter !== letter) {
          letter = firstLetter;
          element.divider = firstLetter;
        }
        fullList.push(
          element,
        );
      });
      setContactList(fullList);
    }
  }, [contactList, history, loading, data, loadingUserGroups, contacts]);

  useEffect(() => {
    if (location.pathname.includes('group') || location.pathname.includes('user')) {
      const width = (window.innerWidth > 0) ? window.innerWidth : window.screen.width;
      if (width < 599) {
        setShowBackBtn(true);
        return;
      }
    }
    setShowBackBtn(false);
    // eslint-disable-next-line consistent-return
    return function cleanup() {
      setShowBackBtn(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  if (loading) return <LoadingIndicator />;
  if (error || (!contactList && !loading)) return <div>Diese Seite steht dir aktuell nicht zur Verfügung.</div>;

  return (
    <div className="management">
      <SplitView
        master={(
          <MasterContainer
            header={(
              <h2 style={{ padding: 18, margin: 0 }}>
                <span
                  role="link"
                  tabIndex="0"
                  onClick={() => history.push('/management')}
                  onKeyDown={() => history.push('/management')}
                >
                  Kontakte
                </span>
              </h2>
              )}
            height="100%"
            listItems={contactList}
            ListItemComponent={MyListItemComponent}
          />
          )}
        style={{ borderRight: '1px solid #a4a4a4' }}
        detail={<div className="height-content overflow-x-scroll"><DetailContainer /></div>}
        mediaQuery="(max-width: 599px)"
      />
    </div>
  );
};

export default Management;
