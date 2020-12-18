import React, {
  useEffect, useState, useCallback, useRef,
} from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  TextButton,
  DialogNormalHeader,
  DialogNormalBody,
  DialogNormalContentRow,
} from 'musiklernplattform-components';
import AttachmentItem from '~/components/Generic/ModalComponents/AttachmentItem';
import LibItemTextBox from '~/components/Generic/ModalComponents/ModalTextBox';
import ReceiverList from '~/components/Generic/ModalComponents/ReceiverList';
import MatrixRoomList from '~/components/Generic/ModalComponents/MatrixRoomList';
import { libItemOptionsConstants, getComposerOrInterpreterName } from '~/constants/util';
import LoadingIndicator from '~/components/Generic/LoadingIndicator';

const LibItemOptionsModal = ({
  onSubmit, onClose, libItemOption, heading, submitBtnText, libItem,
}) => {
  const [currentValues, _setCurrentValues] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [libItemSetting, _setLibItemSetting] = useState(null);

  const currentValuesRef = useRef(currentValues);
  const libItemSettingRef = useRef(libItemSetting);

  const setCurrentValues = (data) => {
    currentValuesRef.current = data;
    _setCurrentValues(data);
  };
  const setLibItemSetting = (data) => {
    libItemSettingRef.current = data;
    _setLibItemSetting(data);
  };

  const currentValueChangeHandler = useCallback((key, value) => {
    const newValues = { ...currentValuesRef.current };
    newValues[key] = value;
    setCurrentValues(newValues);
  }, []);

  useEffect(() => {
    const libItemSettings = {
      [libItemOptionsConstants.SHARE_MSG]: [
        {
          component: <LibItemTextBox
            className="w-100"
            onInputChange={
              (value) => currentValueChangeHandler('message', value)
            }
            isMultipleLine={false}
            label="1. Nachricht schreiben"
          />,
          index: 1,
        },
        {
          component: <MatrixRoomList
            onReceiverSelected={
              (value) => currentValueChangeHandler('receiver', value)
            }
          />,
          heading: 'Empfänger auswählen',
          index: 2,
        },
      ],
      [libItemOptionsConstants.CREATE_TODO]: [
      /*  {
          component: <LibItemTextBox
            className="w-100"
            onInputChange={
              (value) => currentValueChangeHandler('title', value)
            }
            isMultipleLine={false}
          />,
          heading: 'Titel',
          index: 1,
        }, */
        {
          component: <LibItemTextBox
            className="w-100"
            onInputChange={
              (value) => currentValueChangeHandler('description', value)
            }
            isMultipleLine={false}
            label="1. Beschreibung"
          />,
          index: 1,
        },
        {
          component: <ReceiverList
            addMe
            onReceiverSelected={
              (value) => currentValueChangeHandler('receiver', value)
            }
          />,
          heading: 'Empfänger auswählen',
          index: 2,
        },
      ],
      [libItemOptionsConstants.ADD_COLLECTION]: [
        {
          component: <AttachmentItem
            name={`${getComposerOrInterpreterName(libItem)} - ${libItem.metaData.title}`}
          />,
          index: 0,
          isNoInput: true,
        },
        /* {
          component: <LibItemTextBox
            className="w-100"
            onInputChange={
              (value) => currentValueChangeHandler('title', value)
            }
            isMultipleLine={false}
          />,
          heading: 'Titel',
          index: 1,
        }, */
        {
          component: <LibItemTextBox
            className="w-100"
            label="1. Beschreibung"
            onInputChange={
              (value) => currentValueChangeHandler('description', value)
            }
            isMultipleLine={false}
          />,
          index: 1,
        },
      ],
    };
    if (libItemSettings[libItemOption]) setLibItemSetting(libItemSettings[libItemOption]);
    else onClose();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libItemOption]);

  const submitFormHandler = () => {
    if (libItemSettingRef.current.filter(
      (item) => !item.isNoInput,
    ).length !== Object.keys(currentValuesRef.current).length) {
      setErrorMsg('Es fehlen noch Eingaben.');
      return;
    }
    onSubmit(libItemOption, currentValuesRef.current);
  };
  const closeForm = () => {
    onClose();
  };
  if (!libItemSetting) return <LoadingIndicator />;
  return (
    <Dialog onClose={closeForm}>
      <DialogNormalHeader className="">
        <h4>{heading}</h4>
        <TextButton
          className="centered"
          onClickHandler={submitFormHandler}
          title={submitBtnText}
        />
      </DialogNormalHeader>
      <DialogNormalBody>
        {errorMsg && <div className="errorField">{errorMsg}</div>}
        {libItemSetting.map((item) => (
          <DialogNormalContentRow key={`libitem_${item.index}`}>
            {item.heading && <div className="margin-y">{`${item.index}. ${item.heading}`}</div> }
            {item.component}
          </DialogNormalContentRow>
        ))}
      </DialogNormalBody>
    </Dialog>
  );
};

LibItemOptionsModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  heading: PropTypes.string.isRequired,
  submitBtnText: PropTypes.string.isRequired,
  libItemOption: PropTypes.number.isRequired,
  libItem: PropTypes.shape({
    metaData: PropTypes.shape({
      composer: PropTypes.shape({
        firstname: PropTypes.string.isRequired,
        lastname: PropTypes.string.isRequired,
      }),
      title: PropTypes.string.isRequired,
    }),
  }),
};
LibItemOptionsModal.defaultProps = {
  libItem: null,
};

export default LibItemOptionsModal;
