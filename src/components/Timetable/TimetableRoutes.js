import React from 'react';
import {
  useRouteMatch, Switch, Route,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import Timetable from './TimetableWrapper';
import UserBoard from './UserBoard';
import GroupBoard from './GroupBoard';

const TimetableRoutes = ({
  setActionItems, setHeading, setShowBackBtn, onActionClick, setBackBtnPath, setBackBtnText, setActionItemIcon, setActionItemLabel,
}) => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={path}>
        <Timetable
          setHeading={setHeading}
          onActionClick={onActionClick}
          setBackBtnPath={setBackBtnPath}
          setBackBtnText={setBackBtnText}
          setShowBackBtn={setShowBackBtn}
          setActionItemIcon={setActionItemIcon}
          setActionItemLabel={setActionItemLabel}
          setActionItems={setActionItems}
        />
      </Route>
      <Route path={`${path}/user/:id`}>
        <UserBoard
          setHeading={setHeading}
          onActionClick={onActionClick}
          setBackBtnPath={setBackBtnPath}
          setBackBtnText={setBackBtnText}
          setShowBackBtn={setShowBackBtn}
          setActionItemIcon={setActionItemIcon}
          setActionItemLabel={setActionItemLabel}
          setActionItems={setActionItems}
        />
      </Route>
      <Route path={`${path}/group/:id`}>
        <GroupBoard
          setHeading={setHeading}
          onActionClick={onActionClick}
          setBackBtnPath={setBackBtnPath}
          setShowBackBtn={setShowBackBtn}
          setBackBtnText={setBackBtnText}
          setActionItems={setActionItems}
        />
      </Route>
    </Switch>
  );
};

TimetableRoutes.propTypes = {
  setHeading: PropTypes.func,
  setBackBtnPath: PropTypes.func,
  setBackBtnText: PropTypes.func,
  onActionClick: PropTypes.func,
  setActionItemIcon: PropTypes.func,
  setActionItemLabel: PropTypes.func,
  setActionItems: PropTypes.func,
};

TimetableRoutes.defaultProps = {
  setHeading: null,
  setBackBtnPath: null,
  setBackBtnText: null,
  onActionClick: null,
  setActionItemIcon: null,
  setActionItemLabel: null,
  setActionItems: null,
};
export default TimetableRoutes;
