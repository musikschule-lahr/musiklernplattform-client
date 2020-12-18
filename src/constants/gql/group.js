import { gql } from '@apollo/client';
import { GroupFragments } from './fragments';

export const GET_GROUP = gql`
  query GetGroup($groupId: Int!){
    getGroup
    (
      where: {
        id: $groupId
      }
    )
    {
      ...GroupParts
    }
  }
  ${GroupFragments.general}
`;

export const GET_OWNED_GROUPS = gql`
  query GetOwnedGroups{
    getGroupsOfOwner
    {
      ...GroupParts
    }
  }
  ${GroupFragments.general}
`;
export const GET_MY_GROUPS = gql`
  query GetUserGroups{
    getGroupsOfUser
    {
      ...GroupParts
      owner {
        id: idUser,
        firstname,
        lastname
      }
    }
  }
  ${GroupFragments.general}
`;

export const ADD_GROUP = gql`
  mutation AddGroup($name: String!){
    addGroup (
      data: {
        name: $name
      }
    )
    {
      ...GroupParts
    }
  }
  ${GroupFragments.general}
`;

export const UPDATE_GROUP_USERS = gql`
  mutation updateGroupUsers($group: Int!, $addusers: [UserInput], $removeusers: [UserInput], $time: Date){
    updateGroupUsers (
      where: {
        id: $group
      },
      addusers: $addusers,
      removeusers : $removeusers
      time: $time
    )
    {
      ...GroupParts
    }
  }
  ${GroupFragments.general}
`;
export const REMOVE_GROUP = gql`
  mutation RemoveGroup($groupId: Int!){
    removeGroup (
      where: {
        id: $groupId
      }
    )
  }
`;

export const ADD_GROUP_MATRIX_ROOM = gql`
mutation AddGroupMatrixRoom($group: GroupInput!, $room: String!){
  addGroupMatrixRoom (
    where:$group,
    room: $room
  )
}
`;
export default {
  GET_GROUP,
  GET_OWNED_GROUPS,
  GET_MY_GROUPS,
  ADD_GROUP,
  UPDATE_GROUP_USERS,
};
