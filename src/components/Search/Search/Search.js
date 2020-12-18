import React, { useState, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import {
  SearchInput, TextButton, LibraryHorizontalList, LibraryItem, Row, Col,
} from 'musiklernplattform-components';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import AdvancedSearch from './AdvancedSearch';
import SortResults from './SortResults';
import { getFilePath } from '~/constants/util';

const SearchHeader = styled.div`
display: flex;
margin-left: -18px;
flex-direction: row;
width: 100%;
> div {
  width: 100%;
}
.searchHeaderSearchInput, .searchHeaderSearchInput > input{
width: 400px !important;
max-width: 100% !important;
}
.textAlignLeft {
  text-align: left !important;
}

`;
const Search = ({
  executeSearch, searchResult, instrumentList, epochList, onItemClick,
}) => {
  const [searching, _setSearching] = useState(false);
  const [searchInput, _setSearchInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSortResults, setShowSortResults] = useState(false);
  const [saveSelected, setSaveSelected] = useState({});

  const activeFilters = useRef({ data: null, count: 0 });
  const activeSorting = useRef({ data: { key: null } });
  const searchingRef = useRef(false);
  const searchInputRef = useRef(searchInput);

  const setSearching = (value) => {
    searchingRef.current = (value);
    _setSearching(value);
  };
  const setSearchInput = (value) => {
    searchInputRef.current = (value);
    _setSearchInput(value);
  };

  const doSearch = (filters, sorting) => {
    setSearching(true);
    const variables = { text: searchInputRef.current || '' };
    if (filters || activeFilters.current.data) {
      const usedFilters = filters || activeFilters.current.data;
      let count = 0;
      if (usedFilters.instruments) {
        const instruments = usedFilters.instruments.map(
          (instrument) => ({ id: instrument.key }),
        );
        count += usedFilters.instruments.length;
        variables.instruments = instruments;
      }
      if (usedFilters.epochs) {
        const epochs = usedFilters.epochs.map(
          (epoch) => ({ id: epoch.key }),
        );
        count += usedFilters.epochs.length;
        variables.epochs = epochs;
      }
      if (usedFilters.difficultyScale) {
        variables.difficulty = {
          min: usedFilters.difficultyScale.min,
          max: usedFilters.difficultyScale.max,
        };
        count += 1;
      }
      activeFilters.current.data = usedFilters;
      activeFilters.current.count = count;
    }
    if (sorting || activeSorting.current.data) {
      const usedSorting = sorting || activeSorting.current.data;
      activeSorting.current.data = usedSorting;
      variables.sorting = usedSorting.sortingValue;
    }
    executeSearch(variables).then(() => {
      setSearching(false);
    });
  };
  const debounced = useDebouncedCallback(
    (filters, sorting) => {
      doSearch(filters, sorting);
    },
    // delay in ms
    1000,
  );
  const onInputChangeHandler = (value) => {
    setSearchInput(value);
    debounced.callback();
  };
  const toggleAdvanced = () => {
    setShowAdvanced(!showAdvanced);
  };
  const toggleSorter = () => {
    setShowSortResults(!showSortResults);
  };
  const getItemClickHandler = (playerPath) => {
    onItemClick(playerPath);
  };

  const searchFiltered = (filters, sorting) => {
    debounced.callback(filters, sorting);
  };
  const setSaveSelectedFunc = (newSaveSelected) => {
    setSaveSelected(newSaveSelected);
  };

  const getSubtitle = (element) => {
    switch (element.playerType) {
      case 'Korrepetition': {
        if (element.metaData.composer) {
          return `${element.metaData.composer.firstname} ${element.metaData.composer.lastname}`;
        }
        return '';
      }
      case 'Ensemble_Band': {
        if (element.metaData.interpreter) return element.metaData.interpreter.name;
        return '';
      }
      default: {
        return '';
      }
    }
  };

  return (
    <>
      <SearchHeader>
        <Row breakpoint="md">
          <Col>
            <SearchInput
              className="searchHeaderSearchInput"
              value={searchInput}
              placeholder="Werk, Komponist oder Suchbegriff eingeben"
              onChangeHandler={onInputChangeHandler}
              inputStyle={{ width: 400 }}
            />

          </Col>
          <Col>
            <TextButton
              className="textAlignLeft"
              onClickHandler={toggleAdvanced}
              title={`Erweiterte Suche (${activeFilters.current.count} Filter aktiv)`}
            />
          </Col>
          {/* <Col>
            <TextButton
              className="textAlignLeft"
              style={{ marginLeft: 'auto' }}
              onClickHandler={toggleSorter}
              title="Sortieren nach"
            />
          </Col> */}

        </Row>
      </SearchHeader>
      <div className="search-advanced">
        {showAdvanced && (
        <AdvancedSearch
          style={{ marginLeft: 28 }}
          doSearch={searchFiltered}
          allInstruments={instrumentList}
          epochs={epochList}
          saveSelected={saveSelected}
          setSaveSelected={setSaveSelectedFunc}
        />
        )}
      </div>
      <div className="search-advanced">
        {showSortResults && (
        <SortResults
          style={{ marginLeft: 28 }}
          doSearch={searchFiltered}
          selected={activeSorting.current.data.key}
        />
        )}
      </div>
      <div className="search-content">
        {searching && 'Suche...'}
        {(searchResult && !searching)
        && (
        <>
          <span>
            {' '}
            {`Es wurden ${searchResult.length} Ergebnisse gefunden!`}
          </span>
          <LibraryHorizontalList>
            {(searchResult).map((element) => (
              <LibraryItem
                key={`fav_item_${element.idLibElement}`}
                title={element.metaData.shortTitle}
                subtitle={getSubtitle(element)}
                cover={element.metaData.coverImagePath ? getFilePath(
                  element.metaData.coverImagePath, element,
                ) : '/img/logo.png'}
                onClickHandler={() => getItemClickHandler(element.playerPath)}
              />
            ))}
          </LibraryHorizontalList>
        </>
        )}
      </div>
    </>
  );
};

Search.propTypes = {
  executeSearch: PropTypes.func.isRequired,
  searchResult: PropTypes.arrayOf(PropTypes.shape({
    playerPath: PropTypes.string.isRequired,
    metaData: PropTypes.shape({
      title: PropTypes.string.isRequired,
      composer: PropTypes.shape({
        firstname: PropTypes.string.isRequired,
        lastname: PropTypes.string.isRequired,
      }),
    }),
  })),
  instrumentList: PropTypes.arrayOf(PropTypes.shape({
    idInstrument: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    selected: PropTypes.bool,
  })),
  epochList: PropTypes.arrayOf(PropTypes.shape({
    idEpoch: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    selected: PropTypes.bool,
  })),
  onItemClick: PropTypes.func.isRequired,
};
Search.defaultProps = {
  searchResult: [],
  instrumentList: [],
  epochList: [],
};
export default Search;
