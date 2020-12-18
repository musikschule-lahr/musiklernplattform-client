import React from 'react';
import { IconButton } from 'musiklernplattform-components';
import moment from 'moment';
import { ADD_GROUP_MATRIX_ROOM } from '~/constants/gql/group';
import { ADD_MATRIX_ROOMS } from '~/constants/gql/relations';

export const getDayFromEnum = (value) => {
  const days = {
    MONDAY: 'Montag',
    TUESDAY: 'Dienstag',
    WEDNESDAY: 'Mittwoch',
    THURSDAY: 'Donnerstag',
    FRIDAY: 'Freitag',
    SATURDAY: 'Samstag',
    SUNDAY: 'Sonntag',
  };
  return (days[value.toUpperCase()]);
};

export const plans = {
  NONE: 0,
  STUDENT: 1,
  TEACHER: 2,
  PARENT: 3,
  OFFICE: 4,
};

export const formatDate = (dateString) => moment(dateString).format('DD.MM.YYYY');

export const unfreeze = (value) => JSON.parse(JSON.stringify(value));

export const generateActionItem = (icon, enabled, label, onClickHandler) => (
  <IconButton
    icon={icon}
    style={{ justifyContent: 'center' }}
    disabled={!enabled || false}
    label={label}
    onClickHandler={() => onClickHandler()}
  />
);

export const QR = {
  TEACHER_LESSON: 1,
  TEACHER_GROUP: 2,
  PARENT: 3,
  OFFICE: 4,
  DELIMITER: ';',
};

export const matrixConsts = {
  DIRECT_ROOM_TYPE: 'direct',
  GROUP_ROOM_TYPE: 'group',
  ADMIN_POWER_LEVEL: 100,
  USER_POWER_LEVEL: 0,
};

export const libItemOptionsConstants = {
  ADD_FAVORITE: 0,
  REMOVE_FAVORITE: 1,
  DOWNLOAD: 2,
  REMOVE_DOWNLOAD: 3,
  SHARE_MSG: 4,
  CREATE_TODO: 5,
  ADD_COLLECTION: 6,
  OPEN_HELP: 7,
  OPEN_INFO: 8,
};

export const getComposerOrInterpreterName = (element) => {
  switch (element.playerType) {
    case 'Korrepetition': {
      if (element.metaData.composer) {
        return `${
          element.metaData.composer.firstname} ${element.metaData.composer.lastname}`;
      }
      return '';
    }
    case 'Ensemble_Band': {
      if (element.metaData.interpreter) return element.metaData.interpreter.name;
      return '';
    }
    default: {
      return '';
    }
  }
};

export const getFilePath = (name, libElement) => `${
  process.env.FILE_SERVER_BASE_URL}${libElement.productionNo.replace(/-/g, '_')}/${name}`;

export const checkGroupsAndAddRooms = async (list, matrix, client) => {
  const addRoomCheck = async (group) => new Promise((resolve, reject) => {
    if (group.matrixRoomId === null) {
      matrix.addNewRoom([], group.name, false).then((newRoom) => {
        if (!newRoom) reject(false);
        client.mutate({
          mutation: ADD_GROUP_MATRIX_ROOM,
          variables: {
            group: { id: parseInt(group.idGroup, 10) },
            room: newRoom.room_id,
          },
        });
        // not too many concurrent requests
        setTimeout(() => { resolve(true); }, 3000);
      });
    } else {
      resolve(false);
    }
  });
  let didChange = false;

  const groupList = (Array.isArray(list) ? list : [list]);
  // Kein parallel, da zu viele Requests passieren können = matrix error
  return new Promise((resolve, reject) => {
    groupList.forEach(async (group, index) => {
      const changed = await addRoomCheck(group);
      if (changed) didChange = true;
      if (index === groupList.length - 1)resolve(didChange);
    });
  });
};

export const checkRelatedAndAddRooms = async (list, createRoom, roomId, matrix, client) => {
  const addRelatedCheck = async (relation) => new Promise((resolve, reject) => {
    if (createRoom) {
      console.log('addroom', relation);
      matrix.addNewRoom([relation.matrixUserName],
        null, true).then((newRoom) => {
        if (!newRoom) return;
        client.mutate({
          mutation: ADD_MATRIX_ROOMS,
          variables: {
            user: { id: parseInt(relation.userid, 10) },
            room: newRoom.room_id,
          },
        }).then(() => {
          setTimeout(() => { resolve(true); }, 3000);
        });
      });
      setTimeout(() => { resolve(true); }, 3000);
    } else if (roomId) {
      console.log('joinroom', roomId);
      client.mutate({
        mutation: ADD_MATRIX_ROOMS,
        variables: {
          user: { id: parseInt(relation.userid, 10) },
          room: roomId,
        },
      }).then(() => {
        setTimeout(() => { resolve(true); }, 3000);
      });
    } else resolve();
  });

  let didChange = false;

  const relatedList = (Array.isArray(list) ? list : [list]);
  // Kein parallel, da zu viele Requests passieren können = matrix error
  return new Promise((resolve, reject) => {
    relatedList.forEach(async (item, index) => {
      const changed = await addRelatedCheck(item);
      if (changed) didChange = true;
      if (index === relatedList.length - 1)resolve(didChange);
    });
  });
};

export const getContentHeight = () => {
  const height = document.querySelector('.contentProvider');
  if (!height) return 300;
  return height.offsetHeight - 18;
};
export default {
  plans,
  getDayFromEnum,
  generateActionItem,
  libItemOptionsConstants,
  getComposerOrInterpreterName,
  getFilePath,
  checkGroupsAndAddRooms,
  checkRelatedAndAddRooms,
  getContentHeight,
};
