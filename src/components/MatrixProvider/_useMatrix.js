import {
  useContext, useEffect, useReducer,
} from 'react';

// Empty useMatrix
const useMatrix = () => {
  const getUserId = () => {

  };
  // Setters
  const setDisplayName = () => {

  };

  const addNewRoom = async (userIds, roomName, isDirectChat) => {

  };
  const addUserToRoom = async (roomId, userId) => {

  };
  const removeUserFromRoom = async (roomId, userId) => {

  };
  const leaveRoom = async (roomId) => {

  };

  const getRooms = () => {

  };

  const roomsListener = (event, onEvent) => {

  };
  const getRoomsStateListener = (onEvent) => {

  };

  const getRoom = async (roomId) => {

  };

  const roomListener = (roomId, onEvent) => (event) => {

  };
  // wir erlauben erstmal nur einen messagelistener pro raum, macht das removen auch leichter
  const getRoomListener = (roomId, onEvent) => {

  };
  const removeRoomListener = async (roomId) => {

  };
  const sendRoomMessage = (roomId, message, onSuccess, onError) => {

  };

  const sendReadReceipt = async (event) => {
  };
  const sendRoomDeeplink = async (event) => {
  };
  const removeAllListeners = async (event) => {
  };
  const logout = async (event) => {
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
