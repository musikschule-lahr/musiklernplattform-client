import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'musiklernplattform-components';
import ManagementUserTeacherList from './ManagementUserTeacherList';
import UserParentList from './ManagementUserParentList';
import UserProfile from './ManagementUserProfile';
import ManagementRemove from './ManagementRemove';
import ProfileHeading from '~/components/Profile/ProfileHeading';

const Profile = ({ id }) => (
  <div className="management-controlled management-user height-content">
    <Row breakpoint="sm">
      <Col>
        <ProfileHeading heading="Schüler*in Informationen" />
        <UserProfile id={id} />
      </Col>
      <Col>
        <ManagementUserTeacherList id={id} />
      </Col>
      <Col>
        <UserParentList id={id} />
      </Col>
    </Row>
    <Row breakpoint="sm">
      <Col>
        <ManagementRemove id={id} />
      </Col>
    </Row>
  </div>
);

Profile.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default Profile;
