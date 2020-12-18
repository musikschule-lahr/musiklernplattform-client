import React, { useState, useRef, useEffect } from 'react';
import {
  Button, MultiSelectList, Accordion, ToggleSwitch, RangeSlider, TextButton,
} from 'musiklernplattform-components';
import PropTypes from 'prop-types';
import LoadingIndicator from '~/components/Generic/LoadingIndicator';

const AdvancedSearch = ({
  doSearch, allInstruments, epochs, style, setSaveSelected, saveSelected,
}) => {
  const [checked, setChecked] = useState(false);
  const [difficultyScale, setDifficultyScale] = useState(3);
  const [instrumentList, setInstrumentList] = useState(null);
  const [epochList, setEpochList] = useState(null);

  const selectedInstruments = useRef([]);
  const selectedEpochs = useRef([]);

  useEffect(() => {
    if (allInstruments) {
      setInstrumentList(allInstruments);
    }
  }, [allInstruments]);

  useEffect(() => {
    if (saveSelected) {
      if (saveSelected.instruments && selectedInstruments.current.length < 1) {
        selectedInstruments.current = saveSelected.instruments;
      }
      if (saveSelected.epochs && selectedEpochs.current.length < 1) {
        selectedEpochs.current = saveSelected.epochs;
      }
    }
  }, [saveSelected]);
  useEffect(() => {
    if (epochs) {
      setEpochList(epochs);
    }
  }, [epochs]);

  function handleInstrumentChange(option) {
    const newInstrumentList = [...instrumentList];
    newInstrumentList.some((instrument, index) => {
      if (instrument.idInstrument === option.key) {
        if (!newInstrumentList[index].selected)selectedInstruments.current.push(option);
        else {
          selectedInstruments.current.some((selected, selectedIdx) => {
            if (selected.key === instrument.idInstrument) {
              selectedInstruments.current.splice(selectedIdx, 1);
            }
            return selected.key === instrument.idInstrument;
          });
        }
        newInstrumentList[index].selected = !newInstrumentList[index].selected;
      }
      setSaveSelected({ instruments: selectedInstruments.current, epochs: selectedEpochs.current });
      return instrument.idInstrument === option.key;
    });
    setInstrumentList(newInstrumentList);
  }

  function handleEpochChange(option) {
    const newEpochList = [...epochList];
    newEpochList.some((epoch, index) => {
      if (epoch.idEpoch === option.key) {
        if (!newEpochList[index].selected)selectedEpochs.current.push(option);
        else {
          selectedEpochs.current.some((selected, selectedIdx) => {
            if (selected.key === epoch.idEpoch) {
              selectedEpochs.current.splice(selectedIdx, 1);
            }
            return selected.key === epoch.idEpoch;
          });
        }
        newEpochList[index].selected = !newEpochList[index].selected;
      }
      setSaveSelected({ instruments: selectedInstruments.current, epochs: selectedEpochs.current });
      return epoch.idEpoch === option.key;
    });
    setEpochList(newEpochList);
  }

  function handleDifficultyChange(value) {
    setDifficultyScale(value);
    setChecked(true);
  }

  function searchFiltered() {
    const filters = {};
    if (selectedInstruments.current.length > 0) {
      filters.instruments = selectedInstruments.current;
    }
    if (selectedEpochs.current.length > 0) {
      filters.epochs = selectedEpochs.current;
    }
    if (checked) {
      filters.difficultyScale = {
        min: parseInt(difficultyScale, 10),
        max: parseInt(difficultyScale, 10),
      };
    }
    doSearch(filters, null);
  }

  function clearFiltered() {
    selectedInstruments.current = [];
    selectedEpochs.current = [];
    setInstrumentList(allInstruments);
    setEpochList(epochs);
    setDifficultyScale(1);
  }
  return (
    <>
      <h2 className="removeMarginBottom">Erweiterte Suche</h2>
      <span className="subtitle">Grenze deine Suche genauer ein</span>
      <div />
      <Accordion removePaddingLeft summary={`Instrument (${selectedInstruments.current.length})`}>
        <div className="margin-y">
          <label>
            {/* <span>Instrument</span> */}
            {instrumentList
              ? (
                <MultiSelectList
                  options={instrumentList.map((instrument, i) => ({
                    key: instrument.idInstrument,
                    value: instrument.name,
                    selected: instrument.selected,
                  }))}
                  onChangeHandler={handleInstrumentChange}
                />
              ) : <LoadingIndicator />}
          </label>
        </div>
      </Accordion>
      <Accordion removePaddingLeft summary={`Schwierigkeitsgrad: ${checked ? `${difficultyScale}` : '/'}`}>
        <div className="margin-y">
          <TextButton
            onClickHandler={() => setChecked(!checked)}
            title={checked ? 'Filter nicht mehr anwenden' : 'Filter anwenden'}
          />
          <div className="flex-row">
            <label className="margin-x">
              1
            </label>
            <RangeSlider
              minValue={1}
              maxValue={5}
              value={parseInt(difficultyScale, 10)}
              step={1}
              onChangeHandler={handleDifficultyChange}
              filled
              filledFromCenter
            />
            <label className="margin-x">
              5
            </label>
          </div>

        </div>
      </Accordion>
      <Accordion removePaddingLeft summary={`Epoche (${selectedEpochs.current.length})`}>
        <div className="margin-y">
          <label>
            {epochList
              ? (
                <MultiSelectList
                  options={epochList.map((epoch, i) => ({
                    key: epoch.idEpoch,
                    value: `${epoch.description}`,
                    selected: epoch.selected,
                  }))}
                  onChangeHandler={handleEpochChange}
                />
              ) : <LoadingIndicator />}
          </label>
        </div>
      </Accordion>
      <br />
      <Button
        title="Suchen"
        type="submit"
        className="marginRight"
        onClickHandler={searchFiltered}
      />
      <Button
        title="Reset"
        type="submit"
        onClickHandler={clearFiltered}
      />
    </>
  );
};

AdvancedSearch.propTypes = {
  doSearch: PropTypes.func.isRequired,
  allInstruments: PropTypes.arrayOf(PropTypes.shape({
    idInstrument: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    selected: PropTypes.bool,
  })),
  epochs: PropTypes.arrayOf(PropTypes.shape({
    idEpoch: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    selected: PropTypes.bool,
  })),
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  setSaveSelected: PropTypes.func.isRequired,
  saveSelected: PropTypes.shape(
    {
      // eslint-disable-next-line react/forbid-prop-types
      instruments: PropTypes.array,
      // eslint-disable-next-line react/forbid-prop-types
      epochs: PropTypes.array,
    },
  ),
};
AdvancedSearch.defaultProps = {
  allInstruments: [],
  epochs: [],
  style: {},
  saveSelected: {},
};
export default React.memo(AdvancedSearch);
