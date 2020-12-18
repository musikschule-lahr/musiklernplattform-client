import React, { useState, useRef, useEffect } from 'react';
import { useApolloClient, useQuery } from '@apollo/client';
import { useHistory } from 'react-router-dom';
import Search from './Search';
import { plans } from '~/constants/util';
import { SEARCH_LIB_ELEMENTS, GET_EPOCHS } from '~/constants/gql/lib';
import { GET_INSTRUMENTS } from '~/constants/gql/user';
import LoadingIndicator from '~/components/Generic/LoadingIndicator';
import { usePlans } from '~/constants/hooks';

const SearchWrapper = ({ setShowBackBtn, setBackBtnText, setBackBtnPath }) => {
  const { comparePlans } = usePlans();

  const client = useApolloClient();
  const history = useHistory();

  const [searchResult, setSearchResult] = useState(null);
  const [instruments, setInstruments] = useState([]);
  const [epochs, setEpochs] = useState([]);

  const { loading: loadingInstruments } = useQuery(GET_INSTRUMENTS,
    {
      onCompleted: (allInstruments) => {
        setInstruments(JSON.parse(JSON.stringify((allInstruments.getInstruments))));
      },
    });
  const { loading: loadingEpochs } = useQuery(GET_EPOCHS, {
    onCompleted: (epochResults) => {
      setEpochs(JSON.parse(JSON.stringify((epochResults.getEpochs))));
    },
  });

  useEffect(() => {
    if (comparePlans([plans.TEACHER])) {
      setBackBtnText('Mediathek');
      setShowBackBtn(true);
      setBackBtnPath('/library');
    }
  });

  const executeSearch = (variables) => new Promise((resolve, reject) => {
    client.query({
      query: SEARCH_LIB_ELEMENTS,
      variables,
      fetchPolicy: 'network-only',
    }).then((libData) => {
      setSearchResult(libData.data.filterLibElements);
      resolve();
    })
      .catch((err) => reject(err));
  });

  const onItemClick = (playerPath) => {
    history.push(`/player/${playerPath}`);
  };

  if (loadingInstruments || loadingEpochs) return <LoadingIndicator />;

  return (
    <Search
      className="remove-margin-left"
      executeSearch={executeSearch}
      searchResult={searchResult}
      instrumentList={instruments}
      epochList={epochs}
      onItemClick={onItemClick}
    />
  );
};

export default SearchWrapper;
