import React, {
} from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  TextButton,
  DialogSmallBody, DialogNormalHeader, DialogButtonRow,
} from 'musiklernplattform-components';

const ResultInfoModal = ({
  headerMsg, bodyMsg, onClose,
}) => {
  const closeForm = () => {
    onClose();
  };

  return (
    <Dialog onClose={() => closeForm()}>
      <DialogNormalHeader>
        <h4>
          {headerMsg}
        </h4>
      </DialogNormalHeader>
      <DialogSmallBody>
        <p>
          {bodyMsg}
        </p>
        <DialogButtonRow>
          <TextButton
          // eslint-disable-next-line react/jsx-no-bind
            onClickHandler={closeForm}
            title="OK"
          />
        </DialogButtonRow>
      </DialogSmallBody>
    </Dialog>
  );
};

ResultInfoModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  headerMsg: PropTypes.string.isRequired,
  bodyMsg: PropTypes.string,
};
ResultInfoModal.defaultProps = {
  bodyMsg: '',
};
export default ResultInfoModal;
