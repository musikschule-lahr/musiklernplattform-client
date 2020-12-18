import React, {
} from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  TextButton,
  IconButton,
  DialogSmallBody, DialogNormalHeader, DialogButtonRow,
} from 'musiklernplattform-components';
import CloseIcon from '@iconify/icons-ion/close';

const ScannerInfo = ({
  name, roleName, lessonName, groupName, onSubmit, onClose,
}) => {
  const submitForm = () => {
    onSubmit();
  };
  const closeForm = () => {
    onClose();
  };
  // className="choiceModalHeader"
  return (
    <Dialog onClose={() => closeForm()}>
      <DialogNormalHeader>
        <h4>QR-Code gefunden!</h4>
        <IconButton
          icon={CloseIcon}
          onClickHandler={closeForm}
        />
      </DialogNormalHeader>
      <DialogSmallBody>
        <p>
          Möchtest du dich mit
          {` ${name} als ${roleName} ` }
          { lessonName && (`im Fach ${lessonName} `)}
          { groupName && (`im Ensemble ${groupName} `)}
          verbinden?
        </p>
        <DialogButtonRow>
          <TextButton
            className="centered"
            onClickHandler={submitForm}
            title="Ja"
          />
          <TextButton
            className="centered"
            onClickHandler={closeForm}
            title="Abbruch"
          />
        </DialogButtonRow>
      </DialogSmallBody>
    </Dialog>
  );
};

ScannerInfo.propTypes = {
  name: PropTypes.string.isRequired,
  roleName: PropTypes.string.isRequired,
  lessonName: PropTypes.string,
  groupName: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
ScannerInfo.defaultProps = {
  lessonName: null,
  groupName: null,
};

export default ScannerInfo;
