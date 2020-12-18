import React, {
} from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogSmallHeader,
  DialogSmallBody,
  DialogButtonRow,
  TextButton,
} from 'musiklernplattform-components';

const ChoiceModal = ({
  headerMsg, message, onClose, onSubmit,
  submitText, closeText, children,
}) => (
  <Dialog onClose={onClose}>
    <DialogSmallHeader className="choiceModalHeader">
      <h4>
        {headerMsg}
      </h4>
    </DialogSmallHeader>
    <DialogSmallBody>
      <p style={{ whiteSpace: 'pre-wrap' }}>
        {message}
        {children}
      </p>
      <DialogButtonRow>
        <TextButton
          // eslint-disable-next-line react/jsx-no-bind
          onClickHandler={onSubmit}
          title={submitText}
        />
        <TextButton
          // eslint-disable-next-line react/jsx-no-bind
          onClickHandler={onClose}
          title={closeText}
        />
      </DialogButtonRow>

    </DialogSmallBody>
  </Dialog>
);

ChoiceModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitText: PropTypes.string.isRequired,
  closeText: PropTypes.string.isRequired,
  headerMsg: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  children: PropTypes.node,
};

ChoiceModal.defaultProps = {
  children: null,
};

export default ChoiceModal;
