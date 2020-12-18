import React, {
} from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  TextButton,
  IconButton,
  DialogNormalHeader,
  DialogNormalBody,
} from 'musiklernplattform-components';
import styled from 'styled-components';
import ShareOutlineIcon from '@iconify/icons-ion/share-outline';
import StarIcon from '@iconify/icons-ion/ios-star';
import StarOutlineIcon from '@iconify/icons-ion/ios-star-outline';
import CloudDownloadOutlineIcon from '@iconify/icons-ion/cloud-download-outline';
import CreateOutlineIcon from '@iconify/icons-ion/create-outline';
import FileTrayOutlineIcon from '@iconify/icons-ion/file-tray-full-outline';
import InfoOutlineIcon from '@iconify/icons-ion/information-circle-outline';
import HelpOutlineIcon from '@iconify/icons-ion/help-circle-outline';
import TrashIcon from '@iconify/icons-ion/trash-outline';
import { libItemOptionsConstants } from '~/constants/util';

const OptionsModal = ({
  onSubmit, onClose, isFavorite, isDownloaded,
}) => {
  const submitForm = (itemConstant) => {
    onSubmit(itemConstant);
  };
  const closeForm = () => {
    onClose();
  };
  // choiceModalHeader
  return (
    <Dialog onClose={closeForm}>
      <DialogNormalHeader>
        <h4>Optionen</h4>
        <TextButton
          onClickHandler={closeForm}
          title="Fertig"
        />
      </DialogNormalHeader>
      <DialogNormalBody>
        {!isFavorite
          ? (
            <IconButton
              icon={StarOutlineIcon}
              className="flex-row"
              label="Favorit markieren"
              disabled
              onClickHandler={() => submitForm(libItemOptionsConstants.ADD_FAVORITE)}
            />
          )
          : (
            <IconButton
              icon={StarIcon}
              className="flex-row"
              label="Favorit löschen"
              disabled
              onClickHandler={() => submitForm(libItemOptionsConstants.REMOVE_FAVORITE)}
            />
          )}
        {!isDownloaded ? (
          <IconButton
            icon={CloudDownloadOutlineIcon}
            className="flex-row"
            label="Herunterladen"
            disabled
            onClickHandler={() => submitForm(libItemOptionsConstants.DOWNLOAD)}
          />
        ) : (
          <IconButton
            icon={TrashIcon}
            className="flex-row"
            label="Löschen"
            disabled
            onClickHandler={() => submitForm(libItemOptionsConstants.REMOVE_DOWNLOAD)}
          />
        )}

        <IconButton
          icon={ShareOutlineIcon}
          className="flex-row"
          label="Teilen als Nachricht"
          onClickHandler={() => submitForm(libItemOptionsConstants.SHARE_MSG)}
        />
        <IconButton
          icon={CreateOutlineIcon}
          className="flex-row"
          label='"To Do" erstellen'
          onClickHandler={() => submitForm(libItemOptionsConstants.CREATE_TODO)}
        />
        <IconButton
          icon={FileTrayOutlineIcon}
          className="flex-row"
          label='"Meine Sammlung" hinzufügen'
          onClickHandler={() => submitForm(libItemOptionsConstants.ADD_COLLECTION)}
        />
        <IconButton
          icon={InfoOutlineIcon}
          className="flex-row"
          label="Credits"
          onClickHandler={() => submitForm(libItemOptionsConstants.OPEN_INFO)}
        />
        <IconButton
          icon={HelpOutlineIcon}
          className="flex-row"
          label="Bedienungshilfe"
          disabled
          onClickHandler={() => submitForm(libItemOptionsConstants.OPEN_HELP)}
        />
      </DialogNormalBody>
    </Dialog>
  );
};

OptionsModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isFavorite: PropTypes.bool,
  isDownloaded: PropTypes.bool,
};
OptionsModal.defaultProps = {
  isFavorite: false,
  isDownloaded: false,
};

export default OptionsModal;
