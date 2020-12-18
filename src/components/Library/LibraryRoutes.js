import React, { useEffect } from 'react';
import {
  useRouteMatch, Switch, Route, useLocation,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import LibraryMain from './LibraryMain';
import LibraryDetail from './LibraryDetail';
import LibraryDetailWrapper from './LibraryDetailWrapper';
import Search from '~/components/Search';

const LibraryRoutes = ({
  setActionItems, setHeading, setShowBackBtn, onActionClick,
  setBackBtnPath, setBackBtnText, setActionItemIcon, setActionItemLabel,
}) => {
  const { path } = useRouteMatch();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes('search')) {
      setShowBackBtn(true);
      setBackBtnText('Mediathek');
      setBackBtnPath('/library');
      setHeading('Suche');
      setActionItems(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return (
    <Switch>
      <Route exact path={path}>
        <LibraryMain
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
      <Route path={`${path}/korrepetition`}>
        <LibraryDetailWrapper
          setHeading={setHeading}
          onActionClick={onActionClick}
          setBackBtnPath={setBackBtnPath}
          setBackBtnText={setBackBtnText}
          setShowBackBtn={setShowBackBtn}
          setActionItemIcon={setActionItemIcon}
          setActionItemLabel={setActionItemLabel}
          setActionItems={setActionItems}
          pageHeading="Korrepetition"
          listToDisplayVariables={{
            playerType: 'Korrepetition',
            sorting: { which: 'COMPOSER_LASTNAME', direction: 'ASC' },
          }}
        />
      </Route>
      <Route path={`${path}/band`}>
        <div className="lib">
          <LibraryDetail
            setHeading={setHeading}
            onActionClick={onActionClick}
            setBackBtnPath={setBackBtnPath}
            setShowBackBtn={setShowBackBtn}
            setBackBtnText={setBackBtnText}
            setActionItems={setActionItems}
            pageHeading="Bandplayer"
            listToDisplayVariables={{
              playerType: 'Ensemble_Band',
              sorting: { which: 'INTERPRETER', direction: 'ASC' },
            }}
          />
        </div>
      </Route>
      <Route path={`${path}/search`}>
        <Search
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

LibraryRoutes.propTypes = {
  setHeading: PropTypes.func,
  setBackBtnPath: PropTypes.func,
  setBackBtnText: PropTypes.func,
  onActionClick: PropTypes.func,
  setActionItemIcon: PropTypes.func,
  setActionItemLabel: PropTypes.func,
  setActionItems: PropTypes.func,
  setShowBackBtn: PropTypes.func,
};

LibraryRoutes.defaultProps = {
  setHeading: null,
  setBackBtnPath: null,
  setBackBtnText: null,
  onActionClick: null,
  setActionItemIcon: null,
  setActionItemLabel: null,
  setActionItems: null,
  setShowBackBtn: null,
};
export default LibraryRoutes;
