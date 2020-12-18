import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import {
  Dialog,
  TextButton,
  IconButton,
  DialogNormalHeader,
  DialogNormalBody,
  DialogNormalContentRow,
} from 'musiklernplattform-components';
import CloudDownloadOutlineIcon from '@iconify/icons-ion/cloud-download-outline';
import TrashIcon from '@iconify/icons-ion/trash-outline';
import AttachIcon from '@iconify/icons-ion/attach';
import ModalTextBox from '~/components/Generic/ModalComponents/ModalTextBox';
import { getComposerOrInterpreterName } from '~/constants/util';

const CardDetailModal = ({
  title, description, onClose, onSubmit, onDelete, cardId, attachments, canEdit, heading, laneId,
}) => {
  const history = useHistory();

  const [attachmentList, setAttachmentList] = useState([]);
  const [descriptionValue, setDescriptionValue] = useState(description);
  const [errorMsg, setErrorMsg] = useState(null);

  const downloadAttachment = () => {
    console.log('downloading');
  };
  useEffect(() => {
    const newAttachmentList = [];
    attachments.forEach((attachment, index) => {
      const newAttachment = {
        downloadAttachment: () => { downloadAttachment(attachment); },
        key: `attachment_${index}`,
      };
      switch (attachment.attachmentType) {
        case 'libElement': {
          newAttachment.title = `${getComposerOrInterpreterName(attachment)} - ${
            attachment.metaData.shortTitle}`;
          newAttachment.onClickFunc = () => { history.push(`/player/${attachment.playerPath}`); };
          break;
        }
        default: {
          // ...
        }
      }
      newAttachmentList.push(newAttachment);
    });
    setAttachmentList(newAttachmentList);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachments]);

  const closeForm = () => {
    onClose();
  };

  const submitForm = () => {
    if (descriptionValue.length < 2) {
      setErrorMsg('Die Beschreibung muss mindestens zwei Zeichen lang sein.');
      return;
    }
    if (descriptionValue === description) onSubmit(null);
    else onSubmit(null, descriptionValue, cardId, laneId);
  };

  const titleChangeHandler = (newvalue) => {
    // setTitleValue(newvalue);
    setErrorMsg('');
  };
  const descriptionChangeHandler = (newvalue) => {
    setDescriptionValue(newvalue);
    setErrorMsg('');
  };

  const addAttachment = () => {
    console.log('adding attachment');
  };

  const deleteCard = () => {
    onDelete(cardId);
  };
  return (
    <Dialog onClose={closeForm}>
      <DialogNormalHeader>
        <h3>
          {heading}
        </h3>
        <TextButton
          onClickHandler={canEdit ? submitForm : closeForm}
          title="Fertig"
        />
      </DialogNormalHeader>
      <DialogNormalBody>
        {errorMsg && <div className="errorField">{errorMsg}</div>}
        <DialogNormalContentRow>
          <ModalTextBox
            label="Beschreibung"
            value={descriptionValue}
            onInputChange={descriptionChangeHandler}
            isDisabled={!canEdit}
            isMultipleLine
          />

        </DialogNormalContentRow>
        <div className="padding-y">Anhänge</div>
        {attachmentList.length < 1
          ? <DialogNormalContentRow>Es sind keine Anhänge angefügt.</DialogNormalContentRow>
          : (
            <>
              {attachmentList.map((attachment) => (
                <>
                  <DialogNormalContentRow key={`${attachment.key}_1`}>
                    <div
                      role="link"
                      tabIndex="0"
                      onKeyDown={attachment.onClickFunc}
                      onClick={attachment.onClickFunc}
                      style={{
                        fontWeight: 'bold', fontSize: 18, color: 'rgba(10,132,255,1)', cursor: 'pointer',
                      }}
                    >
                      <span style={{ verticalAlign: 'top' }}>{attachment.title}</span>
                    </div>
                  </DialogNormalContentRow>
                </>
              ))}

            </>
          )}
        <DialogNormalContentRow>
          {attachmentList.length > 0
          && (
          <IconButton
            icon={CloudDownloadOutlineIcon}
            className="flex-row"
            label="Anhang Herunterladen"
            disabled
            removePadding
            onClickHandler={downloadAttachment}
          />
          )}
          {canEdit && (
            <IconButton
              icon={AttachIcon}
              className="flex-row"
              label="Anhang hinzufügen"
              disabled
              removePadding
              onClickHandler={addAttachment}
            />

          )}
          {onDelete !== null
         && (
           <IconButton
             icon={TrashIcon}
             className="flex-row"
             label="Diesen Eintrag Löschen"
             removePadding
             onClickHandler={deleteCard}
           />

         )}
        </DialogNormalContentRow>

      </DialogNormalBody>
    </Dialog>
  );
};

CardDetailModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  title: PropTypes.string,
  description: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  cardId: PropTypes.string,
  attachments: PropTypes.arrayOf(PropTypes.object),
  canEdit: PropTypes.bool,
  heading: PropTypes.string.isRequired,
  laneId: PropTypes.string,
};
CardDetailModal.defaultProps = {
  onDelete: null,
  title: '',
  attachments: [],
  canEdit: false,
  description: '',
  cardId: null,
  laneId: null,
};
export default CardDetailModal;
