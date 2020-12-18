import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useQuery, useApolloClient } from '@apollo/client';
import { GET_USER } from '~/constants/gql/user';
import { GET_PLANS } from '~/constants/gql/cache';
import { plans, checkRelatedAndAddRooms } from '~/constants/util';
import LoadingIndicator from '~/components/Generic/LoadingIndicator';
import useMatrix from '~/components/MatrixProvider/useMatrix';

const PlansAndMatrixRelationRoomsProvider = ({ children }) => {
  const client = useApolloClient();
  const matrix = useMatrix();

  const { loading, data: userData, error } = useQuery(GET_USER, {
    fetchPolicy: 'network-only',
  onCompleted: (userData) =>{
       // Check relations
       if(userData){
        console.log("--->userData!")
          console.log(userData.getUser.relatedBy)
          const related =  {};
          userData.getUser.relatedBy.forEach((relatedBy) =>{
            console.log("relatedBy", relatedBy)
            if(relatedBy.userRole.toUpperCase() === "OFFICE" || !relatedBy.isConfirmed) return;
            if (related[relatedBy.relatedUser.idUser] ) {
              if(relatedBy.matrixRoomId !== null){
                related[relatedBy.relatedUser.idUser].matrixRoomId=relatedBy.matrixRoomId;
              }else if( !related[relatedBy.relatedUser.idUser].needsMatrixUpdate){
                  related[relatedBy.relatedUser.idUser].needsMatrixUpdate = true;
              }
            }
            else related[relatedBy.relatedUser.idUser] = {
              matrixUserName: relatedBy.relatedUser.matrixUserName,
              matrixRoomId : relatedBy.matrixRoomId,
              needsMatrixUpdate: relatedBy.matrixRoomId === null
            }
          })
          userData.getUser.relatedTo.forEach((relatedTo) =>{
            if(relatedTo.userRole.toUpperCase() === "OFFICE"  || !relatedTo.isConfirmed) return;
            if (related[relatedTo.user.idUser] ) {
              if(relatedTo.matrixRoomId !== null){
                related[relatedTo.user.idUser].matrixRoomId=relatedTo.matrixRoomId;
              }else if( !related[relatedTo.user.idUser].needsMatrixUpdate){
                  related[relatedTo.user.idUser].needsMatrixUpdate = true;
              }
            }
            else related[relatedTo.user.idUser] = {
              matrixUserName: relatedTo.user.matrixUserName,
              matrixRoomId : relatedTo.matrixRoomId,
              needsMatrixUpdate: relatedTo.matrixRoomId === null
            }
          })
          Object.keys(related).forEach((key, index) =>{
            console.log(key, related[key])
            if(related[key].needsMatrixUpdate){
              checkRelatedAndAddRooms({userid: key, matrixUserName:related[key].matrixUserName },
                related[key].matrixRoomId === null, related[key].matrixRoomId, matrix, client
                  ).then((didChange) =>{
              })
            }

          })
      }
  }
});
  const {
    data: plansData, loading: loadingPlans,
  } = useQuery(GET_PLANS, {
    fetchPolicy: 'cache-only',
    onError: (err) => {
      console.log('cannot query', err);
    },
  });

  const getPlans = (user) => {
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
  };

  useEffect(() => {
    if (!loading) {
      if (userData) {
        const plan = getPlans(userData.getUser);
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
      } else if (!userData) {
        client.writeQuery({
          query: GET_PLANS,
          data:
          {
            getPlans:
            {
              plans: [plans.NONE],
            },
          },
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading || loadingPlans) return <LoadingIndicator padding />;

  return (
    <>
      {children}
    </>
  );
};

PlansAndMatrixRelationRoomsProvider.propTypes = {
  children: PropTypes.node,
};

PlansAndMatrixRelationRoomsProvider.defaultProps = {
  children: <div />,
};

export default PlansAndMatrixRelationRoomsProvider;
