import React, {
} from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  TextButton,
  DialogSmallBody, DialogNormalHeader, DialogButtonRow,
} from 'musiklernplattform-components';

const AlertModal = ({
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
        <TextButton title="OK" onClickHandler={() => closeForm()} />
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

AlertModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  headerMsg: PropTypes.string.isRequired,
  bodyMsg: PropTypes.string,
};
AlertModal.defaultProps = {
  bodyMsg: '',
};
export default AlertModal;
