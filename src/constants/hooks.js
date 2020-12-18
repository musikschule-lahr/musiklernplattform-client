import React, { useState, useRef, useCallback } from 'react';
import {
  useQuery, useApolloClient,
} from '@apollo/client';
import sort from 'fast-sort';
import { GET_ALL_CONFIRMED_RELATIONS_WITH_USER, GET_CONFIRMED_STUDENTS } from '~/constants/gql/relations';
import { GET_OWNED_GROUPS, GET_MY_GROUPS } from '~/constants/gql/group';
import { GET_SORTED_CONTACT_LIST, GET_PLANS } from '~/constants/gql/cache';
import { GET_USER } from '~/constants/gql/user';
import { plans,checkGroupsAndAddRooms } from '~/constants/util';
import useMatrix from '~/components/MatrixProvider/useMatrix';

// Cannot update apollo-client above 3.1.1
// https://github.com/apollographql/apollo-client/issues/6796
export const useImperativeQuery = (query) => {
  const { refetch } = useQuery(query, { skip: true });
  const imperativelyCallQuery = (variables) => refetch(variables);
  return imperativelyCallQuery;
};

export const useSortedManagementStudentGroupList = () => {
  const client = useApolloClient();
  const matrix = useMatrix();

  const [contacts, setContacts] = useState(null);

  const loading = useRef(false);

  const refetch = async () => {
    if (!loading.current) {
      loading.current = true;
      await prepareSortedList();
    }
  };

  function contactsToSortedOptions(_contactList) {
    return (
      _contactList.map((contact) => ({
        key: contact.idGroup || contact.relatedUser.id,
        value: contact.name,
        type: contact.type,
      }))
    );
  }

  async function prepareSortedList() {
    try {
      client.query({
        query: GET_CONFIRMED_STUDENTS,
        fetchPolicy: 'network-only',
      }).then((students) => {
        client.query({
          query: GET_OWNED_GROUPS,
          fetchPolicy: 'network-only',
        }).then((groups) => {
          checkGroupsAndAddRooms(groups.data.getGroupsOfOwner,matrix,client).then((addedNew) =>{
            if(addedNew){console.log("added new!");
             prepareSortedList(); return;}
             console.log("all exist")
            const myData = [...groups.data.getGroupsOfOwner, ...students.data.getMyConfirmedStudents];
          const sorted = sort(myData).asc((u) => u.name);
          const filtered = [...new Set(sorted)];
          client.writeQuery({
            query: GET_SORTED_CONTACT_LIST,
            data: {
              getSortedContactList: { sortedContactList: filtered },
            },
          });
          const newcontacts = contactsToSortedOptions(filtered);
          loading.current = false;
          setContacts(newcontacts);
          })

        });
      });
    } catch (e) {
      console.log('err', e);
      return e;
    }
  }
  if (!loading.current && !contacts) {
    try {
      const myContactList = client.readQuery({
        query: GET_SORTED_CONTACT_LIST,
      });
      const newcontacts = contactsToSortedOptions(myContactList.getSortedContactList);
      setContacts(newcontacts);
    } catch (e) {
      loading.current = true;
      prepareSortedList();
    }
  }
  return { loading: loading.current, contacts, refetch };
};

export const usePlans = () => {
  const client = useApolloClient();
  const {
    data: plansData, loading: loadingPlans,
  } = useQuery(GET_PLANS, {
    fetchPolicy: 'cache-only',
    onError: (err) => {
      console.log('cannot query', err);
    },
  });
  const comparePlans = useCallback(
    (plansToCompare) => plansToCompare.some((plan) => plansData.getPlans.plans.includes(plan)), [plansData],
  );

  const getPlans = useCallback((user) => {
    if ((user.relatedTo || []).length > 0) {
      if (user.relatedTo.some((e) => e.userRole.toUpperCase() === 'OFFICE')) {
        return plans.TEACHER;
      }
      if (user.relatedTo.some((e) => e.userRole.toUpperCase() === 'TEACHER')) {
        return plans.STUDENT;
      }
      if (user.relatedTo.some((e) => e.userRole.toUpperCase() === 'PARENT')) {
        return plans.STUDENT;
      }
    }
    if ((user.relatedBy || []).length > 0) {
      if (user.relatedBy.some((e) => e.userRole.toUpperCase() === 'PARENT')) {
        return plans.PARENT;
      }
    }
    return plans.NONE;
  }, []);

  const updatePlans = useCallback(() => {
    client.query({
      query: GET_USER,
      fetchPolicy: 'network-only',
    }).then((userData) => {
      const plan = getPlans(userData.data.getUser);
      client.writeQuery({
        query: GET_PLANS,
        data:
        {
          getPlans:
          {
            plans: [plan],
          },
        },
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loadingPlans) {
    return {
      loading: true, comparePlans, data: null, updatePlans: null,
    };
  }
  return {
    loading: false, comparePlans, data: plansData.getPlans.plans, updatePlans,
  };
};

export default { useImperativeQuery, useSortedManagementStudentGroupList, usePlans };
