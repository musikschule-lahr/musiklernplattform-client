import React, { useState, useRef, useEffect } from 'react';
import {
  Button, MultiSelectList,
} from 'musiklernplattform-components';
import PropTypes from 'prop-types';

const SortResults = ({ selected, doSearch }) => {
  const [sortingList, setSortingList] = useState([]);

  const lastPickedIdx = useRef(selected);

  useEffect(() => {
    const sortingOptions = [
      {
        key: 0,
        value: 'Titel, aufsteigend',
        selected: false,
        sortingValue: { which: 'TITLE', direction: 'ASC' },
      },
      {
        key: 1,
        value: 'Titel, absteigend',
        selected: false,
        sortingValue: { which: 'TITLE', direction: 'DESC' },
      },
      {
        key: 2,
        value: 'Komponistname, aufsteigend',
        selected: false,
        sortingValue: { which: 'COMPOSER', direction: 'ASC' },
      },
      {
        key: 3,
        value: 'Komponistname, absteigend',
        selected: false,
        sortingValue: { which: 'COMPOSER', direction: 'DESC' },
      },
      {
        key: 4,
        value: 'Niedrigster Schwierigkeitsgrad, aufsteigend',
        selected: false,
        sortingValue: { which: 'DIFFICULTYLOWER', direction: 'ASC' },
      },
      {
        key: 5,
        value: 'Niedrigster Schwierigkeitsgrad, absteigend',
        selected: false,
        sortingValue: { which: 'DIFFICULTYLOWER', direction: 'DESC' },
      },
      {
        key: 6,
        value: 'Höchster Schwierigkeitsgrad, aufsteigend',
        selected: false,
        sortingValue: { which: 'DIFFICULTYHIGHER', direction: 'ASC' },
      },
      {
        key: 7,
        value: 'Höchster Schwierigkeitsgrad, absteigend',
        selected: false,
        sortingValue: { which: 'DIFFICULTYHIGHER', direction: 'DESC' },
      },
    ];
    if (selected) {
      sortingOptions[selected].selected = true;
      lastPickedIdx.current = selected;
    }
    setSortingList(sortingOptions);
  }, [selected]);

  const handleSelectedSortingChange = (picked) => {
    const newSortingList = [...sortingList];
    if (typeof lastPickedIdx.current === 'number') { newSortingList[lastPickedIdx.current].selected = false; }
    newSortingList[picked.key].selected = true;
    lastPickedIdx.current = picked.key;
    setSortingList(newSortingList);
  };

  const searchSorted = () => {
    if (lastPickedIdx.current) {
      doSearch(null, sortingList[lastPickedIdx.current]);
    }
  };

  return (
    <div className="search">
      <h4>Sortieren</h4>

      <MultiSelectList
        options={sortingList}
        onChangeHandler={handleSelectedSortingChange}
      />
      <Button
        title="Suchen"
        type="submit"
        onClickHandler={searchSorted}
      />
    </div>
  );
};
SortResults.propTypes = {
  doSearch: PropTypes.func.isRequired,
  selected: PropTypes.number,
};
SortResults.defaultProps = {
  selected: null,
};
export default React.memo(SortResults);
