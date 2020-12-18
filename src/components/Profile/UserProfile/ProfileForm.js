import React, {
  useState, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  Dialog,
  TextButton,
  Button, MultiSelectList,
  Input, Accordion,
  DialogNormalHeader,
  DialogNormalBody, DialogNormalContentRow,
} from 'musiklernplattform-components';
import { useQuery, useApolloClient } from '@apollo/client';
import ModalTextBox from '~/components/Generic/ModalComponents/ModalTextBox';
import { GET_INSTRUMENTS } from '~/constants/gql/user';
import LoadingIndicator from '~/components/Generic/LoadingIndicator';

const ProfileForm = ({
  infoText, firstname, lastname, mail, phone, username,
  birthyear, instruments, onSubmit, onClose,
}) => {
  const client = useApolloClient();

  const [selected, setSelected] = useState(null);
  const [firstnameValue, setFirstname] = useState(firstname || '');
  const [lastnameValue, setLastname] = useState(lastname || '');
  const [mailValue, setMail] = useState(mail || '');
  const [phoneValue, setPhone] = useState(phone || '');
  const [usernameValue, setUsername] = useState(username || '');
  const [birthyearValue, setBirthyear] = useState(birthyear || 2020);
  const [fullInstruments, setFullInstruments] = useState([]);
  const [editedForm, setEditedForm] = useState({});
  const [instrumentGroups, setInstrumentGroups] = useState([]);

  const {
    loading: loadingInstruments, error: errorInstruments, data: allInstruments,
  } = useQuery(GET_INSTRUMENTS, { fetchPolicy: 'network-only' });

  useEffect(() => {
    const initial = {};
    if (firstname != null) initial.firstname = firstname;
    if (lastname != null) initial.lastname = lastname;
    if (mail != null) initial.mail = mail;
    if (phone != null) initial.phone = phone;
    if (username != null) initial.username = username;
    if (birthyear != null) initial.birthyear = `${birthyear}`;
    setEditedForm(initial);
  }, [birthyear, firstname, lastname, mail, phone, username]);

  useEffect(() => {
    setUsername(username);
  }, [username]);

  useEffect(() => {
    setFirstname(firstname);
  }, [firstname]);

  useEffect(() => {
    setLastname(lastname);
  }, [lastname]);

  useEffect(() => {
    setMail(mail);
  }, [mail]);

  useEffect(() => {
    setPhone(phone);
  }, [phone]);

  useEffect(() => {
    setBirthyear(birthyear);
  }, [birthyear]);

  useEffect(() => {
    if (allInstruments) {
      if (fullInstruments.length < 1) {
        const selectedList = Array(fullInstruments.length);
        const list = allInstruments.getInstruments;
        instruments.forEach((instrument) => {
          const found = list.findIndex((element) => parseInt(element.idInstrument, 10)
          === parseInt((instrument.idInstrument || instrument.id), 10));
          if (found > -1)selectedList[found] = true;
        });
        /*  if (list.length < 1) {
          setFullInstruments(list);
          setSelected(selectedList);
          return;
        } */
        /*
        const groups = [{ startIdx: 0, endIdx: 0, instrumentGroup: list[0].instrumentGroup }];
        list.forEach((instrument, idx) => {
          if (instrument.instrumentGroup !== groups[groups.length - 1].instrumentGroup) {
            if (idx - 1 > groups[groups.length - 1].endIdx) groups[groups.length - 1].endIdx = idx;
            groups.push({ startIdx: idx, endIdx: idx, instrumentGroup: instrument.instrumentGroup });
          }
          const found = instruments.findIndex((element) => parseInt(element.idInstrument, 10)
          === parseInt((instrument.idInstrument), 10));
          if (found > -1)selectedList[idx] = true;
        });
        if (list.length - 1 > groups[groups.length - 1].endIdx) groups[groups.length - 1].endIdx = list.length;
        instruments.forEach((instrument) => {
          const found = list.findIndex((element) => parseInt(element.idInstrument, 10)
          === parseInt((instrument.idInstrument || instrument.id), 10));
          if (found > -1)selectedList[found] = true;
        });
       setInstrumentGroups(groups); */
        setFullInstruments(list);
        setSelected(selectedList);
      }
    }
  }, [instruments, allInstruments, fullInstruments]);

  if (loadingInstruments) return (<LoadingIndicator />);
  if (errorInstruments) {
    return (<div>Ein Fehler ist aufgetreten... Versuche es noch einmal</div>);
  }
  // eslint-disable-next-line max-len
  const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

  const noContentError = (value) => (value < 1 ? 'Pflichtfeld.' : null);
  const wrongYearError = (value) => (!(`${
    value}` || '').match(/^(19|20)\d{2}$/) ? 'Dieses Feld muss eine Jahreszahl sein.' : null);
  const wrongPhoneError = (value) => {
    if(!value) return null;
    if (value.length < 1) return null;
    return (!(`${value}` || '').match(phoneRegExp)
      ? 'Dieses Feld muss eine gültige Telefonnummer sein.' : null);
  };

  const formFields = [
    {
      value: firstnameValue,
      name: 'firstname',
      label: 'Vorname',
      placeholder: 'Dein Vorname',
      setFunc: setFirstname,
      errorFunc: noContentError,
    },
    {
      value: lastnameValue,
      name: 'lastname',
      label: 'Nachname',
      placeholder: 'Dein Nachname',
      setFunc: setLastname,
      errorFunc: noContentError,
    },
    {
      value: usernameValue,
      name: 'username',
      label: 'Username',
      placeholder: 'Dein Username',
      setFunc: setUsername,
      errorFunc: noContentError,
    },
    {
      value: birthyearValue,
      name: 'birthyear',
      label: 'Geburtsjahr',
      placeholder: 'Dein Geburtsjahr',
      setFunc: setBirthyear,
      errorFunc: wrongYearError,
    },
    {
      value: mailValue,
      name: 'mail',
      label: 'E-Mail',
      disabled: true,
      placeholder: 'Deine E-Mail-Adresse',
      setFunc: setMail,
      errorFunc: noContentError,
    },
    {
      value: phoneValue,
      name: 'phone',
      label: 'Telefonnummer',
      placeholder: 'Deine Telefonnummer',
      setFunc: setPhone,
      errorFunc: wrongPhoneError,
    },
  ];

  function submitForm() {
    const instrumentAddList = [];
    fullInstruments.forEach((instrument, i) => {
      if (selected[i]) instrumentAddList.push({ id: instrument.idInstrument });
    });
    client.cache.writeQuery({
      query: GET_INSTRUMENTS,
      data: { getInstruments: fullInstruments },
    });
    const newEditedForm = { ...editedForm };
    if (editedForm.birthyear) {
      newEditedForm.birthyear = parseInt(newEditedForm.birthyear, 10);
    }
    if (editedForm.phone) {
      if (editedForm.phone.length < 1) editedForm.phone = null;
    }
    onSubmit({ ...newEditedForm, instruments: instrumentAddList });
  }

  function closeForm() {
    onClose();
  }

  function handleInstrumentChange(option) {
    const newFullInstruments = [];
    fullInstruments.forEach((instrument, i) => {
      const newInstrument = { ...instrument };
      if (newInstrument.idInstrument === option.key) {
        selected[i] = !selected[i];
      }
      newFullInstruments.push(newInstrument);
    });
    setFullInstruments(newFullInstruments);
  }

  function isError(fields) {
    let value = false;
    fields.forEach((field) => {
      if (field.errorFunc(field.value)) value = true;
    });
    return value;
  }

  return (
    <Dialog onClose={closeForm || null}>
      <DialogNormalHeader>
        <h4>Meine Profildaten</h4>
        {closeForm && <TextButton title="Schließen" onClickHandler={closeForm} />}
      </DialogNormalHeader>
      <DialogNormalBody className="">
        <form>
          <span>
            {infoText}
          </span>
          {formFields.map((field) => (
            <DialogNormalContentRow key={`${field.name}_inputField`}>
              <ModalTextBox
                label={field.label}
                value={field.value || ''}
                onInputChange={
                    (value) => {
                      field.setFunc(value);
                      const newForm = { ...editedForm };
                      newForm[field.name] = value;
                      setEditedForm(newForm);
                    }
                  }
                name={`${field.name}Input`}
                type={field.type || 'text'}
                id={`${field.name}Input`}
                disabled={field.disabled ? field.disabled : false}
                placeholder={field.placeholder}
                error={field.errorFunc(field.value || '')}
                isMultipleLine={false}
              />
            </DialogNormalContentRow>
          ))}
          Instrumente:
          <br />
          {/* instrumentGroups.map((group) => (
              <Accordion summary={group.instrumentGroup} key={`group_${group.instrumentGroup}`}>

                <MultiSelectList
                  options={fullInstruments.slice(group.startIdx, group.endIdx).map((instrument, i) => ({
                    key: instrument.idInstrument,
                    value: instrument.name,
                    selected: selected[group.startIdx + i],
                  }))}
                  onChangeHandler={handleInstrumentChange}
                />
              </Accordion>
                )) */}

          <MultiSelectList
            options={fullInstruments.map((instrument, i) => ({
              key: instrument.idInstrument,
              value: instrument.name,
              selected: selected[i],
            }))}
            onChangeHandler={handleInstrumentChange}
          />

          <br />
          <Button
            title="Fertig"
            name="submitBtn"
            type="submit"
            onClickHandler={submitForm}
            disabled={isError(formFields)}
          />
        </form>
      </DialogNormalBody>
    </Dialog>

  );
};
ProfileForm.propTypes = {
  firstname: PropTypes.string,
  lastname: PropTypes.string,
  mail: PropTypes.string,
  phone: PropTypes.string,
  username: PropTypes.string,
  birthyear: PropTypes.number,
  instruments: PropTypes.arrayOf(PropTypes.object),
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

ProfileForm.defaultProps = {
  firstname: null,
  lastname: null,
  mail: null,
  phone: null,
  username: null,
  birthyear: null,
  instruments: [],
};

export default ProfileForm;
