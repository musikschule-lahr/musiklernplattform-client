import React, {
} from 'react';
import PropTypes from 'prop-types';
import QRCode from 'react-qr-code';
import {
  Dialog,
  DialogSmallBody,
  DialogNormalHeader,
  TextButton,
} from 'musiklernplattform-components';

const ScannerInfo = ({
  content, onClose,
}) => {
  const closeForm = () => {
    onClose();
  };

  return (
    <Dialog onClose={() => closeForm()}>
      <DialogNormalHeader>
        <h4>Dein QR-Code!</h4>
        <TextButton title="Schließen" onClickHandler={() => closeForm()} />
      </DialogNormalHeader>
      <DialogSmallBody>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ padding: '18px', background: 'white' }}>
            <QRCode size={256} value={content} />
          </div>

        </div>
      </DialogSmallBody>
    </Dialog>
  );
};

ScannerInfo.propTypes = {
  content: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ScannerInfo;
