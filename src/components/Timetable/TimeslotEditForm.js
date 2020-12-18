// Temporary, as base for later implementations with overlay!

import React, {
  useState,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import {
  TextButton, Input, Dialog, DialogNormalHeader,
  DialogNormalBody, DialogNormalContentRow, DialogButtonRow,
} from 'musiklernplattform-components';

const TimeslotEditForm = ({
  onClose, headerMsg, message, onSubmit, timeslotInitial, onDelete,
  day,
}) => {
  const [errorMsg, setErrorMsg] = useState(null);
  const [timeslotValue, setTimeslot] = useState();
  useEffect(() => {
    if (timeslotInitial)setTimeslot(timeslotInitial);
  }, [timeslotInitial]);
  function submitForm() {
    if (timeslotValue.length < 1) {
      setErrorMsg('Die Werte sind ungültig');
    } else {
      onSubmit(timeslotValue);
    }
  }
  const updateTimeslot = (value) => {
    setTimeslot(value);
  };
  const deleteCard = () => {
    onDelete();
  };
  return (
    <Dialog onClose={onClose}>
      <DialogNormalHeader>
        <h4>
          {headerMsg}
        </h4>
      </DialogNormalHeader>
      <DialogNormalBody>
        <div>
          {message}
          <br />
          {errorMsg && (
            <div className="errorField">
              {errorMsg}
              <br />
            </div>
          )}
          <DialogNormalContentRow>
            <label>
              <div className="margin-y">{`${day}: Uhrzeit eingeben`}</div>
              <Input
                value={timeslotValue}
                type="time"
                name="TimeslotInput"
                id="TimeslotInput"
                onChangeHandler={updateTimeslot}
              />
            </label>
          </DialogNormalContentRow>

          <DialogButtonRow>

            <TextButton
              onClickHandler={submitForm}
              title="Speichern"
            />
            <TextButton
              onClickHandler={deleteCard}
              title="Eintrag löschen"
            />
            <TextButton
              onClickHandler={onClose}
              title="Abbrechen"
            />
          </DialogButtonRow>
        </div>
      </DialogNormalBody>
    </Dialog>
  );
};

TimeslotEditForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  day: PropTypes.string.isRequired,
};

export default TimeslotEditForm;
