import React, {
  useState, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import {
  MultiSelectList,
  Dialog,
  DialogHeader,
  DialogBody,
  Button,
  Input,
  TabNav,
  NavItem, DialogNormalBody, DialogNormalHeader, DialogNormalContentRow,
  DialogButtonRow,
} from 'musiklernplattform-components';
import { useQuery } from '@apollo/client';
import { GET_INSTRUMENTS, GET_USER } from '~/constants/gql/user';
import LoadingIndicator from '~/components/Generic/LoadingIndicator';
import ModalTextBox from '~/components/Generic/ModalComponents/ModalTextBox';

const MyNavItem = ({ activeTab, setActiveTab, tabName }) => (
  <NavItem
    active={activeTab === tabName}
    onClickHandler={() => setActiveTab(tabName)}
  >
    {tabName}

  </NavItem>
);
MyNavItem.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  tabName: PropTypes.string.isRequired,
};

const ClassesForm = ({ onSubmitGroup, onSubmitLesson, onClose }) => {
  const [activeTab, setActiveTab] = useState('Fach');
  const [addedToTeachingList, setAddedToTeachingList] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [groupname, setGroupname] = useState('');
  const [instruments, setInstruments] = useState(null);

  const {
    loading: loadingInstruments, data: allInstruments,
  } = useQuery(GET_INSTRUMENTS);
  const { data: userData, loading: userLoading } = useQuery(GET_USER);

  useEffect(() => {
    if (allInstruments && !instruments && userData) {
      const instrumentList = [...allInstruments.getInstruments];
      const teachingList = [];
      userData.getUser.teachedInstruments.forEach((e) => {
        const found = instrumentList.findIndex((element) => element.idInstrument === e.idInstrument);
        instrumentList.splice(found, 1);
        teachingList.push(false);
      });
      setAddedToTeachingList(teachingList);
      setInstruments(instrumentList);
    }
  }, [userData, instruments, userLoading, allInstruments]);

  const submitFormLesson = () => {
    const selectedInstruments = [];
    instruments.forEach((instrument, i) => {
      if (addedToTeachingList[i]) selectedInstruments.push({ id: instrument.idInstrument });
    });
    onSubmitLesson(selectedInstruments);
  };

  const submitFormEnsemble = () => {
    if (groupname.length < 1) {
      setErrorMsg('Die Gruppe benötigt einen Namen.');
    } else onSubmitGroup(groupname);
  };
  const closeForm = () => {
    onClose();
  };

  function handleInstrumentChange(option) {
    const newList = [...addedToTeachingList];
    newList[option.index] = !newList[option.index];
    setAddedToTeachingList(newList);
  }

  if (loadingInstruments || userLoading) return <LoadingIndicator />;

  const renderLesson = () => (

    <div className="teacher-class-form-container">
      <form>
        <DialogNormalContentRow className="teacher-class-form-scrollable-form">
          {((instruments || []).length > 0)
            ? (
              <MultiSelectList
                options={instruments.map((instrument, i) => ({
                  key: instrument.idInstrument,
                  index: i,
                  value: instrument.name,
                  selected: addedToTeachingList[i],
                }))}
                onChangeHandler={handleInstrumentChange}
              />
            ) : <div>Es gibt keine Instrumente mehr, bitte legen Sie eine Gruppe an.</div>}
        </DialogNormalContentRow>
        <Button
          onClickHandler={() => submitFormLesson()}
          title="Fach erstellen"
        />
      </form>
    </div>
  );

  const renderGroup = () => (
    <div className="teacher-class-form-container">
      <form>
        {errorMsg && <div className="errorField">{errorMsg}</div>}
        <DialogNormalContentRow>

          <ModalTextBox
            label="Fach/ Gruppenname"
            value={groupname}
            name="SubjectInput"
            id="SubjectInput"
            placeholder="Name der neuen Gruppe"
            onInputChange={setGroupname}
          />
        </DialogNormalContentRow>
        <Button
          onClickHandler={submitFormEnsemble}
          title="Gruppe erstellen"
        />
      </form>
    </div>
  );
  const renderTab = () => {
    switch (activeTab) {
      case 'Fach':
        return renderLesson();
      case 'Gruppe':
        return renderGroup();
      default:
        return null;
    }
  };

  return (
    <Dialog className="teacher-class-form-dialog" onClose={() => closeForm()}>
      <DialogNormalHeader>
        <h4>Fach / Gruppe hinzufügen</h4>
        <Button title="Abbruch" onClickHandler={() => closeForm()} />
      </DialogNormalHeader>
      <DialogBody>
        <TabNav className="classes-form-tabnav">
          <MyNavItem activeTab={activeTab} setActiveTab={setActiveTab} tabName="Fach" />
          <MyNavItem activeTab={activeTab} setActiveTab={setActiveTab} tabName="Gruppe" />
        </TabNav>
        {renderTab()}
      </DialogBody>
    </Dialog>
  );
};

ClassesForm.propTypes = {
  onSubmitGroup: PropTypes.func.isRequired,
  onSubmitLesson: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ClassesForm;
