// Temporary, as base for later implementations with overlay!

import React, {
  useState,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { MultiSelectList } from 'musiklernplattform-components';
import useMatrix from '~/components/MatrixProvider/useMatrix';
import LoadingIndicator from '~/components/Generic/LoadingIndicator';

const MatrixRoomList = ({ onReceiverSelected, addMe }) => {
  const matrix = useMatrix();
  const [contactList, setContactList] = useState('');

  useEffect(() => {
    const roomList = matrix.getRooms();
    const list = roomList.map(
      (room, index) => ({
        value: `${room.info.title}: ${
          (room.type === 'direct' ? 'Direkter Chat' : 'Gruppenchat')}`,
        roomId: room.roomId,
        key: `room_${index}`,
      }),
    );
    setContactList(list);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSelectionChangeHandler(option) {
    setContactList(contactList.map((contact) => ({
      ...contact,
      selected: contact.key === option.key && contact.value === option.value,
    })));
    onReceiverSelected({ roomId: option.roomId });
  }

  if (!contactList) return <LoadingIndicator />;

  return (
    <MultiSelectList options={contactList} onChangeHandler={onSelectionChangeHandler} />
  );
};

MatrixRoomList.propTypes = {
  onReceiverSelected: PropTypes.func.isRequired,
  addMe: PropTypes.bool,
};
MatrixRoomList.defaultProps = {
  addMe: false,
};
export default MatrixRoomList;
