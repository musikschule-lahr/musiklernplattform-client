/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import PropTypes from 'prop-types';
import {
  IconButton,
  List, ListItem,
} from 'musiklernplattform-components';
import TrashIcon from '@iconify/icons-ion/trash-outline';
import CheckmarkIcon from '@iconify/icons-ion/checkmark';
import ProfileHeading from './ProfileHeading';

const RelationList = ({
  heading, elements, noElementMsg, onConfirm, onRemove,
}) => (
  <div>
    {heading && <ProfileHeading heading={heading} />}
    {elements.length < 1 && noElementMsg}
    <List>
      {elements.map((element) => (
        <ListItem key={`relation-${element.name}`} removePadding>
          <div style={{ display: 'flex', flexBasis: '100%', alignItems: 'center' }}>
            <span
              onClick={() => {
                if (element.onClickFunc) element.onClickFunc();
              }}
              style={{ flexGrow: 2 }}
            >
              {`${element.name}`}
            </span>
            { onConfirm !== null && (
              <IconButton
                className="relationList-btn relationList-btn-margin-right"
                icon={CheckmarkIcon}
                onClickHandler={() => { onConfirm(element.returnValue); }}
              />
            )}
            { onRemove !== null && (
              <IconButton
                className="relationList-btn"
                icon={TrashIcon}
                onClickHandler={() => { onRemove(element.returnValue); }}
              />
            )}
          </div>
        </ListItem>
      ))}
    </List>
  </div>
);

RelationList.propTypes = {
  heading: PropTypes.string,
  noElementMsg: PropTypes.string,
  onConfirm: PropTypes.func,
  onRemove: PropTypes.func,
  elements: PropTypes.arrayOf(PropTypes.object),
};
RelationList.defaultProps = {
  heading: null,
  noElementMsg: '',
  onConfirm: null,
  onRemove: null,
  elements: [],
};

export default RelationList;
