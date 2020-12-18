import React, { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useHistory } from 'react-router-dom';
import SearchIcon from 'musiklernplattform-components/iconify/icon-suchen-active';
import PropTypes from 'prop-types';
import { plans, generateActionItem } from '~/constants/util';
import { SEARCH_LIB_ELEMENTS } from '~/constants/gql/lib';
import LoadingIndicator from '~/components/Generic/LoadingIndicator';
import LibItemsList from './LibItemsList';
import { usePlans } from '~/constants/hooks';

const Library = ({ setActionItems, setShowBackBtn, setHeading }) => {
  const history = useHistory();
  const { comparePlans } = usePlans();
  const LIMIT = 10;

  useEffect(() => {
    if (comparePlans([plans.TEACHER])) {
      setActionItems(
        generateActionItem(SearchIcon, true, 'Suche',
          () => history.push('/library/search')),
      );
    }
    setShowBackBtn(false);
    setHeading('Mediathek');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    loading: loadingKorr, data: dataKorr,
  } = useQuery(SEARCH_LIB_ELEMENTS, {
    variables: {
      playerType: 'Korrepetition',
      sorting: { which: 'COMPOSER_LASTNAME', direction: 'ASC' },
    },
    fetchPolicy: 'cache-and-network',
  });
  const {
    loading: loadingBand, data: dataBand,
  } = useQuery(SEARCH_LIB_ELEMENTS, {
    variables: {
      playerType: 'Ensemble_Band',
      sorting: { which: 'INTERPRETER', direction: 'ASC' },
    },
    fetchPolicy: 'cache-and-network',
  });
  if (loadingKorr || loadingBand) return <LoadingIndicator />;

  function getItemClickHandler(element) {
    return () => history.push(`/player/${element.playerPath}`);
  }

  const getMoreBtnData = (list, linkName) => {
    if (list.length > LIMIT) {
      return { title: 'Alle Werke', link: linkName };
    }
    return null;
  };

  if (loadingKorr || loadingBand) return <LoadingIndicator />;

  return (
    <div className="lib">
      <LibItemsList
        heading="Korrepetition"
        listStyle="row"
        list={(dataKorr || []).filterLibElements.slice(0, LIMIT)}
        getItemClickHandler={getItemClickHandler}
        getMoreBtnData={getMoreBtnData(dataKorr.filterLibElements, 'library/korrepetition')}
      />
      <LibItemsList
        heading="Bandplayer"
        listStyle="row"
        list={(dataBand || []).filterLibElements.slice(0, LIMIT)}
        getItemClickHandler={getItemClickHandler}
        getMoreBtnData={getMoreBtnData(dataBand.filterLibElements, 'library/band')}
      />

    </div>
  );
};
Library.propTypes = {
  setHeading: PropTypes.func,
  setActionItems: PropTypes.func,
  setShowBackBtn: PropTypes.func,
};

Library.defaultProps = {
  setHeading: null,
  setActionItems: null,
  setShowBackBtn: null,
};
export default Library;
