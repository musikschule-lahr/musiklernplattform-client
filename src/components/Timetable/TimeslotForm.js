// Temporary, as base for later implementations with overlay!

import React, {
  useState,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import {
  TextButton, Input,
  DialogNormalHeader,
  DialogNormalBody, DialogNormalContentRow, Dialog,
  MultiSelectList,
} from 'musiklernplattform-components';
import { useSortedManagementStudentGroupList } from '~/constants/hooks';
import LoadingIndicator from '~/components/Generic/LoadingIndicator';

const TimeslotForm = ({ onFormSubmit, onClose, day }) => {
  const sortedContactList = useSortedManagementStudentGroupList();

  const [contactList, setContactList] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [timeslotValue, setTimeslot] = useState('13:00');
  const [userGroupValue, setUserGroup] = useState(null);

  useEffect(() => {
    if (!contactList && sortedContactList) {
      setContactList(sortedContactList.contacts);
    }
  }, [contactList, sortedContactList]);

  function onSelectionChangeHandler(option) {
    setContactList(contactList.map((contact) => ({
      ...contact,
      selected: contact.key === option.key && contact.value === option.value,
    })));
    setUserGroup({ id: option.key, type: option.type });
  }

  function submitForm() {
    if (timeslotValue.length < 1 || !userGroupValue) {
      setErrorMsg('Die Werte sind ungültig');
    } else {
      onFormSubmit(timeslotValue, userGroupValue);
    }
  }

  if (!contactList) return <LoadingIndicator />;

  return (
    <Dialog onClose={onClose}>
      <DialogNormalHeader>
        <h4>Schüler*in/Gruppe hinzufügen</h4>
        <TextButton title="Fertig" onClickHandler={submitForm} />
      </DialogNormalHeader>
      <DialogNormalBody>
        {errorMsg && <div className="errorField">{errorMsg}</div>}
        <DialogNormalContentRow>
          <label>
            <div className="margin-y">
              <b>{day}</b>
              : Uhrzeit auswählen

            </div>
            <Input
              value={timeslotValue}
              type="time"
              name="TimeslotInput"
              id="TimeslotInput"
              onChangeHandler={setTimeslot}
              onClearHandler={() => setTimeslot('')}
            />
          </label>
        </DialogNormalContentRow>
        <DialogNormalContentRow>
          <div className="margin-y">Schüler*in/Gruppe auswählen</div>

          <div style={{ overflow: ' scroll', maxHeight: '30vh' }}>
            <MultiSelectList options={contactList} onChangeHandler={onSelectionChangeHandler} />
          </div>
        </DialogNormalContentRow>
      </DialogNormalBody>
    </Dialog>
  );
};

TimeslotForm.propTypes = {
  onFormSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  day: PropTypes.string.isRequired,
};

export default TimeslotForm;
