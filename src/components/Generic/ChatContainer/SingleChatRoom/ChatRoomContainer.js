/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, {
  useEffect, useState, useRef,
} from 'react';
import { ChatLane } from 'musiklernplattform-components';
import PropTypes from 'prop-types';
import useMatrix from '~/components/MatrixProvider/useMatrix';
import Room from '../ChatRoom';
import LoadingIndicator from '~/components/Generic/LoadingIndicator';

const ChatRoomContainer = ({ roomId }) => {
  const matrix = useMatrix();
  const [heading, setHeading] = useState('Neue Nachrichten');
  const [sendMsg, _setSendMsg] = useState('');

  const sendMsgRef = useRef('');

  const setSendMsg = (value) => {
    sendMsgRef.current = value;
    _setSendMsg(value);
  };

  useEffect(() => (() => {
    matrix.removeAllListeners();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  useEffect(() => {
    matrix.getRoom(roomId).then(({ room: gotRoom }) => {
      setHeading(gotRoom.summary.info.title);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const onSendMsgChangeHandler = (input) => {
    setSendMsg(input);
  };
  const sendMessage = () => {
    matrix.sendRoomMessage(roomId, sendMsg, () => {
      setSendMsg('');
    },
    (err) => { console.log(err); });
  };

  if (!heading) return <LoadingIndicator />;

  return (
    <ChatLane
      heading={heading}
      showMessageField
      childrenIsChatLaneContent
      onMessageChangeHandler={onSendMsgChangeHandler}
      onMessageSendHandler={sendMessage}
      messageInputValue={sendMsg}
    >
      <Room roomId={roomId} />
    </ChatLane>
  );
};
ChatRoomContainer.propTypes = {
  roomId: PropTypes.string.isRequired,
};
export default ChatRoomContainer;
/*
{messages.map((message, index) => (
        <ChatCard
          key={`message_${message.unformattedDate}`}
          messageType={message.isSender ? 'outgoing' : 'incoming'}
          description={message.content}
          time={message.date}
        />
      ))}

<Link key={`message_${index}`} to={`/player/${message.deeplinkData.link}`}>
                <ChatCard
                  messageType={message.isSender ? 'outgoing' : 'incoming'}
                  description={message.content}
                  time={message.date}
                />
              </Link>
              */
