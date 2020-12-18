import React, { useState } from 'react';
import PropTypes from 'prop-types';
import LibraryDetail from './LibraryDetail';

const LibraryDetailWrapper = ({
  setActionItems, listToDisplayVariables, setShowBackBtn,
  setBackBtnText, setBackBtnPath, pageHeading, setHeading,
}) => {
  const [groupBy, setGroupBy] = useState('instruments');

  const toggleGroupView = () => {
    if (!groupBy) setGroupBy('instruments');
    else setGroupBy(null);
  };
  return (
    <div className="lib">
      <LibraryDetail
        setHeading={setHeading}
        firstElementCustomBtn={{
          title: (groupBy ? 'Alle anzeigen' : 'Nach Instrumenten gruppieren'),
          function: toggleGroupView,
        }}
        setBackBtnPath={setBackBtnPath}
        setBackBtnText={setBackBtnText}
        setShowBackBtn={setShowBackBtn}
        setActionItems={setActionItems}
        pageHeading={pageHeading}
        listToDisplayVariables={listToDisplayVariables}
        groupBy={groupBy}
      />
    </div>
  );
};
LibraryDetailWrapper.propTypes = {
  setHeading: PropTypes.func,
  setBackBtnPath: PropTypes.func,
  setBackBtnText: PropTypes.func,
  setActionItems: PropTypes.func,
  setShowBackBtn: PropTypes.func,
  // eslint-disable-next-line react/forbid-prop-types
  listToDisplayVariables: PropTypes.object,
  pageHeading: PropTypes.string,
};

LibraryDetailWrapper.defaultProps = {
  setHeading: null,
  setBackBtnPath: null,
  setBackBtnText: null,
  setActionItems: null,
  setShowBackBtn: null,
  listToDisplayVariables: null,
  pageHeading: '',
};
export default LibraryDetailWrapper;
