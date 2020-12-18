/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, {
  useEffect, useState, useRef,
} from 'react';
import {
  TextButton, ChatCard, ChatLaneContent, ChatDateIndicator,
} from 'musiklernplattform-components';
import moment from 'moment';
import { Link } from 'react-router-dom';
import useMatrix from '~/components/MatrixProvider/useMatrix';
import LoadingIndicator from '~/components/Generic/LoadingIndicator';

const ChatContainer = ({ roomId }) => {
  const matrix = useMatrix();
  const [room, _setRoom] = useState(null);
  const [messages, _setMessages] = useState([]);
  const [messageComponents, _setMessageComponents] = useState([]);
  const [paginationIsEnabled, setPaginationIsEnabled] = useState(true);

  const roomRef = useRef(room);
  const messagesRef = useRef(messages);
  const messagesEndRef = useRef();
  const messageComponentsRef = useRef();
  const timeline = useRef(null);
  const timelineInitiated = useRef(false);

  const setRoom = (data) => {
    roomRef.current = data;
    _setRoom(data);
  };
  const setMessages = (data) => {
    messagesRef.current = data;
    _setMessages(data);
  };

  const setMessageComponents = (data) => {
    messageComponentsRef.current = data;
    _setMessageComponents(data);
  };

  // reduce an array of events and filter out messages, return array of message objects for UI
  const parseEventsToMessages = (tlEvents) => {
    let eventList = [];
    eventList = tlEvents.reduce((events, event) => {
      if (event.getType() === 'm.room.message' || event.getType() === 'type.deeplink'
      ) {
        if (event.getContent()) {
          return events.concat({
            name: event.sender.name,
            isSender: event.sender.userId === matrix.getUserId(),
            date: moment(event.getDate()).format('HH:mm'),
            unformattedDate: event.getDate(),
            content: (event.getType() === 'type.deeplink') ? event.getContent().title : event.getContent().body,
            deeplinkData: (event.getType() === 'type.deeplink') ? {
              title: event.getContent().title,
              link: event.getContent().link,
            } : null,
          });
        } return events;
      }
      return events;
    }, eventList);
    return eventList;
  };

  // if event is a message, return parsed object for UI
  // eslint-disable-next-line consistent-return
  const parseEventToMessages = (event) => {
    if (event.getContent()) {
      return {
        name: event.sender.name,
        isSender: event.sender.userId === matrix.getUserId(),
        date: moment(event.getDate()).format('HH:mm'),
        unformattedDate: event.getDate(),
        content: event.getContent().body,
        deeplinkData: (event.getType() === 'type.deeplink') ? {
          title: event.getContent().title,
          link: event.getContent().link,
        } : null,
      };
    }
  };

  const generateChatLaneComponents = (messageList, messageBefore) => {
    let lastDate = null;
    if (messageBefore)lastDate = moment(messageBefore.unformattedDate).format('YYYY-MM-DD');
    const newMsg = [];
    messageList.forEach((msg) => {
      const firstDate = moment(msg.unformattedDate).format('YYYY-MM-DD');
      if (lastDate) {
        if (moment(lastDate).isBefore(moment(firstDate))) {
          newMsg.push(
            <ChatDateIndicator
              messageType="datetime"
              key={`datetime${msg.unformattedDate}`}
              description={moment(msg.unformattedDate).format('ddd, DD. MMM.')}
            />,
          );
        }
      } else {
        newMsg.push(<ChatDateIndicator
          messageType="datetime"
          key={`datetime${msg.unformattedDate}`}
          description={moment(msg.unformattedDate).format('ddd, DD. MMM.')}
        />);
      }
      let { content } = msg;
      if (msg.deeplinkData) {
        content = <Link to={`/player/${msg.deeplinkData.link}`}>{content}</Link>;
      }
      newMsg.push(<ChatCard
        key={`message_${msg.unformattedDate}`}
        messageType={msg.isSender ? 'outgoing' : 'incoming'}
        author={msg.isSender ? null : msg.name}
        description={content}
        time={msg.date}
      />);
      lastDate = firstDate;
    });
    return newMsg;
  };

  // append a new message & send read receipt
  const updateMessages = (event) => {
    if (!timelineInitiated.current) {
      return;
    }
    // event was NOT from timeline backwards navigation -> we update these somewhere else
    if (messagesRef.current.length > 0) {
      if (event.getDate().getTime() < messagesRef.current[0].unformattedDate.getTime()) {
        return;
      }
    }
    const eventMsgs = parseEventToMessages(event);
    const newMessageList = [...messagesRef.current, eventMsgs];
    const updatedComponents = generateChatLaneComponents([eventMsgs],
      messagesRef.current[messagesRef.current.length - 1]);
    const newComponents = [...messageComponentsRef.current, ...updatedComponents];
    setMessageComponents(newComponents);
    setMessages(newMessageList);
    setTimeout(() => {
      messagesEndRef.current.scrollIntoView();
    }, 100);
    matrix.sendReadReceipt(event, roomId);
  };

  // generic room update function, paginates the timeline
  // forward for every event so we don't have to reload full timeline
  const onRoomUpdate = (event) => {
    if (event.getType() === 'm.room.message') {
      updateMessages(event);
    } else if (event.getType() === 'type.deeplink') {
      updateMessages(event);
    }
    timeline.current.paginate('f', 1);
  };

  // every selected room change: update room listeners
  useEffect(() => {
    setRoom(null);
    setMessages([]);
    timelineInitiated.current = false;
    timeline.current = null;
    matrix.getRoom(roomId).then(({ room: gotRoom, timeline: tl }) => {
      setRoom(gotRoom);
      timeline.current = tl;
      matrix.getRoomListener(roomId, onRoomUpdate);
      tl.load(null, 20).then(() => {
        const msgList = parseEventsToMessages(tl.getEvents());
        setMessages(msgList);
        const components = generateChatLaneComponents(msgList);
        setMessageComponents(components);
        timelineInitiated.current = true;
        matrix.sendReadReceipt(tl.getEvents()[tl.getEvents().length - 1], roomId);
      });
    });
    return () => {
      matrix.removeRoomListener(roomId, onRoomUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  useEffect(() => {
    if (room) {
      messagesEndRef.current = document.querySelector('#messagesEnd');
      setTimeout(() => {
        messagesEndRef.current.scrollIntoView();
      }, 100);
    }
  }, [room]);

  // paginate count event backwards, does not filter event types,
  // meaning it can be count read receipts instead of new messages...
  const paginateBackwards = () => {
    const beforeLen = timeline.current.getEvents().length;
    if (timeline.current.canPaginate('b')) {
      timeline.current.paginate('b', 20).then(() => {
        const newLen = timeline.current.getEvents().length - beforeLen;
        const msgList = parseEventsToMessages(timeline.current.getEvents().slice(0, newLen));

        const updatedComponents = generateChatLaneComponents(msgList);
        const oldComponents = [...messageComponentsRef.current];
        if (msgList.length > 0) {
          const lastOfPaginatedDate = moment(
            msgList[msgList.length - 1].unformattedDate,
          ).format('YYYY-MM-DD');
          const currentMsgsFirstDate = moment(
            messagesRef.current[0].unformattedDate,
          ).format('YYYY-MM-DD');
          if (moment(lastOfPaginatedDate).isSame(moment(currentMsgsFirstDate))) {
            oldComponents.shift(); // first component is always time when paginating backwards
          }
        }
        setMessageComponents([...updatedComponents, ...oldComponents]);

        setMessages(msgList.concat(messagesRef.current));
        setPaginationIsEnabled(timeline.current.canPaginate('b'));
      });
    }
  };

  if (!room) return <LoadingIndicator />;

  return (
    <ChatLaneContent
      heading={room.summary.info.title}
    >
      <TextButton
        className="centered"
        onClickHandler={paginateBackwards}
        title="Vorherige Laden"
        disabled={!paginationIsEnabled}
      />
      {messageComponents}
      <div id="messagesEnd" />

    </ChatLaneContent>
  );
};
export default ChatContainer;
