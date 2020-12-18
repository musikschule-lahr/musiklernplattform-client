/* eslint-disable no-plusplus */
import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { Row, Col } from 'musiklernplattform-components';
import LogoutIcon from '@iconify/icons-ion/power-sharp';
import { useKeycloak } from '@react-keycloak/web';
import UserProfile from '~/components/Profile/UserProfile';
import InitialScan from '~/components/Profile/InitialScan';
import TeacherClassesList from '~/components/Profile/TeacherClassesList';
import RelatedParentList from '~/components/Profile/RelatedParentList';
import RelatedTeacherList from '~/components/Profile/RelatedTeacherList';
import RelatedChildList from '~/components/Profile/RelatedChildList';
import {
  GET_USER,
} from '~/constants/gql/user';
import { usePlans } from '~/constants/hooks';
import { plans, generateActionItem } from '~/constants/util';
import useMatrix from '~/components/MatrixProvider/useMatrix';
import LoadingIndicator from '~/components/Generic/LoadingIndicator';

const Profile = ({ setActionItems, setBackBtnText }) => {
  const matrix = useMatrix();
  const { keycloak } = useKeycloak();
  const { loading: loadingPlans, data: plansData } = usePlans();
  const [loading, setLoading] = useState(true);

  const [componentsToRender, setComponentsToRender] = useState([]);
  const {
    data: dataUser, loading: loadingUser,
  } = useQuery(GET_USER, {
    errorPolicy: 'all',
    returnPartialData: true,
  });

  useEffect(() => {
    setBackBtnText('Mein Büro');
    setActionItems(
      generateActionItem(LogoutIcon, true, 'Abmelden',
        () => {
          localStorage.removeItem('accesstoken');
          localStorage.removeItem('refreshtoken');
          localStorage.removeItem('matrixtoken');
          matrix.logout();
          keycloak.logout();
          if (window.device.platform.toLowerCase() === 'ios') {
            window.location.href = window.location.href.substring(0, window.location.href.indexOf('#'));
          }
        }),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    console.log('loadingPlans, loadingUser');
    if (!loadingPlans && !loadingUser) {
      let index = 0;
      const componentList = [{ component: <UserProfile />, index: index++ }];
      if (dataUser && plansData) {
        let list = [...plansData];
        while (list.length > 0) {
          switch (list[0]) {
            case plans.STUDENT: {
              componentList.push({ component: <RelatedTeacherList />, index: index++ });
              componentList.push({ component: <RelatedParentList />, index: index++ });
              break;
            }
            case plans.TEACHER: {
              componentList.push({ component: <TeacherClassesList />, index: index++ });
              break;
            }
            case plans.PARENT: {
              componentList.push({ component: <RelatedChildList />, index: index++ });
              break;
            }
            case plans.NONE: {
              componentList.push({ component: <InitialScan />, index: index++ });
              break;
            }
            default: {
              // ...
            }
          }
          list = list.shift();
        }
      }
      setComponentsToRender(componentList);
      setLoading(false);
    }
  }, [loadingPlans, loadingUser]);

  if (loading) return <LoadingIndicator />;
  return (
    <div className="profile">
      <Row breakpoint="sm">
        {componentsToRender.map((component) => (
          <Col key={`profile-component-${component.index}`} className="marginBottom">
            {component.component}
          </Col>
        ))}
      </Row>
    </div>

  );
};

export default Profile;
