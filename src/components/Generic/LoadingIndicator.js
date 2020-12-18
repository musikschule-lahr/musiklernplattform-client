import React from 'react';
import PropTypes from 'prop-types';

const LoadingIndicator = ({ padding, paddingY, paddingX }) => {
  const renderStyle = () => {
    if (padding) return ({ padding: `${paddingY + 18}px ${paddingX + 18}px` });
    return ({ padding: `${paddingY}px ${paddingX}px` });
  };
  return (
    <div style={renderStyle()}>Lädt</div>
  );
};
LoadingIndicator.propTypes = {
  padding: PropTypes.bool,
  paddingY: PropTypes.number,
  paddingX: PropTypes.number,
};
LoadingIndicator.defaultProps = {
  padding: false,
  paddingY: 0,
  paddingX: 0,
};
export default LoadingIndicator;
