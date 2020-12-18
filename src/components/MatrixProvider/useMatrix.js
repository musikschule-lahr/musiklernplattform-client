/* eslint-disable default-case */
import {
  useContext, useEffect, useReducer,
} from 'react';
import { useApolloClient } from '@apollo/client';
import { TimelineWindow } from 'matrix-js-sdk';
import { useKeycloak } from '@react-keycloak/web';
import MatrixContext from './MatrixContext';
import { matrixConsts } from '~/constants/util';

function reducer(state, action) {
  if (action.addListener) {
    const { roomId, func } = action.addListener;
    if (!state.listeners.get(roomId)) {
      state.listeners.set(roomId, func);
    }
  } else if (action.removeListener) {
    const { roomId } = action.removeListener;
    if (state.listeners.get(roomId)) {
      state.listeners.delete(roomId);
    }
  }
  return state;
}

const useMatrix = () => {
  const apolloClient = useApolloClient();
  const context = useContext(MatrixContext);
  const { keycloak } = useKeycloak();

  const [state, dispatch] = useReducer(reducer, { listeners: new Map() });

  const removeAllListeners = () => {
    if (context.client) {
      context.client.removeAllListeners();
      const roomMemberEvent = context.getRoomMembershipEvent(context.client, apolloClient);
      context.client.on('RoomMember.membership',
        (event, member) => { roomMemberEvent(event, member); });
      context.client.on('sync', (roomState, prevState, res) => {
        switch (roomState) {
          case 'ERROR': {
            if (res.error.errcode === 'M_FORBIDDEN') {
              context.client.removeAllListeners();
              localStorage.removeItem('accesstoken');
              localStorage.removeItem('refreshtoken');
              localStorage.removeItem('matrixtoken');
              context.client.logout();
              keycloak.logout();
            }
            break;
          }
          default: {
          /// ...
          }
        }
      });
    }
  };

  const logout = () => {
    console.log('logout', logout);
    if (context.client) context.client.logout();
  };

  const getUserId = () => {
    if (context.client) {
      return context.client.getUserId();
    }
    throw new Error('matrix not initialized');
  };
  // Setters
  const setDisplayName = (name, onSuccess) => {
    if (context.client) {
      context.client.setDisplayName(name, onSuccess);
    }
  };

  const addNewRoom = async (userIds, roomName, isDirectChat) => {
    if (context.client) {
      const opts = {
        visibility: 'private',
        invite: userIds,
      };
      if (roomName) opts.name = roomName;
      const room = await context.client.createRoom(opts);
      console.log('created:', room);
      await context.client.setRoomTopic(room.room_id,
        (!isDirectChat ? matrixConsts.GROUP_ROOM_TYPE : matrixConsts.DIRECT_ROOM_TYPE));
      return room;
    }
    throw new Error('matrix not initialized');
  };
  const addUserToRoom = async (roomId, userId) => {
    if (context.client) {
      console.log('invite', roomId, userId);
      await context.client.invite(roomId, userId);
    } else throw new Error('matrix not initialized');
  };
  const removeUserFromRoom = async (roomId, userId) => {
    if (context.client) {
      console.log('removeUserFromRoom', roomId, userId);
      await context.client.kick(roomId, userId);
      return true;
    }
    throw new Error('matrix not initialized');
  };
  const leaveRoom = async (roomId) => {
    if (context.client) {
      console.log('leaving room', roomId);
      await context.client.leave(roomId, () => {});
      //     await context.client.forget(roomId, true); //should be triggered by leave watcher
      return;
    }
    throw new Error('matrix not initialized');
  };

  const getRooms = () => {
    if (context.client) {
      const rooms = context.client.getRooms();
      const roomList = [];
      const countsAsUnread = ['m.room.message'];
      const pushToList = (room) => {
        if (room.currentState.getStateEvents('m.room.topic', '')) {
          // Initializing unread: https://github.com/matrix-org/matrix-js-sdk/issues/997
          let unreadcount = 0;
          const eventHistory = [...room.timeline];
          const receipts = room._receipts['m.read'][context.client.getUserId()];
          if (receipts) {
            const lastRead = receipts.eventId;
            while (eventHistory.length > 0) {
              const event = eventHistory[eventHistory.length - 1];
              if (event.getId() === lastRead) {
                break;
              }
              if (countsAsUnread.includes(event.getType()))unreadcount += 1;
              eventHistory.pop();
            }
          }
          room.setUnreadNotificationCount('total', unreadcount);

          if (room.summary.info.title.match(/@\w{8}(-\w{4}){3}-\w{12}/g)) {
            console.log('User ist noch nicht verfügbar...');
            // TODO: Auslesen Name in DB und ersetzen
            return;
          }
          roomList.push({
            ...room.summary,
            unreadCount: unreadcount || 0,
            type: room.currentState.getStateEvents('m.room.topic', '').getContent().topic,
          });
        }
      };
      rooms.forEach((room) => {
        console.log('room', room, room.getMember(context.client.getUserId()));
        if (room.getMember(context.client.getUserId()).membership !== 'leave')pushToList(room);
      });
      return roomList;
    }
    throw new Error('matrix not initialized');
  };

  const roomsListener = (event, onEvent) => {
    switch (event.getType()) {
      case 'm.room.message': {
        onEvent(event.getRoomId(), {
          unreadCount: context.client.getRoom(event.getRoomId()).getUnreadNotificationCount(),
        });
        break;
      }
      case 'my.deeplink': {
        onEvent(event.getRoomId(), {
          unreadCount: context.client.getRoom(event.getRoomId()).getUnreadNotificationCount(),
        });
        break;
      }
      case 'm.room.member': {
        // TODO: Vllt genauer filtern
        if (event.getContent().membership === 'join' || event.getContent().membership === 'leave') {
          onEvent(event.getRoomId(), {
            reloadRooms: true,
          });
        }
      }
    }
  };
  const getRoomsStateListener = (onEvent) => {
    if (context.client) {
      return context.client.on('event', (event) => roomsListener(event, onEvent));
    }
    throw new Error('matrix not initialized');
  };

  const getRoom = async (roomId) => {
    if (context.client) {
      const room = await context.client.getRoom(roomId, { timelineSupport: true });
      const tl = new TimelineWindow(context.client, room, {});
      await tl.load(null, 0);
      return { room, timeline: tl };
    }
    throw new Error('matrix not initialized');
  };

  const roomListener = (roomId, onEvent) => (event) => {
    if (event.getRoomId() === roomId) {
      onEvent(event);
    }
  };
  // wir erlauben erstmal nur einen messagelistener pro raum, macht das removen auch leichter
  const getRoomListener = (roomId, onEvent) => {
    if (context.client) {
      if (!state.listeners.get(roomId)) {
        const gotRoomListener = roomListener(roomId, onEvent);
        const gotRoomListenerWrapper = (event) => { gotRoomListener(event); };
        dispatch({ addListener: { roomId, func: gotRoomListenerWrapper } });
        context.client.on('Room.timeline', gotRoomListenerWrapper);
      }
      return new Error('roomListener already exists, should delete first');
    }
    throw new Error('matrix not initialized');
  };
  const removeRoomListener = async (roomId) => {
    if (context.client) {
      if (state.listeners.get(roomId)) {
        await context.client.removeListener('Room.timeline', state.listeners.get(roomId));
        dispatch({ removeListener: { roomId } });
      }
      return;
    }
    throw new Error('matrix not initialized');
  };
  const sendRoomMessage = (roomId, message, onSuccess, onError) => {
    if (context.client) {
      context.client.sendMessage(roomId, {
        body: message,
        msgtype: 'm.text',
      }).then((res) => {
        onSuccess(res);
      }).catch((err) => {
        onError(err);
      });
      return;
    }
    throw new Error('matrix not initialized');
  };

  const sendRoomDeeplink = (roomId, message, title, link, onSuccess, onError) => {
    if (context.client) {
      context.client.sendMessage(roomId, {
        body: message,
        msgtype: 'm.text',
      }).then(() => {
        context.client.sendEvent(roomId, 'my.deeplink', {
          body: '', title, link,
        });
      }).then((res) => {
        onSuccess(res);
      })
        .catch((err) => {
          onError(err);
        });
      return;
    }
    throw new Error('matrix not initialized');
  };

  const sendReadReceipt = async (event, roomId) => {
    context.client.getRoom(roomId).setUnreadNotificationCount('total', 0);
    await context.client.sendReadReceipt(event);
  };
  return {
    logout,
    getUserId,
    getRooms,
    getRoom,
    getRoomsStateListener,
    addNewRoom,
    getRoomListener,
    removeRoomListener,
    sendRoomMessage,
    setDisplayName,
    addUserToRoom,
    removeUserFromRoom,
    leaveRoom,
    sendReadReceipt,
    sendRoomDeeplink,
    removeAllListeners,
  };
};

export default useMatrix;
