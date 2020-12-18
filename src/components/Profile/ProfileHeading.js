import React from 'react';
import PropTypes from 'prop-types';

const ProfileHeading = ({
  heading, children,
}) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <h2>
      {heading}
    </h2>
    {children}
  </div>
);

ProfileHeading.propTypes = {
  heading: PropTypes.string.isRequired,
  children: PropTypes.node,
};
ProfileHeading.defaultProps = {
  children: <div />,
};

export default ProfileHeading;
