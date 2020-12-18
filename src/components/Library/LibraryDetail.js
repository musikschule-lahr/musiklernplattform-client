/* eslint-disable react/forbid-prop-types */
import React, { useEffect, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import SearchIcon from 'musiklernplattform-components/iconify/icon-suchen-active';
import { plans, generateActionItem } from '~/constants/util';
import { SEARCH_LIB_ELEMENTS } from '~/constants/gql/lib';
import { GET_INSTRUMENTS } from '~/constants/gql/user';
import { GET_KORREPETITION_GROUPED_INSTRUMENT } from '~/constants/gql/cache';

import LoadingIndicator from '~/components/Generic/LoadingIndicator';
import LibItemsList from './LibItemsList';
import { usePlans } from '~/constants/hooks';

const LibraryDetail = ({
  setActionItems, listToDisplayVariables, setShowBackBtn,
  setBackBtnText, setBackBtnPath, pageHeading, setHeading, groupBy,
  firstElementCustomBtn,
}) => {
  const client = useApolloClient();
  const history = useHistory();
  const { comparePlans } = usePlans();

  const [filteredLists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setShowBackBtn(true);
    setBackBtnText('Mediathek');
    setHeading(pageHeading);
    setBackBtnPath('/library');
    if (comparePlans([plans.TEACHER])) {
      setActionItems(
        generateActionItem(SearchIcon, true, 'Suche',
          () => history.push('/library/search')),
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLoading(true);
    client.query({
      query: SEARCH_LIB_ELEMENTS,
      variables: listToDisplayVariables,
      fetchPolicy: 'cache-first',
    }).then((data) => {
      const list = data.data;
      if (groupBy) {
        // Gehört hier so eigentlich nicht rein, aber als Grundlage für späteres vllt brauchbar
        switch (groupBy) {
          case 'instruments': {
            client.query({
              query: GET_KORREPETITION_GROUPED_INSTRUMENT,
              fetchPolicy: 'cache-only',
            }).then((cachedList) => {
              if (cachedList.data.getKorrepetitionGroupedInstrument.length < 1) {
                client.query({
                  query: GET_INSTRUMENTS,
                  fetchPolicy: 'cache-first',
                }).then((instrumentData) => {
                  const instruments = instrumentData.data.getInstruments.map((instrument) => (
                    {
                      heading: instrument.name,
                      id: instrument.idInstrument,
                      values: [],
                    }
                  ));
                  list.filterLibElements.forEach((libElement) => {
                    libElement.instruments.forEach((libInstrument) => {
                      // Filter Hauptinstrument Klavier...
                      if (libInstrument.idInstrument === 17) return;
                      instruments.some((instrument, index) => {
                        if (instrument.id === libInstrument.idInstrument) {
                          instruments[index].values.push(libElement);
                          return true;
                        }
                        return false;
                      });
                    });
                  });
                  client.writeQuery({
                    query: GET_KORREPETITION_GROUPED_INSTRUMENT,
                    data: { getKorrepetitionGroupedInstrument: instruments },
                  });
                  setLists(instruments);
                  setLoading(false);
                });
              } else {
                setLists(cachedList.data.getKorrepetitionGroupedInstrument);
                setLoading(false);
              }
            });

            break;
          }
          default: {
            const resultList = {};
            resultList.heading = pageHeading;
            resultList.values = list.filterLibElements;
            setLists([resultList]);
            setLoading(false);
          }
        }
      } else {
        const resultList = {};
        // resultList.heading = pageHeading;
        resultList.values = list.filterLibElements;
        setLists([resultList]);
        setLoading(false);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupBy, listToDisplayVariables]);

  if (loading) return <LoadingIndicator />;

  function getItemClickHandler(element) {
    return () => history.push(`/player/${element.playerPath}`);
  }

  function getRemainingList(list) {
    if (list.length > 1) return [...list].slice(1, list.length);
    else return [];
  }

  if (loading || !filteredLists) return <LoadingIndicator />;

  return (
    <>

      <LibItemsList
        key="libItems_0"
        getMoreBtnData={firstElementCustomBtn}
        heading={filteredLists[0].heading}
        listStyle="grid"
        list={filteredLists[0].values}
        getItemClickHandler={getItemClickHandler}
      />
      {getRemainingList(filteredLists).map((filteredList, index) => (
        <LibItemsList
          // eslint-disable-next-line react/no-array-index-key
          key={`libItems_${index}`}
          heading={filteredList.heading}
          listStyle="grid"
          list={filteredList.values}
          getItemClickHandler={getItemClickHandler}
        />
      ))}
    </>
  );
};

LibraryDetail.propTypes = {
  setHeading: PropTypes.func,
  setBackBtnPath: PropTypes.func,
  setBackBtnText: PropTypes.func,
  setActionItems: PropTypes.func,
  setShowBackBtn: PropTypes.func,
  listToDisplayVariables: PropTypes.object,
  pageHeading: PropTypes.string,
  groupBy: PropTypes.string,
};

LibraryDetail.defaultProps = {
  setHeading: null,
  setBackBtnPath: null,
  setBackBtnText: null,
  setActionItems: null,
  setShowBackBtn: null,
  listToDisplayVariables: null,
  pageHeading: '',
  groupBy: null,
};
export default LibraryDetail;
