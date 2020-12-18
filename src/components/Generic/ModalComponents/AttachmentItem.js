import React from 'react';
import PropTypes from 'prop-types';
import AttachIcon from '@iconify/icons-ion/attach';
import { Icon } from '@iconify/react';

const AttachmentItem = ({ name }) => (
  <div style={{ fontWeight: 'bold', fontSize: 18 }}>
    <Icon height="25" icon={AttachIcon} />
    <span style={{ verticalAlign: 'top' }}>{name}</span>
  </div>
);

AttachmentItem.propTypes = {
  name: PropTypes.string.isRequired,
};
export default AttachmentItem;
