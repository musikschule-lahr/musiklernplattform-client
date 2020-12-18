/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, {
  useEffect, useState, useRef, useCallback,
} from 'react';
import { ChatLane, ChatRoomCard } from 'musiklernplattform-components';
import useMatrix from '~/components/MatrixProvider/useMatrix';
import Room from '../ChatRoom';

const ChatContainer = () => {
  const matrix = useMatrix();
  const [heading, setHeading] = useState('Neue Nachrichten');
  const [roomsComponents, setRoomsComponents] = useState([]);
  const [roomsList, _setRoomsList] = useState([]);
  const [selected, _setSelected] = useState(null);
  const [sendMsg, _setSendMsg] = useState('');

  const roomsListRef = useRef(roomsList);
  const selectedRef = useRef(selected);
  const sendMsgRef = useRef('');

  const setRoomsList = (data) => {
    roomsListRef.current = data;
    _setRoomsList(data);
  };

  const setSelected = (data) => {
    selectedRef.current = data;
    _setSelected(data);
  };

  const setSendMsg = (value) => {
    sendMsgRef.current = value;
    _setSendMsg(value);
  };

  const roomsListener = (room, data) => {
    if (data.reloadRooms) {
      const newRoomList = matrix.getRooms() || [];
      setRoomsList(newRoomList);
    } else if (room !== (selectedRef.current)) {
      const listCopy = [...roomsListRef.current];
      const index = listCopy.findIndex((item) => item.roomId === room);
      listCopy[index].unreadCount = data.unreadCount;
      setRoomsList(listCopy);
    }
  };
  // On initial render: get all rooms, initiate listener for all rooms events (for unread count)
  useEffect(() => {
    const roomList = matrix.getRooms() || [];
    setRoomsList(roomList);
    matrix.getRoomsStateListener(roomsListener);
    return (() => {
      matrix.removeAllListeners();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // select another room, update unread count & set current
  const selectRoom = useCallback((room) => {
    setSelected(room.roomId);
    const listCopy = [...roomsListRef.current];
    const index = listCopy.findIndex((item) => item.roomId === room.roomId);
    listCopy[index].unreadCount = 0;
    setRoomsList(listCopy);
    setHeading(room.info.title);
  }, [roomsListRef]);

  useEffect(() => {
    const newComponents = roomsList.map((room) => (
      <ChatRoomCard
        key={`room_${room.roomId}`}
        roomType={room.type}
        attachementCount={room.unreadCount > 0 ? room.unreadCount : null}
        title={room.info.title}
        onClickHandler={() => selectRoom(room)}
      />
    ));
    setRoomsComponents(newComponents);
  }, [roomsList, selectRoom]);

  const onSendMsgChangeHandler = (input) => {
    setSendMsg(input);
  };
  const sendMessage = () => {
    matrix.sendRoomMessage(selected, sendMsg, () => {
      setSendMsg('');
    },
    (err) => { console.log(err); });
  };

  return (
    <ChatLane
      isRoomList={!selected}
      showMessageField={selected !== null}
      onBackBtnClick={() => {
        setSelected(null);
        setHeading('Neue Nachrichten');
      }}
      heading={heading}
      childrenIsChatLaneContent={selected !== null}
      onMessageChangeHandler={onSendMsgChangeHandler}
      onMessageSendHandler={sendMessage}
      messageInputValue={sendMsg}
    >
      {selected ? (<Room roomId={selected} />)
        : roomsComponents}
    </ChatLane>
  );
};
export default ChatContainer;
